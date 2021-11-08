import mongoose from 'mongoose';

import { Cluster } from './../../shared/types';
import { getLastEndpoint, Endpoint } from './../../shared/models/endpointModel';
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
export const ClusterModel: mongoose.Model<DBClusterSchema> = mongoose.model<DBClusterSchema>('Cluster', ClusterSchema);


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
export function stopWatchingClusterModel(): void {
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
export async function forceUpdate(): Promise<void> {
  await updateClusters();
}

/**
 * Get current cluster model in database. Note, this will only attempt a cluster calculation if there is no 
 * cluster model saved in the database, use `forceUpdate` before this call if a recalculation is needed.
 * 
 * @returns Cluster[] or null if no cluster model exist in database.
 * 
 * @public
 */
export async function getClusters(): Promise<Cluster[] | null> {
  let clusterModel: DBClusterSchema | null = await ClusterModel.findOne({});

  if (clusterModel === null) {
    // if no cluster model exist in database, force update and retry
    await updateClusters();
    clusterModel = await ClusterModel.findOne({});
  }

  return clusterModel === null ? null : clusterModel.clusters;
}

/**
 * Update cluster model.
 * 
 * @private
 */
async function updateClusters(): Promise<void> {
  const lastEndpoint: Endpoint & { _id: number } | null = await getLastEndpoint();

  if (lastEndpoint !== null) {
    const clusterModel: DBClusterSchema & { _id: mongoose.Types.ObjectId; } | null = await ClusterModel.findOne({});
    await recalculateClusters(lastEndpoint._id, clusterModel === null ? undefined : clusterModel._id);
  }
}

/**
 * Recalculates the clusters by getting all endpoint and determining clusters. Updates cluster recommendations
 * in database.
 * 
 * @param lastEndpointId - _id of the last endpoint in database
 * @param clusterId - _id of the clusterModel in database to be replaced with new calculation.
 * @returns Promise of the last endpoint or null if no endpoints in collection
 *
 * @private
 */
async function recalculateClusters(lastEndpointId: number, clusterId?: mongoose.Types.ObjectId): Promise<void> {
  const endpointBuckets: EndpointBuckets[] = await getAllEndpointBuckets();
  const clusters: Cluster[] = determineClusters(endpointBuckets);

  await ClusterModel.findOneAndUpdate({ _id: clusterId }, { clusters, lastEndpointId }, { upsert: true });
}

startWatchingClusterModel();
