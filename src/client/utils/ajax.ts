import { ClientError,Cluster } from './../../shared/types';

/**
 * Makes a GET fetch request.
 *
 * @param url - URL to make fetch request to.
 * @returns Promise to generic data type or void if fetch failed.
 *
 * @public
 */
export async function fetchWrapper<T>(url: string): Promise<T | void> {
  const response: Response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });


  const body: T | ClientError = await response.json();
  console.log(typeof body);
  console.log({body});

  if (response.status !== 200) {
    console.error(`Server responded with status ${response.status}`);
  }
  if (typeof body === 'object' && (body as object).hasOwnProperty('error')) return console.error((body as ClientError).error);

  return body as T;
}


/**
 * Gets clusters
 *
 * @param setClusters: updates state with Clusters
 * @returns returns an array of clusters.
 *
 * @public
 */
export async function fetchClusters(setClusters: React.Dispatch<React.SetStateAction<Cluster | null>>): Promise<void>{
  const allClusters: Cluster | void = await fetchWrapper<Cluster>('api/graph/cluster');
  console.log(allClusters);
  if (allClusters) setClusters(allClusters);
}

/**
 * Get endpoint data
 *
 * @param a single clusterId (arrayIndex)
 * @returns All of the endpoints for that cluster
 *
 * @public
 */
export async function fetchSingleCluster(clusterId) { // 1 2 3 4
  // we are getting an array of routes
  fetchWrapper(`/api/graph/cluster/tree/${clusterId}`);
}