import { Router, Request, Response, NextFunction } from 'express';
import { getEndpointList, getEndpointLoadGraphData } from './../controllers/dataController';

const router = Router();

// To get list of all endpoints
router.get('/',
  getEndpointList,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.endpoint) return next({
      status: 500,
      error: 'Middleware getEndpointList did not return expected data.'
    });

    res.json(res.locals.endpoint);
  }
);

// To get endpoint load line graph data
router.get('/load/:method/:route',
  getEndpointLoadGraphData,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.endpoint) return next({
      status: 500,
      error: 'Middleware getEndpointLoadGraphData did not return expected data.'
    });

    res.json(res.locals.loadGraphData);
  }
);

export default router;
