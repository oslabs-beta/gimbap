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
    // let clusters: Cluster[] | null = await getClusters();
    // if (clusters === null) clusters = [];

    const clusters = [
      [
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/soup' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'GET', endpoint: '/angelyn' },
        {method: 'GET', endpoint: '/chicken' },
        {method: 'POST', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/chicken' },
        {method: 'DELETE', endpoint: '/chicken' },
        {method: 'PATCH', endpoint: '/soup' },
        {method: 'DELETE', endpoint: '/broth' },
        {method: 'POST', endpoint: '/fadmissions' },
        {method: 'PATCH', endpoint: '/chergwegwricken' },
        {method: 'GET', endpoint: '/angerererlyn' },
        {method: 'GET', endpoint: '/rere' },
        {method: 'POST', endpoint: '/retta' },
        {method: 'PATCH', endpoint: '/rhodeisland' },
        {method: 'DELETE', endpoint: '/newyork' },
        {method: 'PATCH', endpoint: '/arizona' },
        {method: 'DELETE', endpoint: '/california' },
        {method: 'POST', endpoint: '/nebraska' },
        {method: 'PATCH', endpoint: '/florida' },
        {method: 'GET', endpoint: '/dakota' },
        {method: 'GET', endpoint: '/carolina' },
        {method: 'POST', endpoint: '/sell' },
        {method: 'PATCH', endpoint: '/dank' },
        {method: 'DELETE', endpoint: '/memes' },
        {method: 'PATCH', endpoint: '/yaboy' },
        {method: 'DELETE', endpoint: '/tacos' },
        {method: 'POST', endpoint: '/enchilada' },
        {method: 'PATCH', endpoint: '/beef' },
        {method: 'GET', endpoint: '/khan' }
      ],
      [
        {method: 'GET', endpoint: '/one' },
        {method: 'POST', endpoint: '/one' },
        {method: 'PATCH', endpoint: '/one' },
        {method: 'DELETE', endpoint: '/one' },
        {method: 'GET', endpoint: '/two' },
        {method: 'POST', endpoint: '/two' },
        {method: 'PATCH', endpoint: '/two' },
        {method: 'DELETE', endpoint: '/two' },
        {method: 'GET', endpoint: '/three' },
        {method: 'POST', endpoint: '/three' },
        {method: 'PATCH', endpoint: '/three' },
        {method: 'DELETE', endpoint: '/three' },
        {method: 'GET', endpoint: '/four' },
        {method: 'POST', endpoint: '/four' },
        {method: 'PATCH', endpoint: '/four' },
        {method: 'DELETE', endpoint: '/four' },
        {method: 'GET', endpoint: '/five' },
        {method: 'POST', endpoint: '/five' },
        {method: 'PATCH', endpoint: '/five' },
        {method: 'DELETE', endpoint: '/five' },
        {method: 'GET', endpoint: '/six' },
        {method: 'POST', endpoint: '/six' },
        {method: 'PATCH', endpoint: '/six' },
        {method: 'DELETE', endpoint: '/six' },
        {method: 'GET', endpoint: '/seven' },
        {method: 'POST', endpoint: '/seven' },
        {method: 'PATCH', endpoint: '/seven' },
        {method: 'DELETE', endpoint: '/seven' },
        {method: 'GET', endpoint: '/eight' },
        {method: 'POST', endpoint: '/eight' },
        {method: 'PATCH', endpoint: '/eight' },
        {method: 'DELETE', endpoint: '/eight' },
      ],
      [
        {method: 'GET', endpoint: '/swamp' },
        {method: 'POST', endpoint: '/swamp' },
        {method: 'PATCH', endpoint: '/swamp' },
        {method: 'GET', endpoint: '/usa/fishery' },
        {method: 'POST', endpoint: '/usa/fishery' },
        {method: 'DELETE', endpoint: '/usa/fishery' },
        {method: 'GET', endpoint: '/usa/fisherman' },
        {method: 'POST', endpoint: '/usa/fisherman' },
        {method: 'DELETE', endpoint: '/usa/fisherman' },
        {method: 'DELETE', endpoint: '/usa/boats' },
        {method: 'GET', endpoint: '/usa/boats' },
        {method: 'POST', endpoint: '/usa/boats' },
        {method: 'DELETE', endpoint: '/usa/boats' },
        {method: 'GET', endpoint: '/usa/capitals' },
        {method: 'POST', endpoint: '/usa/capitals' },
        {method: 'DELETE', endpoint: '/usa/capitals' },


        {method: 'GET', endpoint: '/spain/fishery' },
        {method: 'POST', endpoint: '/spain/fishery' },
        {method: 'DELETE', endpoint: '/spain/fishery' },
        {method: 'GET', endpoint: '/spain/fisherman' },
        {method: 'POST', endpoint: '/spain/fisherman' },
        {method: 'DELETE', endpoint: '/spain/fisherman' },
        {method: 'DELETE', endpoint: '/spain/boats' },
        {method: 'GET', endpoint: '/spain/boats' },
        {method: 'POST', endpoint: '/spain/boats' },
        {method: 'DELETE', endpoint: '/spain/boats' },
        {method: 'GET', endpoint: '/spain/capitals' },
        {method: 'POST', endpoint: '/spain/capitals' },
        {method: 'DELETE', endpoint: '/spain/capitals' },

        {method: 'GET', endpoint: '/canada/fishery' },
        {method: 'POST', endpoint: '/canada/fishery' },
        {method: 'DELETE', endpoint: '/canada/fishery' },
        {method: 'GET', endpoint: '/canada/fisherman' },
        {method: 'POST', endpoint: '/canada/fisherman' },
        {method: 'DELETE', endpoint: '/canada/fisherman' },
        {method: 'DELETE', endpoint: '/canada/boats' },
        {method: 'GET', endpoint: '/canada/boats' },
        {method: 'POST', endpoint: '/canada/boats' },
        {method: 'DELETE', endpoint: '/canada/boats' },
        {method: 'GET', endpoint: '/canada/capitals' },
        {method: 'POST', endpoint: '/canada/capitals' },
        {method: 'DELETE', endpoint: '/canada/capitals' },

        {method: 'GET', endpoint: '/eu/fishery' },
        {method: 'POST', endpoint: '/eu/fishery' },
        {method: 'DELETE', endpoint: '/eu/fishery' },
        {method: 'GET', endpoint: '/eu/fisherman' },
        {method: 'POST', endpoint: '/eu/fisherman' },
        {method: 'DELETE', endpoint: '/eu/fisherman' },
        {method: 'DELETE', endpoint: '/eu/boats' },
        {method: 'GET', endpoint: '/eu/boats' },
        {method: 'POST', endpoint: '/eu/boats' },
        {method: 'DELETE', endpoint: '/eu/boats' },
        {method: 'GET', endpoint: '/eu/capitals' },
        {method: 'POST', endpoint: '/eu/capitals' },
        {method: 'DELETE', endpoint: '/eu/capitals' },
      ]
    ];

    res.locals.treeGraphData = getClusterTreeNode(clusters);
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}
