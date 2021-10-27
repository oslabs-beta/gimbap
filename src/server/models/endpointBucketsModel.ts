import mongoose from 'mongoose';
import { ChangeStream } from 'mongodb';

import { EndpointModel, Endpoint, getAllEndpoints } from './../../shared/models/endpointModel';
import { vectorizeEndpoints } from './../utils/endpoints';

// TODO abstract so it can work with either MongoDB or PostgreSQL depending on how setup is called.

export type EndpointBuckets = {
  method: string,
  endpoint: string,
  buckets: number[],
  lastEndpointId: number,
};

const FORCED_UPDATE_TIMEOUT = 5 * 60 * 1000;
export const NUM_DAILY_DIVISIONS = 24 * 2;
export const MIN_NUM_CHANGES_TO_UPDATE = 100;
let updateCounter = 0;
let changeStream: ChangeStream<mongoose.Model<Endpoint>> | null = null;

// cache of active timeouts with key being method + endpoint
let timeoutHandles: { [key: string]: NodeJS.Timeout } = Object.create(null);


const EndpointBucketsSchema = new mongoose.Schema<EndpointBuckets>({
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  buckets: { type: [Number], required: true },
  lastEndpointId: { type: Number, required: true },
});
export const EndpointBucketsModel = mongoose.model<EndpointBuckets>('EndpointBuckets', EndpointBucketsSchema);

/**
 * Close the ChangeStream watching EndpointModel.
 * 
 * @public
 */
export async function stopWatchingEndpointModel(): Promise<void> {
  // clear all timeouts
  for (const timeoutHandle of Object.values(timeoutHandles)) {
    clearTimeout(timeoutHandle);
  }
  timeoutHandles = Object.create(null);

  if (changeStream !== null) changeStream.close();
  changeStream = null;
}

/**
 * Initiate the ChangeStream watching EndpointModel.
 * 
 * @public
 */
export function startWatchingEndpointModel(): void {
  if (changeStream !== null) return;

  updateCounter = 0;
  changeStream = EndpointModel.watch<typeof EndpointModel>();

  changeStream.on('change', change => {
    if (change.operationType !== 'insert' || !change.fullDocument) return;

    updateCounter++;
    const key: string = change.fullDocument.method + change.fullDocument.endpoint;
    if (updateCounter === MIN_NUM_CHANGES_TO_UPDATE) {
      updateCounter = 0;

      // remove timeout if it was already set
      if (timeoutHandles[key]) {
        clearTimeout(timeoutHandles[key]);
        delete timeoutHandles[key];
      }

      updateEndpointBuckets(change.fullDocument.method, change.fullDocument.endpoint);
    } else {
      // set timeout if it does not already exist
      if (!timeoutHandles[key]) timeoutHandles[key] = setTimeout(() => {
        if (change.fullDocument) updateEndpointBuckets(change.fullDocument.method, change.fullDocument.endpoint);
      }, FORCED_UPDATE_TIMEOUT);
    }
  });
}

/**
 * Get EndpointBuckets for a particular route from the database. Forces an update if there is no endpoint buckets in database.
 * 
 * @param {String} method - HTTP method type
 * @param {String} endpoint - HTTP request relative endpoint
 * @returns EndpointBuckets for that route, or null if no data exists for that route
 */
export async function getEndpointBuckets(method: string, endpoint: string): Promise<EndpointBuckets | null> {
  let endpointBuckets: EndpointBuckets | null = await EndpointBucketsModel.findOne({ method, endpoint });

  // if no data has been calculated, force an update and check again
  if (endpointBuckets === null) {
    await updateEndpointBuckets(method, endpoint);
    endpointBuckets = await EndpointBucketsModel.findOne({ method, endpoint });
  }

  return endpointBuckets;
}

/**
 * Get current endpoint buckets, get endpoints pushed to database since last update, recalculate buckets and push update to database.
 * 
 * @param {String} method - HTTP method type
 * @param {String} endpoint - HTTP request relative endpoint
 * 
 * @private
 */
async function updateEndpointBuckets(method: string, endpoint: string): Promise<void> {
  const bucketCalc = await getBuckets(method, endpoint);
  if (bucketCalc === null) return;

  const [buckets, lastEndpointId] = bucketCalc;

  await EndpointBucketsModel.findOneAndUpdate(
    { method, endpoint },
    { method, endpoint, buckets, lastEndpointId }
    , { upsert: true });
}

/**
 * Get current endpoint buckets, get endpoints pushed to database since last update, recalculate buckets and new last endpoint id.
 * 
 * @param {String} method - HTTP method type
 * @param {String} endpoint - HTTP request relative endpoint
 * @returns Tuple of buckets and the last endpoint id in calculation, or null if no endpoints exist for that route.
 * 
 * @private
 */
async function getBuckets(method: string, endpoint: string): Promise<[number[], number] | null> {
  const endpointBuckets: EndpointBuckets | null = await EndpointBucketsModel.findOne({ method, endpoint });

  // grab all matching endpoints
  const endpoints: Endpoint[] = await getAllEndpoints(method, endpoint, endpointBuckets !== null ? endpointBuckets.lastEndpointId : undefined);
  if (endpoints.length === 0) return null;

  const lastBucketId: number = endpoints.reduce((max, endpoint) => endpoint._id && endpoint._id > max ? endpoint._id : max, 0);
  let buckets: number[] = vectorizeEndpoints(endpoints, (24 * 60) / NUM_DAILY_DIVISIONS);

  if (endpointBuckets !== null) {
    // update bucket with new data
    buckets = buckets.map((numCalls: number, i: number) => endpointBuckets.buckets[i] + numCalls);
  }

  return [buckets, lastBucketId];
}

startWatchingEndpointModel();
