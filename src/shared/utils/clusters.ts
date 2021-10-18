import clustering from 'density-clustering';

import { Endpoint } from './../models/endpointModel';

export type Cluster = {
  routes: Route[],
}

export type Route = {
  method: string,
  endpoint: string
};

interface TimeDomainEndpoint extends Endpoint {
  hour: number
}

/**
 * 
 * @param endpoints 
 * @returns 
 */
// todo add doc
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

export function determineClusters(serverResponses: Endpoint[]): Cluster[] {
  // TODO clean up logic below into fewer passes

  // convert to 24 hour time domain
  const timeDomainServerResponses: TimeDomainEndpoint[] = serverResponses.map(response => {
    const date = new Date(response.callTime);

    return {
      ...response,
      hour: date.getHours() + (date.getMinutes() / 60)
    };
  });

  // group data by endpoints
  const byEndpoint: { [key: string]: TimeDomainEndpoint[] } = timeDomainServerResponses.reduce((grouped, endpoint) => {
    grouped[endpoint.method + endpoint.endpoint] ??= [];
    grouped[endpoint.method + endpoint.endpoint].push(endpoint);

    return grouped;
  }, Object.create(null));

  const uniqueRoutes = getUniqueRoutes(timeDomainServerResponses);

  // vectorize endpoint array into 24 data points with number of calls in that hour.
  // same order as uniqueRoutes
  const vectors = [];
  let totalNumCalls = 0;
  for (const route of uniqueRoutes) {
    const responses = byEndpoint[route.method + route.endpoint];

    const vector = [];
    const step = 1; // hours
    for (let hourStart = 0; hourStart < 24; hourStart += step) {
      const numCalls: number = responses.filter(endpoint => endpoint.hour > hourStart && endpoint.hour < hourStart + step).length;

      totalNumCalls += numCalls;

      vector.push(numCalls);
    }

    vectors.push(vector);
  }

  const dbscan = new clustering.OPTICS();

  const averageCallsPerBucket = totalNumCalls / vectors[0].length; // use as neighborhood radius
  const result = dbscan.run(vectors, averageCallsPerBucket);

  //console.log({ result, noise: dbscan.noise, dbscan }); // ! remove 

  return result.map(clusterIndices => clusterIndices.map(i => uniqueRoutes[i]));
}
