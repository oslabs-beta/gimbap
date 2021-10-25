import React from 'react';
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
 * 2s clusters
 *
 * @param setClusters: updates state with Clusters
 * @returns returns an array of clusters.
 *
 * @public
 */
export async function fetchClusters(setClusters: React.Dispatch<React.SetStateAction<Cluster | null>>): Promise<void>{
  const allClusters: Cluster | void = await fetchWrapper<Cluster >('/api/graph/cluster');
  console.log('allClusters', allClusters);
  if (allClusters) setClusters(allClusters);
}

/**
 * Get endpoint data for tree each cluster's branches
 *
 * @returns All of the endpoints for that cluster
 *
 * @public
 */
export async function fetchClusterTree(setTreeGraphData: React.Dispatch<React.SetStateAction<Cluster | null>>): Promise<void> { // 1 2 3 4
  // we are getting an array of routes
  console.log('hellow');
  const clusters: Cluster | void = await fetchWrapper<Cluster>('/api/graph/cluster/');
  console.log('We got clusters in fetchClusterTree', clusters);
  const treeGraphData: Cluster | void = await fetchWrapper<Cluster>('/api/graph/cluster/tree');
  console.log('treeGraphData', treeGraphData);
  if (treeGraphData) setTreeGraphData(treeGraphData);
}