import { Request, Response, NextFunction } from 'express';
import { determineClusters, Cluster, TreeNode } from '../../../src/server/utils/endpoints';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../../../src/server/controllers/dataController';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { EndpointModel, Endpoint} from './../../../src/shared/models/endpointModel';
import { simulateServerResponses, EndpointPDF, DistributionFunction } from './../../../src/shared/utils/dataGenerator';
import { LoadData } from '../../../src/server/utils/endpoints';

describe('Testing middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeAll(async () => {
    console.log('About to connect');
    await connect('mongodb+srv://admin:test@cluster0.dopf4.mongodb.net/DePaul?retryWrites=true&w=majority');
    console.log('Connection should have been made');
  });

  afterAll(async () => {
    await EndpointModel.deleteMany();
    await disconnect();
  });

  beforeEach(async () => {
    mockRequest = {};
    mockResponse = {
      locals: {},
    };
    mockNext = jest.fn();
    await EndpointModel.deleteMany();
  });

  test('getClusterList: Retrieves correct method and endpoints', async () => {

    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api/1', pdf: () => 1 / 24 },
      { method: 'GET', endpoint: '/api/2', pdf: (x) => x / 24 },
      { method: 'GET', endpoint: '/api/3', pdf: (x) => x / 24 },
      { method: 'POST', endpoint: '/api/4', pdf: () => 1 / 24 }
    ];
    const callDist: DistributionFunction = () => 100;
    const singleEndpointServerResponses: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    const clusters: Cluster[] = determineClusters(singleEndpointServerResponses);
    mockResponse.locals.clusters = clusters;
    getClusterList(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    expect(mockResponse.locals.clusters).toHaveLength(2); //TODO: Need to relook at this
    // no guarantee on return clustering order
    if (clusters[0][1].endpoint === '/api/1' || clusters[0][1].endpoint === '/api/4') {
      expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/1' });
      expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'POST', endpoint: '/api/4' });
      expect(mockResponse.locals.clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/2' });
      expect(mockResponse.locals.clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/3' });
    } else {
      expect(mockResponse.locals.clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/1' });
      expect(mockResponse.locals.clusters[1]).toContainEqual({ method: 'POST', endpoint: '/api/4' });
      expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/2' });
      expect(mockResponse.locals.clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/3' });
    }
  });

  test('getClusterLoadGraphData: Retrieves correct x and y coordinates', async () => {
    const loadData: LoadData[] = [
      { x: [1, 20, 12], y: [420, 300, 200]},
      { x: [2, 46, 6], y: [30, 202, 314]},
      { x: [23, 29, 0], y: [16, 714, 238]},
      { x: [3, 90, 42], y: [1738, 5, 7]}
    ];

    mockResponse.locals.loadGraphData = loadData;
    getClusterLoadGraphData(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    expect(mockResponse.locals.loadGraphData).toHaveLength(4);

      expect(mockResponse.locals.loadGraphData[0]).toEqual({ x: [1, 20, 12], y: [420, 300, 200]});
      expect(mockResponse.locals.loadGraphData[1]).toEqual({ x: [2, 46, 6], y: [30, 202, 314]});
      expect(mockResponse.locals.loadGraphData[2]).toEqual({ x: [23, 29, 0], y: [16, 714, 238]});
      expect(mockResponse.locals.loadGraphData[3]).toEqual({ x: [3, 90, 42], y: [1738, 5, 7]});

  });

  test('getClusterTreeGraphData: Retrieves correct cluster and appropriate children', async () => {
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

