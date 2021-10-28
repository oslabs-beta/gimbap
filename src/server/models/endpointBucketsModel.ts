import mongoose from 'mongoose';
import { ChangeStream } from 'mongodb';

import { EndpointModel, Endpoint, getAllEndpoints } from './../../shared/models/endpointModel';
import { vectorizeEndpoints } from './../utils/endpoints';
import { Route } from './../../shared/types';

// TODO abstract so it can work with either MongoDB or PostgreSQL depending on how setup is called.

export type EndpointBuckets = {
  method: string,
  endpoint: string,
  buckets: number[],
  lastEndpointId: number,
  oldestDate: number,
  newestDate: number,
};

const FORCED_UPDATE_TIMEOUT = 5 * 60 * 1000;
export const NUM_DAILY_DIVISIONS = 24 * 2;
export const MIN_NUM_CHANGES_TO_UPDATE = 100;
let changeStream: ChangeStream<mongoose.Model<Endpoint>> | null = null;
let updateCounter: { [key: string]: number } = Object.create(null); // key being method + endpoint

// cache of active timeouts with key being method + endpoint
let timeoutHandles: { [key: string]: NodeJS.Timeout } = Object.create(null);


const EndpointBucketsSchema = new mongoose.Schema<EndpointBuckets>({
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  buckets: { type: [Number], required: true },
  lastEndpointId: { type: Number, required: true },
  oldestDate: { type: Number, required: true },
  newestDate: { type: Number, required: true },
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

  updateCounter = Object.create(null);
  changeStream = EndpointModel.watch<typeof EndpointModel>();

  changeStream.on('change', change => {
    if (change.operationType !== 'insert' || !change.fullDocument) return;

    const key: string = getKey(change.fullDocument.method, change.fullDocument.endpoint);
    updateCounter[key] ??= 0;
    updateCounter[key]++;
    if (updateCounter[key] === MIN_NUM_CHANGES_TO_UPDATE) {
      updateCounter[key] = 0;

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
 * Get EndpointBuckets for a particular route from the database. Forces a calculation update if there is no endpoint buckets in database.
 * 
 * @param {String} method - HTTP method type
 * @param {String} endpoint - HTTP request relative endpoint
 * @returns EndpointBuckets for that route, or null if no data exists for that route
 * 
 * @public
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
 * Get all EndpointBuckets in the database. This does not force a calculation update.
 * 
 * @public
 */
export async function getAllEndpointBuckets(): Promise<EndpointBuckets[]> {
  return await EndpointBucketsModel.find({});
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
  const endpointBuckets = await getBuckets(method, endpoint);
  if (endpointBuckets === null) return;

  await EndpointBucketsModel.findOneAndUpdate({ method, endpoint }, endpointBuckets, { upsert: true, new: true });
}

/**
 * Forces all pending updates with timeout handle to complete.
 * 
 * @public
 */
export async function forceAllPendingUpdated(): Promise<void> {
  for (const key in timeoutHandles) {
    const { method, endpoint } = getRouteFromKey(key);
    clearTimeout(timeoutHandles[key]);
    delete timeoutHandles[key];
    await updateEndpointBuckets(method, endpoint);
  }
}

/**
 * Calculate endpoint buckets for an array of server response endpoints.
 * 
 * @param endpoints - Array of server response endpoints
 * @returns EndpointBuckets object for those endpoints.
 */
export function calculateEndpointBuckets(endpoints: Endpoint[]): EndpointBuckets {
  let lastEndpointId = 0, oldestDate: number = endpoints[0].callTime, newestDate: number = endpoints[0].callTime;
  endpoints.forEach(endpoint => {
    if (endpoint._id && endpoint._id > lastEndpointId) lastEndpointId = endpoint._id;
    if (endpoint.callTime < oldestDate) oldestDate = endpoint.callTime;
    if (endpoint.callTime > newestDate) newestDate = endpoint.callTime;
  });

  const buckets: number[] = vectorizeEndpoints(endpoints, (24 * 60) / NUM_DAILY_DIVISIONS);

  return { method: endpoints[0].method, endpoint: endpoints[0].endpoint, buckets, lastEndpointId, oldestDate, newestDate };
}

/**
 * Get a distinct list of distinct routes.
 *
 * @returns Promise of array of Route
 *
 * @public
 */
export async function getDistinctRoutes(): Promise<Route[]> {
  return await EndpointBucketsModel.find({}, 'method endpoint');
}

/**
 * Get current endpoint buckets, get endpoints pushed to database since last update, recalculate buckets and new last endpoint id.
 * 
 * @param method - HTTP method type
 * @param endpoint - HTTP request relative endpoint
 * @returns Object with buckets, the last endpoint id, oldestDate, and newestDate in the calculation, or null if no endpoints exist for that route.
 * 
 * @private
 */
async function getBuckets(method: string, endpoint: string): Promise<EndpointBuckets | null> {
  const endpointBuckets: EndpointBuckets | null = await EndpointBucketsModel.findOne({ method, endpoint });

  // grab all matching endpoints
  const endpoints: Endpoint[] = await getAllEndpoints(method, endpoint, endpointBuckets !== null ? endpointBuckets.lastEndpointId : undefined);
  if (endpoints.length === 0) return null;

  const newDataEndpointBuckets = calculateEndpointBuckets(endpoints);

  if (endpointBuckets !== null) {
    newDataEndpointBuckets.oldestDate = endpointBuckets.oldestDate;
    // update bucket with new data
    newDataEndpointBuckets.buckets = newDataEndpointBuckets.buckets.map((numCalls: number, i: number) => endpointBuckets.buckets[i] + numCalls);
  }

  return newDataEndpointBuckets;
}

/**
 * Generate a unique string from the combination of method and endpoint.
 * 
 * @param method - HTTP method type
 * @param endpoint - HTTP request relative endpoint 
 * @returns string representing unique combination of method and endpoint
 * 
 * @private
 */
function getKey(method: string, endpoint: string): string {
  return JSON.stringify({ method, endpoint });
}

/**
 * Return a route from the unique combination key string.
 * 
 * @param key unique combination string of method and endpoint generated by a call to `getKey`.
 * @returns Route
 * 
 * @private
 */
function getRouteFromKey(key: string): Route {
  return JSON.parse(key);
}

startWatchingEndpointModel();
