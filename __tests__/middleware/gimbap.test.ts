import express, { Application } from 'express';
import request from 'supertest';
import gimbap from './../../src/middleware';
import { EndpointModel, Endpoint } from './../../src/middleware/models/mongoEndpointModel';

describe('gimbap logs route request to MongoDB', () => {
  let app: Application;

  beforeAll(async () => {
    app = express();

    await gimbap(app, 'mongodb', 'mongodb://localhost:27017/gimbap-test');

    app.get('/', (req, res) => res.send('Hello World!'));
    app.get('/api/user', (req, res) => res.send('Miguel'));
    app.get('/api/message', (req, res) => res.send('TDD!'));
  });

  afterAll(async () => {
    await EndpointModel.deleteMany();
    return gimbap.stop();
  });

  beforeEach(async () => {
    await EndpointModel.deleteMany();
  });

  test('single endpoint correctly logged to database', async () => {
    const callTime: string = Date.now().toString();

    return request(app)
      .get('/')
      .expect(200)
      .then(async (response) => {
        expect(response.text).toBe('Hello World!');

        const endpoints: Endpoint[] = await EndpointModel.find();
        expect(endpoints).toHaveLength(1);
        expect(endpoints[0]).toMatchObject({ method: 'GET', endpoint: '/' });
        expect(endpoints[0].callTime.slice(0, -3)).toBe(callTime.slice(0, -3)); // allow some ms difference
      });
  });

  test('multiple endpoints correctly logged to database', async () => {
    const routes = ['/', '/api/user', '/api/message'];

    return Promise.all(routes.map(endpoint => {
      return request(app)
        .get(endpoint)
        .expect(200);
    })).then(async () => {
      const endpoints: Endpoint[] = await EndpointModel.find();
      expect(endpoints).toHaveLength(3);
      expect(endpoints).toMatchObject(routes.map(route => ({ method: 'GET', endpoint: route })));
    });
  });
});
