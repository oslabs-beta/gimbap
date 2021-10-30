import express, { Application } from 'express';
import request from 'supertest';
import gimbap from './../../src/npm';
import {  ServerResponseModel,  ServerResponse } from '../../src/shared/models/serverresponseModel';

xdescribe('gimbap logs route request to MongoDB', () => {
  let app: Application;

  beforeAll(async () => {
    app = express();

    await gimbap(app, 'mongodb', 'mongodb://localhost:27017/gimbap-test');

    app.get('/', (req, res) => res.send('Hello World!'));
    app.get('/api/user', (req, res) => res.send('Miguel'));
    app.get('/api/message', (req, res) => res.send('TDD!'));
  });

  afterAll(async () => {
    await ServerResponseModel.deleteMany({});
    return gimbap.stop();
  });

  beforeEach(async () => {
    await ServerResponseModel.deleteMany({});
  });

  test('single response correctly logged to database', async () => {
    const callTime: number = Date.now();

    return request(app)
      .get('/')
      .expect(200)
      .then(async (response) => {
        expect(response.text).toBe('Hello World!');

        const responses: ServerResponse[] = await ServerResponseModel.find({});
        expect(responses).toHaveLength(1);
        expect(responses[0]).toMatchObject({ method: 'GET', endpoint: '/' });
        expect(responses[0].callTime - callTime).toBeLessThan(100); // allow 100 ms difference 
      });
  });

  test('multiple responses correctly logged to database', async () => {
    const routes = ['/', '/api/user', '/api/message'];

    return Promise.all(routes.map(response => {
      return request(app)
        .get(response)
        .expect(200);
    })).then(async () => {
      const responses: ServerResponse[] = await ServerResponseModel.find({});
      expect(responses).toHaveLength(3);
      expect(responses).toMatchObject(routes.map(route => ({ method: 'GET', endpoint: route })));
    });
  });
});
