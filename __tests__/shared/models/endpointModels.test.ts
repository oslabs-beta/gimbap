import { connect, disconnect } from './../../../src/shared/models/mongoSetup';
import { EndpointModel, Endpoint, logEndpoint, getAllEndpoints } from './../../../src/shared/models/endpointModel';

describe('Test storing endpoints', () => {
  beforeAll(async () => {
    await connect('mongodb://localhost:27017/gimbap-test');
  });

  afterAll(async () => {
    await EndpointModel.deleteMany({});
    return await disconnect();
  });

  beforeEach(async () => {
    await EndpointModel.deleteMany({});
  });

  test('Log a single endpoint to database', async () => {
    const method = 'GET';
    const endpoint = 'api/fun';
    const callTime: number = Date.now();

    await logEndpoint(method, endpoint, callTime);

    const result: Endpoint[] = await EndpointModel.find({});
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ method, endpoint, callTime });
  });

  test('Log a multiple endpoint to database', async () => {
    const methods: string[] = ['GET', 'POST', 'DELETE'];
    const endpoints: string[] = ['api/1', 'api/2', 'api/3'];
    const callTimes: number[] = [new Date('1/1/01').getTime(), new Date('1/2/01').getTime(), new Date('1/3/01').getTime()];

    for (let i = 0; i < methods.length; i++)
      await logEndpoint(methods[i], endpoints[i], callTimes[i]);

    const result = await EndpointModel.find({});

    expect(result).toHaveLength(methods.length);
    for (let i = 0; i < methods.length; i++)
      expect(result[i]).toMatchObject({ method: methods[i], endpoint: endpoints[i], callTime: callTimes[i] });
  });
});

describe('Test retrieving endpoints', () => {
  beforeAll(async () => {
    await connect('mongodb://localhost:27017/gimbap-test');
  });

  afterAll(async () => {
    await EndpointModel.deleteMany({});
    return await disconnect();
  });

  beforeEach(async () => {
    await EndpointModel.deleteMany({});
  });

  test('Get a list of all endpoints', async () => {
    const endpoints: Endpoint[] = [
      { method: 'GET', endpoint: 'api/1', callTime: 1 },
      { method: 'GET', endpoint: 'api/1', callTime: 2 },
      { method: 'GET', endpoint: 'api/1', callTime: 3 },
      { method: 'DELETE', endpoint: 'api/1', callTime: 4 },
      { method: 'GET', endpoint: 'api/2', callTime: 5 },
      { method: 'GET', endpoint: 'api/2', callTime: 6 },
      { method: 'POST', endpoint: 'api/2', callTime: 7 },
      { method: 'POST', endpoint: 'api/2', callTime: 8 },
    ];

    await EndpointModel.insertMany(endpoints);

    const result: Endpoint[] = await getAllEndpoints();
    expect(result).toHaveLength(endpoints.length);
    expect(result).toMatchObject(endpoints);
  });

  test('Get endpoints matching specific method and route', async () => {
    const getApi1: Endpoint[] = [
      { method: 'GET', endpoint: 'api/1', callTime: 1 },
      { method: 'GET', endpoint: 'api/1', callTime: 2 },
      { method: 'GET', endpoint: 'api/1', callTime: 3 },
    ];
    const deleteApi1: Endpoint[] = [
      { method: 'DELETE', endpoint: 'api/1', callTime: 4 },
    ];
    const getApi2: Endpoint[] = [
      { method: 'GET', endpoint: 'api/2', callTime: 5 },
      { method: 'GET', endpoint: 'api/2', callTime: 6 },
    ];
    const postApi2: Endpoint[] = [
      { method: 'POST', endpoint: 'api/2', callTime: 7 },
      { method: 'POST', endpoint: 'api/2', callTime: 8 },
    ];

    await EndpointModel.insertMany([...getApi1, ...deleteApi1, ...getApi2, ...postApi2]);

    for (const api of [getApi1, deleteApi1, getApi2, postApi2]) {
      const result: Endpoint[] = await getAllEndpoints(api[0].method, api[0].endpoint);
      expect(result).toHaveLength(api.length);
      for (let i = 1; i < api.length; i++) {
        expect(result[i]).toMatchObject(api[i]);
      }
    }
  });
});
