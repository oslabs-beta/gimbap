import { Router } from 'express';

const router = Router();

// TODO add api routers
// Get all data route
// Middleware:
// Get all data from DB and aggregate middleware to get data into correct response formation 
router.get('/api', (req, res) => {
console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file: apiRouter.ts ~ line 10 ~ router.get ~ req", req);
  res.status(200);
});


// Get all
export default router;
