import { Request, Response, NextFunction } from 'express';
import { getLoadData, theSuperHappyTreeGenerator, determineClusters } from '../../../src/server/utils/endpoints';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../../../src/server/controllers/dataController';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { EndpointModel, logAllEndpoints, getAllEndpoints } from './../../../src/shared/models/endpointModel';
import { simulateServerResponses, EndpointPDF, DistributionFunction } from './../../../src/shared/utils/dataGenerator';
import { LoadData } from '../../../src/shared/types';
import { MONGODB_URI_TESTING } from './../../../src/server/secrets.json';
// import mongoose from 'mongoose';

// mongodb+srv://pakachan:aEMtuk4JhAmfigw@cluster0.qvt4k.mongodb.net/test?retryWrites=true&w=majority

describe('Testing middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeAll(async () => {
    await connect(MONGODB_URI_TESTING);
  });

  afterAll(async () => {
    await EndpointModel.deleteMany();
    await disconnect();
  });


  beforeEach(async () => {
    await EndpointModel.deleteMany();
    mockRequest = {};
    mockResponse = {
      locals: {},
    };
    mockNext = jest.fn();
  });

  test('getClusterList: Retrieves correct method and endpoints', async () => {
    await EndpointModel.create([{ method: 'GET', endpoint: '/api/1', callTime: 123456 }, { method: 'POST', endpoint: '/api/cuteCatPics', callTime: 123756 }]);

    await getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)
    // .then();

    // console.log('Outside the .then statement: ', mockResponse.locals.clusters[0][1]);
    expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/1'});
    expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'POST', endpoint: '/api/cuteCatPics'});
  });

  test('getClusterLoadGraphData: Retrieves correct x and y coordinates', async () => {
    const testEndpoints = [{method: 'POST', endpoint: '/api/login', callTime: Date.now()}, {method: 'GET', endpoint: '/api', callTime: Date.now()+1}, {method: 'GET', endpoint: '/api/login', callTime: Date.now()+2}];
    //use getLoadData function to create expected ones
    const expectedData = getLoadData(testEndpoints);
    console.log('Current Endpoints: ', await getAllEndpoints());
    await logAllEndpoints(testEndpoints);
    // await getLoadData.create(loadData);

    //call getClusterList after database receives data
    mockRequest.params = {clusterId: '0'};

    await getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    await getClusterLoadGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    // expect(mockResponse.locals.loadGraphData).toHaveLength(4);
    console.log('Log Result: ', mockResponse.locals);
    expect(mockResponse.locals.loadGraphData).toEqual(expectedData);
  });

  test('getClusterTreeGraphData: Retrieves correct cluster and appropriate children', async () => {
    // variable that contains an example cluster
    const exampleData = [{method: 'POST', endpoint: '/api/login', callTime: Date.now()}, {method: 'GET', endpoint: '/api', callTime: Date.now()+1}, {method: 'GET', endpoint: '/api/login', callTime: Date.now()+2}];

    // pass the clusters of endpoints to MongoDB
    await logAllEndpoints(exampleData);

    await getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    // determine the clusters that we will pass to the superHappyTreeGenerator
    const clustered = determineClusters(exampleData);
    // run thru happyTrees
    const generateDemTrees = theSuperHappyTreeGenerator(clustered);
    //call middleware
    await getClusterTreeGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    //test
    expect(mockResponse.locals.treeGraphData).toEqual(generateDemTrees);
  });
});




// saved
// {
//   name: 'Cluster1',
//   children: [
//     {
//       name: 'get',
//       children: [
//         {name: '/api/login'},
//         {name:'/api/logout'}
//       ]
//     }
//   ]
// });