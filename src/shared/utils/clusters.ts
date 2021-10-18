import clustering from 'density-clustering';

import { Endpoint } from './../models/endpointModel';

export type Cluster = Route[];

export type Route = {
  method: string,
  endpoint: string
};

interface TimeDomainEndpoint extends Endpoint {
  hour: number
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
  const result: number[][] = analyzer.run(vectors, averageCallsPerBucket);

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
function getUniqueRoutes(endpoints: Endpoint[]): Route[] {
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
