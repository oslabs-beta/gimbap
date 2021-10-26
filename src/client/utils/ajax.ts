import { ClientError, Cluster, Route, LoadData } from './../../shared/types';

/**
 * Makes a GET fetch request.
 *
 * @param url - URL to make fetch request to.
 * @returns Promise to generic data type or void if fetch failed.
 *
 * @private
 */
async function fetchWrapper<T>(url: string): Promise<T | void> {
  const response: Response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  const body: T | ClientError = await response.json();

  if (response.status !== 200) {
    console.error(`Server responded with status ${response.status}`);
  }
  if (typeof body === 'object' && (body as object).hasOwnProperty('error')) return console.error((body as ClientError).error);

  return body as T;
}

/**
 * Make a fetch request to backend to load unique routes.
 * 
 * @param setRoutes - state setter function for Route[]
 * 
 * @public
 */
export async function fetchRoutes(setRoutes: React.Dispatch<React.SetStateAction<Route[] | null>>): Promise<void> {
  const routes: Route[] | void = await fetchWrapper<Route[]>('/api/graph/endpoint');
  if (routes) setRoutes(routes);
}

/**
 * Make a fetch request to backend for LoadData for a particular route.
 * 
 * @param {Route} route - Route to fetch LoadData for.  
 * @param {number} index - index in setRoutesLoadData object to store the LoadData at
 * @param {React.Dispatch<React.SetStateAction} setRoutesLoadData - state setter function for { [key: number]: LoadData }
 * 
 * @public
 */
export async function fetchRouteLoadData(
  route: Route,
  index: number,
  setRoutesLoadData: React.Dispatch<React.SetStateAction<{ [key: number]: LoadData }>>
): Promise<void> {
  const loadData: LoadData | void = await fetchWrapper<LoadData>(`/api/graph/endpoint/load?method=${encodeURIComponent(route.method)}&route=${encodeURIComponent(route.endpoint)}`);
  if (loadData) setRoutesLoadData(routesLoadData => {
    const nextRoutesLoadData = Object.assign(Object.create(null), routesLoadData);
    nextRoutesLoadData[index] = loadData;
    return nextRoutesLoadData;
  });
}

/**
 * Make fetch request to backend to load clusters.
 *
 * @param setClusters - updates state with Clusters
 *
 * @public
 */
export async function fetchClusters(setClusters: React.Dispatch<React.SetStateAction<Cluster[] | null>>): Promise<void> {
  const clusters: Cluster[] | void = await fetchWrapper<Cluster[]>('api/graph/cluster');
  if (clusters) setClusters(clusters);
}

/**
 * Make a fetch request to backend for LoadData for a particular cluster.
 * 
 * @param {number} index - index in setClusterLoadData object to store the LoadData at
 * @param {React.Dispatch<React.SetStateAction} setClusterLoadData - state setter function for { [key: number]: LoadData }
 * 
 * @public
 */
export async function fetchClusterLoadData(
  index: number,
  setClusterLoadData: React.Dispatch<React.SetStateAction<{ [key: number]: LoadData }>>
): Promise<void> {
  const loadData: LoadData | void = await fetchWrapper<LoadData>(`/api/graph/cluster/load/${index}`);
  if (loadData) setClusterLoadData(clusterLoadData => {
    const nextClustersLoadData = Object.assign(Object.create(null), clusterLoadData);
    nextClustersLoadData[index] = loadData;
    return nextClustersLoadData;
  });
}

/**
 * Make a fetch request to backend for LoadData for a particular cluster.
 * 
 * @param {number} index - index in setClusterLoadData object to store the LoadData at
 * @param {React.Dispatch<React.SetStateAction} setClusterLoadData - state setter function for { [key: number]: LoadData }
 * 
 * @public
 */
 export async function fetchClusterTree(setTreeGraphData: React.Dispatch<React.SetStateAction<Cluster[] | null>>): Promise<void> {
  const clusters: Cluster[] | void = await fetchWrapper<Cluster[]>('api/graph/cluster/');
  const trees: Cluster[] | void = await fetchWrapper<Cluster[]>('api/graph/cluster/tree');
  if (trees) setTreeGraphData(trees);
}