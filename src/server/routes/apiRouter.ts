import  Router, { Request, Response, NextFunction, Express } from 'express';

import endpointRouter from './endpointRouter';
import clusterRouter from './clusterRouter';
import { connect } from './../../shared/models/mongoSetup';


const router = Router();

router.use('/graph/endpoint', endpointRouter);
router.use('/graph/cluster', clusterRouter);
router.post('/mongo',(req: Request, res: Response, next: NextFunction) => {
  connect(req.body.mongodb);
  return next();
});

export default router;
