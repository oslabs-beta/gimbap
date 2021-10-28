import { Router, Request, Response, NextFunction } from 'express';

import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../controllers/dataController';
import { cache } from './../controllers/cacheController';

const router = Router();

// To get list of all clusters
router.get('/',
  cache(8 * 60 * 60 * 1000),
  getClusterList,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.clusters) return next({
      status: 500,
      error: 'Middleware getClusterList did not return expected data.'
    });

    res.json(res.locals.clusters);
  }
);

// To get cluster load graph data
// clusterId is the index of the cluster in the array.
router.get('/load/:clusterId',
  cache(8 * 60 * 60 * 1000),
  getClusterLoadGraphData,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.loadGraphData) return next({
      status: 500,
      error: 'Middleware getClusterLoadGraphData did not return expected data.'
    });

    res.json(res.locals.loadGraphData);
  }
);

// To get cluster tree graph data
router.get('/tree',
  cache(8 * 60 * 60 * 1000),
  getClusterTreeGraphData,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.treeGraphData) return next({
      status: 500,
      error: 'Middleware getClusterTreeGraphData did not return expected data.'
    });
  
    res.json(res.locals.treeGraphData);
  }
);

export default router;
