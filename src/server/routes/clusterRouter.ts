
import { Router, Request, Response, NextFunction } from 'express';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../controllers/dataController';

const router = Router();

// To get list of all clusters
router.get('/',
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
//ClusterId is the index of the cluster in the array.
router.get('/load/:clusterId',
  getClusterLoadGraphData,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.clusters) return next({
      status: 500,
      error: 'Middleware getClusterLoadGraphData did not return expected data.'
    });

    res.json(res.locals.loadGraphData);
  }
);

// To get tree graph data
router.get('/tree/',
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
