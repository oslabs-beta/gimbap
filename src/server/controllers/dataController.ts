import { Request, Response, NextFunction } from 'express';
import { Endpoint, getAllEndpoints } from './../../shared/models/endpointModel';
import { getUniqueRoutes, getLoadData, determineClusters, theSuperHappyTreeGenerator, Cluster, Route } from './../utils/endpoints';

let clusters: Cluster[] | null = null; // used to store last calculated cluster result

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
    const endpoints: Endpoint[] = await getAllEndpoints();
    const routes: Route[] = getUniqueRoutes(endpoints);
    // TODO can we make a request to mongo to just give us the unique matches ??

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
 * Middleware: Depends on parameter method and route to be set in request object.
 * If successful, `res.locals.loadGraphData` will contain LoadData.
 * 
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 * 
 * @public
 */
export async function getEndpointLoadGraphData(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { method, route } = req.params;

  if (!method || !route) return next({
    status: 500,
    message: 'Reached getEndpointLoadGraphData middleware without method and route parameters set in request object.',
    error: 'Internal server error.'
  });

  try {
    const endpoints: Endpoint[] = await getAllEndpoints(method, route);

    res.locals.loadGraphData = getLoadData(endpoints);
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}

/**
 * Middleware: If successful, 'res.locals.clusters' will contain Cluster[].
 * 
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 * 
 * @public
 */
export async function getClusterList(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (clusters) {
    res.locals.clusters = clusters;
    return next();
  }

  try {
    const endpoints: Endpoint[] = await getAllEndpoints();
    clusters = res.locals.clusters = determineClusters(endpoints);
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
  if (!clusters) return next({
    status: 400,
    error: 'Can not return cluster graph data before a call to get clusters is made.'
  });

  const { clusterIdStr } = req.params;

  if (!clusterIdStr) return next({
    status: 500,
    message: 'Reached getClusterLoadGraphData middleware without clusterId parameters set in request object.',
    error: 'Internal server error.'
  });
  const clusterId: number = parseInt(clusterIdStr);

  try {
    const routes: Route[] = clusters[clusterId];

    const endpoints: Endpoint[] = [];
    for (const route of routes) {
      endpoints.push(...(await getAllEndpoints(route.method, route.endpoint)));
    }

    res.locals.loadGraphData = getLoadData(endpoints);
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
 * If successful, `res.locals.treeGraphData` will contain treeNode.
 * 
 * @param {Request} req - express's HTTP request object
 * @param {Response} res - express's HTTP response object
 * @param {NextFunction} next - express's next function
 * 
 * @public
 */
export async function getClusterTreeGraphData(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!clusters) return next({
    status: 400,
    error: 'Can not return cluster tree data before a call to get clusters is made.'
  });

  try {
    res.locals.treeGraphData = theSuperHappyTreeGenerator(clusters);
  } catch (error) {
    return next(Object.assign(error, {
      status: 500,
      error: 'Internal server error reading database.'
    }));
  }

  return next();
}
