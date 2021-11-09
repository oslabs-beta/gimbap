import { Request, Response, NextFunction } from 'express';
import { getDistinctRoutes, getEndpointBuckets, EndpointBuckets } from './../models/endpointBucketsModel';
import { getClusters } from './../models/clusterModel';
import { getLoadData, getClusterTreeNode } from './../utils/endpoints';
import { Route, Cluster } from './../../shared/types';

// ! remove  let clusters: Cluster[] | undefined = undefined;

/**
 * Middleware: If successful, `res.locals.endpoints` will contain Route[].
 *
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 *
 * @public
 */
export async function getEndpointList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routes: Route[] = await getDistinctRoutes();

    res.locals.endpoints = routes;
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}

/**
 * Middleware: Depends on query parameter method and route to be set in request object.
 * If successful, `res.locals.loadGraphData` will contain LoadData.
 *
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 *
 * @public
 */
export async function getEndpointLoadGraphData(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { method, route } = req.query;

  if (typeof method !== 'string' || typeof route !== 'string') return next({
    status: 500,
    message: 'Reached getEndpointLoadGraphData middleware without method and route parameters set in request object.',
    error: 'Internal server error.'
  });

  try {
    const endpointBuckets: EndpointBuckets | null = await getEndpointBuckets(method, route);

    res.locals.loadGraphData = endpointBuckets !== null ? getLoadData(endpointBuckets) : [];
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}

/**
 * Middleware: If successful, `res.locals.clusters` will contain Cluster[].
 *
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 *
 * @public
 */
export async function getClusterList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clusters: Cluster[] | null = await getClusters();
    res.locals.clusters = clusters === null ? [] : clusters;
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}

/**
 * Middleware: Depends on parameter clusterId to be set in request object.
 * If successful, `res.locals.loadGraphData` will contain LoadData.
 *
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 *
 * @public
 */
export async function getClusterLoadGraphData(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { clusterId: clusterIdStr } = req.params;

  if (!clusterIdStr) return next({
    status: 500,
    message: 'Reached getClusterLoadGraphData middleware without clusterId parameters set in request object.',
    error: 'Internal server error.'
  });

  const clusterId: number = parseInt(clusterIdStr);

  if (isNaN(clusterId)) next({
    status: 400,
    error: 'ClusterId parameter must be a number.'
  });

  try {
    let clusters: Cluster[] | null = await getClusters();
    if (clusters === null) clusters = [];
    const routes: Route[] = clusters[clusterId];

    const allEndpointBucketsInCluster: EndpointBuckets[] = [];
    for (const route of routes) {
      const endpointBuckets: EndpointBuckets | null = await getEndpointBuckets(route.method, route.endpoint);

      if (endpointBuckets !== null) allEndpointBucketsInCluster.push(endpointBuckets);
    }

    // combine all endpoint buckets into a single buckets vector for getLoadData to use
    const buckets: number[] = allEndpointBucketsInCluster.reduce((allBuckets: number[], endpointBuckets: EndpointBuckets) => {
      endpointBuckets.buckets.forEach((value, i) => allBuckets[i] += value);
      return allBuckets;
    }, Array.from({ length: allEndpointBucketsInCluster[0].buckets.length }, () => 0));

    res.locals.loadGraphData = getLoadData({
      method: allEndpointBucketsInCluster[0].method,
      endpoint: allEndpointBucketsInCluster[0].endpoint,
      lastEndpointId: allEndpointBucketsInCluster[0].lastEndpointId,
      newestDate: allEndpointBucketsInCluster[0].newestDate,
      oldestDate: allEndpointBucketsInCluster[0].oldestDate,
      buckets,
    });
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}

/**
 * If successful, `res.locals.treeGraphData` will contain treeNode.
 *
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 *
 * @public
 */
export async function getClusterTreeGraphData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let clusters: Cluster[] | null = await getClusters();
    if (clusters === null) clusters = [];

    res.locals.treeGraphData = getClusterTreeNode(clusters);
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}
