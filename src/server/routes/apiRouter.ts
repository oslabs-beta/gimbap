import { Router } from 'express';

import endpointRouter from './endpointRouter';
import clusterRouter from  './clusterRouter';

const router = Router();

router.use('/graph/endpoint', endpointRouter);
router.use('/graph/cluster', clusterRouter);

export default router;
