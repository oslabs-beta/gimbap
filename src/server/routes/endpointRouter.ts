import { Router, Request, Response, NextFunction } from 'express';

import { getEndpointList, getEndpointLoadGraphData } from './../controllers/dataController';
import { cache } from './../controllers/cacheController';

const router = Router();

// To get list of all endpoints
router.get('/',
  cache(30 * 1000),
  getEndpointList,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.endpoints) return next({
      status: 500,
      error: 'Middleware getEndpointList did not return expected data.'
    });

    res.json(res.locals.endpoints);
  }
);

// To get endpoint load line graph data
router.get('/load',
  getEndpointLoadGraphData,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.loadGraphData) return next({
      status: 500,
      error: 'Middleware getEndpointLoadGraphData did not return expected data.'
    });

    res.json(res.locals.loadGraphData);
  }
);

export default router;
