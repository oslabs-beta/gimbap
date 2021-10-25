import { Request, Response, NextFunction } from 'express';
import { getLoadData, theSuperHappyTreeGenerator, determineClusters } from '../../../src/server/utils/endpoints';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../../../src/server/controllers/dataController';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { EndpointModel, logAllEndpoints  } from './../../../src/shared/models/endpointModel';
import { MONGODB_URI_TESTING } from './../../../src/server/secrets.json';

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

    expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/1'});
    expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'POST', endpoint: '/api/cuteCatPics'});
  });

  test('getClusterLoadGraphData: Retrieves correct x and y coordinates', async () => {
    const testEndpoints = [{method: 'POST', endpoint: '/api/login', callTime: Date.now()}, {method: 'GET', endpoint: '/api', callTime: Date.now()+1}, {method: 'GET', endpoint: '/api/login', callTime: Date.now()+2}];
    const expectedData = getLoadData(testEndpoints);

    await logAllEndpoints(testEndpoints);
    mockRequest.params = {clusterId: '0'};

    await getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    await getClusterLoadGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockResponse.locals.loadGraphData).toEqual(expectedData);
  });

  test('getClusterTreeGraphData: Retrieves correct cluster and appropriate children', async () => {
    const exampleData = [{method: 'POST', endpoint: '/api/login', callTime: Date.now()}, {method: 'GET', endpoint: '/api', callTime: Date.now()+1}, {method: 'GET', endpoint: '/api/login', callTime: Date.now()+2}];

    await logAllEndpoints(exampleData);
    await getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    const clustered = determineClusters(exampleData);
    const generateDemTrees = theSuperHappyTreeGenerator(clustered);

    await getClusterTreeGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    expect(mockResponse.locals.treeGraphData).toEqual(generateDemTrees);
  });
});
