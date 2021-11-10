import clustering from 'density-clustering';

import { Endpoint } from '../../shared/models/endpointModel';
import { EndpointBuckets } from '../../server/models/endpointBucketsModel';
import { Route, Cluster, LoadData, TreeNode, DataPoint } from './../../shared/types';

interface TimeDomainEndpoint extends Endpoint {
  hour: number;
}

/**
 * Utilize OPTICS algorithm to cluster endpoints based on covariant time utilization.
 * https://en.wikipedia.org/wiki/OPTICS_algorithm
 *
 * @param allEndpointBuckets - Array of endpoint buckets to use for clustering calculation.
 * @returns Array of Cluster recommendations.
 *
 * @public
 */
export function determineClusters(allEndpointBuckets: EndpointBuckets[]): Cluster[] {
  // vectorize endpoint array into 24 data points with number of calls in that hour.
  // same order as endpointBuckets
  const vectors: number[][] = [];
  let totalNumCalls = 0;
  for (const endpointBuckets of allEndpointBuckets) {
    totalNumCalls += endpointBuckets.buckets.reduce((sum, val) => sum + val, 0);
    vectors.push(endpointBuckets.buckets);
  }

  const analyzer = new clustering.OPTICS();

  const averageCallsPerBucket = totalNumCalls / vectors[0].length; // use as neighborhood radius
  const result: number[][] = analyzer.run(vectors, averageCallsPerBucket, 1);

  return result.map(clusterIndices => clusterIndices.map((i): Route => ({ method: allEndpointBuckets[i].method, endpoint: allEndpointBuckets[i].endpoint })));
}

/**
 * Generate DataPoints for a load data graph for a pre-processed route buckets vector.
 * 
 * @param endpointBuckets - EndpointBuckets object for a particular route.
 * @param granularity - time interval in minutes between data points
 * @returns {LoadData} Graph data to construct load graph scatter plot.
 * 
 * @public
 */
export function getLoadData(endpointBuckets: EndpointBuckets, granularity = 30): LoadData {
  const granularityInHours: number = granularity / 60;

  let numDays: number = (endpointBuckets.newestDate - endpointBuckets.oldestDate) / (24 * 60 * 60 * 1000);
  numDays = numDays === 0 ? 1 : Math.ceil(numDays);

  return endpointBuckets.buckets.map((numCalls: number, i: number): DataPoint => [granularityInHours * i, numCalls / numDays]);
}

/**
 * Create an array of buckets with the total number of endpoints that call into each bucket based on an interval size of granularity in minutes.
 * 
 * @param endpoints - Array of Endpoint
 * @param granularity - time interval in minutes between data points
 * @returns array of buckets with the total number of endpoints that call into each bucket
 * 
 * @public
 */
export function vectorizeEndpoints(endpoints: Endpoint[], granularity = 30): number[] {
  // break data into bucket
  const responses: TimeDomainEndpoint[] = endpoints.map(endpoint => {
    const date = new Date(endpoint.callTime);

    return {
      ...endpoint,
      hour: date.getHours() + (date.getMinutes() / 60)
    };
  });

  const vector: number[] = [];
  for (let hourStart = 0; hourStart < 24; hourStart += (granularity / 60)) {
    const numCalls: number = responses.filter(endpoint => endpoint.hour >= hourStart && endpoint.hour < hourStart + (granularity / 60)).length;

    vector.push(numCalls);
  }

  return vector;
}

/**
 * Generate a D3 compatible nested node object for graphing tree graphs (dendrogram).
 *
 * @param clusters - Array of Cluster recommendations.
 * @returns - TreeNode representation of cluster to be used with D3 dendrogram graph
 */
export function getClusterTreeNode(clusters: Cluster[]): TreeNode {
  const root: TreeNode = {
    name: 'Clusters',
    children: []
  };

  for (let i = 0; i < clusters.length; i++) {
    const clusterRoot: TreeNode = {
      name: 'Cluster ' + i,
      children: []
    };

    const cluster: Cluster = clusters[i];
    const cache: { [key: string]: string[] } = Object.create(null);
    for (let j = 0; j < cluster.length; j++) {
      // check if cluster[j].method does not exist in cache object
      if (!cache[cluster[j].method]) cache[cluster[j].method] = [];
      // add method to cache object as key and the value as an empty array
      // push end point to array
      cache[cluster[j].method].push(cluster[j].endpoint);
    }

    for (const method in cache) {
      const methodCluster: TreeNode = {
        name: method,
        children: cache[method].map((endpoint: string): TreeNode => {
          return {
            name: endpoint
          };
        })
      };

      clusterRoot.children?.push(methodCluster);
    }
    root.children?.push(clusterRoot);
  }

  return root;
}
