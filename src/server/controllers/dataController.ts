import express, { Request, Response, NextFunction, Express } from 'express';

import Endpoint from '../../shared/models/endpointModel';


interface dataController {}

dataController.getAllData = async (req: Request, res: Response, next: NextFunction) => {
  await Endpoint.find({}, (error, data) => {
    if (error) return next('Error in dataController.getAllData: ' + JSON.stringify(error));

  res.locals.Data = data;
  return next();
  });
};

module.exports = dataController;


