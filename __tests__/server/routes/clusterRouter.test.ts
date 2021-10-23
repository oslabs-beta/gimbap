import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { EndpointModel, Endpoint, logAllEndpoints} from './../../../src/shared/models/endpointModel';
import { getLoadData, theSuperHappyTreeGenerator, determineClusters } from '../../../src/server/utils/endpoints';

import request from 'supertest';
import app from './../../../src/server/index';
import { MONGODB_URI_TESTING } from './../../../src/server/secrets.json';
import { getClusterList, getClusterLoadGraphData, getClusterTreeGraphData } from './../../../src/server/controllers/dataController';
// import { Request, Response, NextFunction } from 'express';




describe('Testing all Cluster Router\'s endpoints', () => {
  // jest.setTimeout(1 * 60 * 1000); //Sets a 60 second test
  // let mockRequest: Partial<Request>;
  // let mockResponse: Partial<Response>;
  // let mockNext: NextFunction;

  // beforeEach(async () => {
  //   mockRequest = {};
  //   mockResponse = {
  //     locals: {},
  //   };
  // })

beforeAll(async () => {
  await connect(MONGODB_URI_TESTING);
  await EndpointModel.deleteMany();
});

afterEach(async () => {
  await EndpointModel.deleteMany();
});

afterAll(async () => {
  await disconnect();
});

test('Route: / || Middleware: getClusterList', async () => {
  //Create data in the database
  await logAllEndpoints([{ method: 'GET', endpoint: '/api/1', callTime: 123456 }, { method: 'POST', endpoint: '/api/cuteCatPics', callTime: 123756 }]);

  // request our express server, with a GET method and endpoint of '/'
  return request(app)
    .get('/api/graph/cluster')
    // expecting status 200
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8')
    // expect res.locals.clusters to contain the data we posted (not including calltime)
    .then((res) => {
      expect(res.body[0]).toContainEqual({ method: 'GET', endpoint: '/api/1'});
      expect(res.body[0]).toContainEqual({ method: 'POST', endpoint: '/api/cuteCatPics'});
    });
  });

  test('Route: /load/:clusterId || Middleware: getClusterLoadGraphData', async () => {
    const testEndpoints = [{method: 'POST', endpoint: '/api/login', callTime: Date.now()}, {method: 'GET', endpoint: '/api', callTime: Date.now()+1}, {method: 'GET', endpoint: '/api/login', callTime: Date.now()+2}];
    const expectedData = getLoadData(testEndpoints);
    await logAllEndpoints(testEndpoints);

    await request(app)
      .get('/api/graph/cluster')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    await request(app)
      .get('/api/graph/cluster/load/0')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(async (res) => {
        expect(res.body).toEqual(expectedData);
      });
    });

    test('Route: /tree/:clusterId || Middleware: getClusterTreeGraphData', async () => {
      const exampleData = [{method: 'POST', endpoint: '/api/login', callTime: Date.now()}, {method: 'GET', endpoint: '/api', callTime: Date.now()+1}, {method: 'GET', endpoint: '/api/login', callTime: Date.now()+2}];

      await logAllEndpoints(exampleData);

      //get cluster list route
      await request(app)
      .get('/api/graph/cluster')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')


      const clustered = determineClusters(exampleData);
      const generateDemTrees = theSuperHappyTreeGenerator(clustered);
      console.log('result of tree: ', generateDemTrees);


      await request(app)
        .get('/api/graph/cluster/tree/')
        .expect(200)
        .then(async (response) => {
          console.log('Response: ', response);
        })
        .then(async (response) => {
          expect(response.body).toBe({name: 'Cluster1', children: [{name: 'get', children: [{name: '/api/login'},{name:'/api/logout'}]}]});
        });
      });
});
