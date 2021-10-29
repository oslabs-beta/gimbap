import mongoose from 'mongoose';

import { Cluster } from './../../shared/types';
import { getLastEndpoint } from './../../shared/models/endpointModel';
import { getAllEndpointBuckets, EndpointBuckets } from './../models/endpointBucketsModel';
import { determineClusters } from './../utils/endpoints';


export type DBClusterSchema = {
  clusters: Cluster[],
  lastEndpointId: number,
}


const FORCED_UPDATE_TIMEOUT = 30 * 60 * 1000;

let intervalId: NodeJS.Timer | null = null;

const ClusterSchema = new mongoose.Schema<DBClusterSchema>({
  clusters: { type: [[{ method: String, endpoint: String }]], required: true },
  lastEndpointId: { type: Number, required: true },
});
export const ClusterModel = mongoose.model<DBClusterSchema>('Cluster', ClusterSchema);


/**
 * Initiate the watching for new data to recalculate ClusterModel.
 * 
 * @public
 */
export function startWatchingClusterModel(): void {
  // set interval if it does not already exist
  if (intervalId !== null) {
    intervalId = setInterval(() => {
      updateClusters();
    }, FORCED_UPDATE_TIMEOUT);
  }
}

/**
 * Stop watching for new data.
 * 
 * @public
 */
export async function stopWatchingClusterModel(): Promise<void> {
  // clear the interval
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Forces cluster recalculation and update if new data is available.
 * 
 * @public
 */
export async function forceUpdated(): Promise<void> {
  await updateClusters();
}

async function updateClusters(): Promise<void> {
  // grab clusters from db
  const clusters = await ClusterModel.findOne({});

  // what if we dont have one
  if (clusters === null) {
    // recalculate

  }

  // if we have one
  else {
    // grab last endpoint from db, if it doesn't match, recalculate
    const lastEndpoint = await getLastEndpoint();
    if (lastEndpoint !== null && lastEndpoint._id !== clusters.lastEndpointId) {

    }
  }
}

/**
 * Recalculates the clusters by getting all endpoint and determining clusters. Replaces existing clusters 
 * with new cluster collection if a match is found with clusterId parameter.
 * 
 * @param lastEndpointId
 * @param clusterId
 * @returns Promise of the last endpoint or null if no endpoints in collection
 *
 * @public
 */
async function recalculateClusters(lastEndpointId: number, clusterId?: mongoose.Types.ObjectId): Promise<void> {
  const endpointBuckets: EndpointBuckets[] = await getAllEndpointBuckets();
  const clusters: Cluster[] = determineClusters(endpointBuckets);

  await ClusterModel.findOneAndUpdate({ _id: clusterId }, { clusters, lastEndpointId }, { upsert: true });
}


// TODO getCluster

// TODO unit test

// TODO integrate with dataController
