import { Request, Response, NextFunction } from 'express';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../../../src/server/controllers/dataController';

describe('Testing middleware', () => {

  test('retrieves proper endpoint list', async () => {

    //Expect an array of routes(which are objects)
      //make a fake array of routes
    getClusterList()
      //Expect our endpoints to === those above
      // Was using this artcile: https://javascript.plainenglish.io/how-to-unit-test-express-middleware-typescript-jest-c6a7ad166e74
  });
});

