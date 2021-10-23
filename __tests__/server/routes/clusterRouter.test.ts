import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { EndpointModel, Endpoint} from './../../../src/shared/models/endpointModel';
import request from 'supertest';
import app from './../../../src/server/index';
import { MONGODB_URI_TESTING } from './../../../src/server/secrets.json';


describe('test out all our routes', () => {
  jest.setTimeout(1 * 60 * 1000); //Sets a 60 second

beforeAll(async () => {
  await connect(MONGODB_URI_TESTING);
  // app.get('/', (req, res) => res.status(200).send([{ method: 'GET', endpoint: '/api/example' }, { method: 'POST', endpoint: '/api/example2' }]));
  // app.get('/load/1', (req, res) => res.status(200).send({ x: [1, 20, 12], y: [420, 300, 200]}));
  // app.get('/tree/1', (req, res) => res.status(200).send({name: 'Cluster1', children: [{name: 'get', children: [{name: '/api/login'}, {name:'/api/logout'}]}]}));
  await EndpointModel.deleteMany();
});

afterEach(async () => {
  await EndpointModel.deleteMany();
});

afterAll(async () => {
  await disconnect();
});

test('Route: / || Middleware: getClusterList', async () => {
  return request(app)
    .get('/')
    .expect(200)
    .then(async (response) => {
      console.log(response.text);
      expect(response.text).toBe(JSON.stringify([{ method: 'GET', endpoint: '/api/example' }, { method: 'POST', endpoint: '/api/example2' }]));
    });
  });

  test('Route: /load/:clusterId || Middleware: getClusterLoadGraphData', async () => {
    return request(app)
      .get('/load/1')
      .expect(200)
      .then(async (response) => {
        expect(response.text).toBe(JSON.stringify({ x: [1, 20, 12], y: [420, 300, 200]}));
      });
    });

    test('Route: /tree/:clusterId || Middleware: getClusterTreeGraphData', async () => {
      return request(app)
        .get('/tree/1')
        .expect(200)
        .then(async (response) => {
          expect(response.text).toBe(JSON.stringify({name: 'Cluster1', children: [{name: 'get', children: [{name: '/api/login'},{name:'/api/logout'}]}]}));
        });
      });
});
