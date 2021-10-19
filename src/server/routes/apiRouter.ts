import { Router } from 'express';
import express, { Request, Response, NextFunction, Express } from 'express';

const router = Router();

import dataController from './../controllers/dataController';


// TODO add api routers
// Get all data route

// Middleware:
// Get all data from DB and aggregate middleware to get data into correct response formation

// add in a middleware
// send back json data received from middleware
router.get('/',
 dataController.getAllData,
 dataController.dataTreatment,
 (req: Request, res: Response, next: NextFunction) => {
  console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file: apiRouter.ts ~ line 10 ~ router.get ~ req', req);
  return res.status(200).setHeader('Content-Type', 'application/json').json({ data: res.locals.data });
});


// Get all
export default router;
