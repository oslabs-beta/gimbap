import { Request, Response, NextFunction } from 'express';
// import { determineClusters, Cluster, TreeNode, getLoadData } from '../../../src/server/utils/endpoints';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../../../src/server/controllers/dataController';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { EndpointModel} from './../../../src/shared/models/endpointModel';
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
    await disconnect();
  });

  afterEach(async () => {
    await EndpointModel.deleteMany();
    // await disconnect();
  });

  beforeEach(async () => {
    await EndpointModel.deleteMany();

    mockRequest = {};
    mockResponse = {
      locals: {},
    };
    mockNext = jest.fn();
  });

  xtest('getClusterList: Retrieves correct method and endpoints', async () => {
    await EndpointModel.create([{ method: 'GET', endpoint: '/api/1', callTime: 123456 }, { method: 'POST', endpoint: '/api/cuteCatPics', callTime: 123756 }]);

    await getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)
    // .then();

    console.log('Outside the .then statement: ', mockResponse.locals.clusters[0][1]);
    expect(mockResponse.locals.clusters[0][1]).toEqual({ method: 'GET', endpoint: '/api/1'});
    expect(mockResponse.locals.clusters[0][0]).toEqual({ method: 'POST', endpoint: '/api/cuteCatPics'});
  });

  test('getClusterLoadGraphData: Retrieves correct x and y coordinates', async () => {
    // const loadData: LoadData[] = [
    //   { x: [1, 20, 12], y: [420, 300, 200]},
    //   { x: [2, 46, 6], y: [30, 202, 314]},
    //   { x: [23, 29, 0], y: [16, 714, 238]},
    //   { x: [3, 90, 42], y: [1738, 5, 7]}
    // ];

    // await getLoadData.create(loadData);


    await EndpointModel.create([{ method: 'GET', endpoint: '/api/1', callTime: 42069877899 }, { method: 'POST', endpoint: '/api/cuteCatPics', callTime: 17679838 }]);

    await getClusterLoadGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)
    .then();

    mockRequest.params = {id: '1'};

    console.log('mockResponse.locals: ', mockResponse);

    // expect(mockResponse.locals.loadGraphData).toHaveLength(4);
    expect(mockResponse.locals.loadGraphData[0]).toEqual({ x: [1, 20, 12], y: [420, 300, 200]});
    expect(mockResponse.locals.loadGraphData[1]).toEqual({ x: [2, 46, 6], y: [30, 202, 314]});
    expect(mockResponse.locals.loadGraphData[2]).toEqual({ x: [23, 29, 0], y: [16, 714, 238]});
    expect(mockResponse.locals.loadGraphData[3]).toEqual({ x: [3, 90, 42], y: [1738, 5, 7]});
  });

  xtest('getClusterTreeGraphData: Retrieves correct cluster and appropriate children', async () => {
    const treeNode: TreeNode = {
      name: 'Cluster1',
      children: [
        {
          name: 'get',
          children: [
            {name: '/api/login'},
            {name:'/api/logout'}
          ]
        }
      ]
    };

    mockResponse.locals.treeGraphData = treeNode;
    getClusterTreeGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockResponse.locals.treeGraphData).toEqual({
        name: 'Cluster1',
        children: [
          {
            name: 'get',
            children: [
              {name: '/api/login'},
              {name:'/api/logout'}
            ]
          }
        ]
      });
  });
});

