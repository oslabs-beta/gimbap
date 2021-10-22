import clustering from 'density-clustering';

import { Endpoint } from '../../shared/models/endpointModel';
import { Route, Cluster, LoadData, TreeNode } from './../../shared/types';

interface TimeDomainEndpoint extends Endpoint {
  hour: number;
}

/**
 * Utilize OPTICS algorithm to cluster endpoints based on covariant time utilization.
 * https://en.wikipedia.org/wiki/OPTICS_algorithm
 *
 * @param {Endpoint[]} serverResponses - Array of server responses.
 * @param {number} step - step size for bucket vectorization in hours. Defaults to 1.
 * @returns Array of Cluster recommendations.
 *
 * @public
 */
export function determineClusters(serverResponses: Endpoint[], step = 1): Cluster[] {
  // group data by endpoints and add hour property that is decimal of hour
  const byEndpoint: { [key: string]: TimeDomainEndpoint[] } = serverResponses.reduce((grouped, response) => {
    const date: Date = new Date(response.callTime);

    grouped[response.method + response.endpoint] ??= [];
    grouped[response.method + response.endpoint].push({
      ...response,
      hour: date.getHours() + (date.getMinutes() / 60)
    });

    return grouped;
  }, Object.create(null));

  const uniqueRoutes: Route[] = getUniqueRoutes(serverResponses);

  // vectorize endpoint array into 24 data points with number of calls in that hour.
  // same order as uniqueRoutes
  const vectors: number[][] = [];
  let totalNumCalls = 0;
  for (const route of uniqueRoutes) {
    const responses: TimeDomainEndpoint[] = byEndpoint[route.method + route.endpoint];

    const vector: number[] = [];
    for (let hourStart = 0; hourStart < 24; hourStart += step) {
      const numCalls: number = responses.filter(endpoint => endpoint.hour > hourStart && endpoint.hour < hourStart + step).length;

      totalNumCalls += numCalls;

      vector.push(numCalls);
    }

    vectors.push(vector);
  }

  const analyzer = new clustering.OPTICS();

  const averageCallsPerBucket = totalNumCalls / vectors[0].length; // use as neighborhood radius
  const result: number[][] = analyzer.run(vectors, averageCallsPerBucket, 1);

  return result.map(clusterIndices => clusterIndices.map(i => uniqueRoutes[i]));
}

/**
 * Find all unique routes in the endpoint array.
 *
 * @param {Endpoint} endpoints - Array of Endpoint.
 * @returns Array of unique Route in Endpoint array.
 *
 * @private
 */
export function getUniqueRoutes(endpoints: Endpoint[]): Route[] {
  const routes: Route[] = [];
  const foundRoutes: Set<string> = new Set();

  endpoints.forEach(endpoint => {
    const key = endpoint.method + endpoint.endpoint;
    if (!foundRoutes.has(key)) {
      foundRoutes.add(key);
      routes.push({ method: endpoint.method, endpoint: endpoint.endpoint });
    }
  });

  return routes;
}

/**
 * Generate the x and y for a load data graph for a set of server responses.
 *
 * @param endpoints - Array of Endpoint
 * @param granularity - time interval in minutes between data points
 */
export function getLoadData(endpoints: Endpoint[], granularity = 30): LoadData {
  // calculate oldest and newest day in data to determine numbers of days to average total bucket calls by
  let firstDay: Date | null = null, lastDay: Date | null = null;

  // break data into bucket
  const responses: TimeDomainEndpoint[] = endpoints.map(endpoint => {
    const date = new Date(endpoint.callTime);

    if (!firstDay || date < firstDay) firstDay = date;
    if (!lastDay || date > lastDay) lastDay = date;

    return {
      ...endpoint,
      hour: date.getHours() + (date.getMinutes() / 60)
    };
  });

  if (!firstDay || !lastDay) throw new Error('Cannot calculate load data for an empty array of endpoints.');

  let numDays: number = (lastDay - firstDay) / (24 * 60 * 60 * 1000);
  numDays = numDays === 0 ? 1 : Math.ceil(numDays);

  const y: number[] = [], x: number[] = [];
  for (let hourStart = 0; hourStart < 24; hourStart += (granularity / 60)) {
    const numCalls: number = responses
      .filter(endpoint => endpoint.hour > hourStart && endpoint.hour < hourStart + (granularity / 60)).length / numDays;

    x.push(hourStart);
    y.push(numCalls);
  }

  return { x, y };
}

/**
 * Generate a D3 compatible nested node object for graphing tree graphs (dendrogram).
 *
 * @param clusters - Array of Cluster recommendations.
 */
export function theSuperHappyTreeGenerator(clusters: Cluster[]): TreeNode {
  const root: TreeNode = {
    name: 'Clusters',
    children: []
  };

  for (let i = 0; i < clusters.length; i++) {
    const clusterRoot: TreeNode = {
      name: 'Cluster ' + i,
      children: []
    };
    if (!clusterRoot.children) continue; // typescript issue with line 181

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

      clusterRoot.children.push(methodCluster);
    }
  }

  return root;
}
