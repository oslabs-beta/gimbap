import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import request from 'supertest';
import app from './../../../src/server/index';

describe('test out all our routes', () => {
  jest.setTimeout(15 * 60 * 1000);


beforeAll(async () => {
  await connect('mongodb+srv://admin:test@cluster0.dopf4.mongodb.net/DePaul?retryWrites=true&w=majority');
  app.get('/banana', (req, res) => res.send('Hello from Parker'));
  // await EndpointModel.deleteMany();
});

afterAll(async () => {
  // await EndpointModel.deleteMany();
  await disconnect();
});


test('GET / (getClusterList)', async () => {

  // setup a db
  // delete before testing
  // populate data, then test for that data existence


  return request(app)
    .get('/banana')
    // .expect(200)
    .then(async (response) => {
      console.log('Response: ', response);
      expect(response.text).toBe('Hello from Parker');
    });
  // const exampleCluster: Cluster = [
  //   { method: 'get', endpoint:'/api' },
  //   { method: 'get', endpoint:'/api' },
  //   { method: 'get', endpoint:'/api' }
  // ];

  // await supertest(router).get('/')
  //   .expect(200)
  //   .then((response) => {
  //     // Check type and length
  //     // expect(Array.isArray(response.body)).toBeTruthy();
  //     // expect(response.body.length).toEqual(1);
  //     // Check data
  //     expect(1).toBe(1);
  //     expect(response.body[0].method).toBe(exampleCluster[0].method);
  //     expect(response.body[0].endpoint).toBe(exampleCluster[0].endpoint);
    });
  });
