import { connect, disconnect } from './../../../src/shared/models/mongoSetup';
import { ServerResponseModel, ServerResponse, logResponse, getAllResponses } from '../../../src/shared/models/serverresponseModel';

describe('Test storing endpoints', () => {
  beforeAll(async () => {
    await connect('mongodb://localhost:27017/gimbap-test');
  });

  afterAll(async () => {
    await ServerResponseModel.deleteMany({});
    return await disconnect();
  });

  beforeEach(async () => {
    await ServerResponseModel.deleteMany({});
  });

  test('Log a single endpoint to database', async () => {
    const method = 'GET';
    const endpoint = 'api/fun';
    const callTime: number = Date.now();

    await logResponse(method, endpoint, callTime);

    const result: ServerResponse[] = await ServerResponseModel.find({});
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ method, endpoint, callTime });
  });

  test('Log multiple responses to database', async () => {
    const methods: string[] = ['GET', 'POST', 'DELETE'];
    const endpoints: string[] = ['api/1', 'api/2', 'api/3'];
    const callTimes: number[] = [new Date('1/1/01').getTime(), new Date('1/2/01').getTime(), new Date('1/3/01').getTime()];

    for (let i = 0; i < methods.length; i++)
      await logResponse(methods[i], endpoints[i], callTimes[i]);

    const result = await ServerResponseModel.find({});

    expect(result).toHaveLength(methods.length);
    for (let i = 0; i < methods.length; i++)
      expect(result[i]).toMatchObject({ method: methods[i], endpoint: endpoints[i], callTime: callTimes[i] });
  });
});

describe('Test retrieving responsess', () => {
  beforeAll(async () => {
    await connect('mongodb://localhost:27017/gimbap-test');
  });

  afterAll(async () => {
    await ServerResponseModel.deleteMany({});
    return await disconnect();
  });

  beforeEach(async () => {
    await ServerResponseModel.deleteMany({});
  });

  test('Get a list of all responses', async () => {
    const responses: ServerResponse[] = [
      { method: 'GET', endpoint: 'api/1', callTime: 1 },
      { method: 'GET', endpoint: 'api/1', callTime: 2 },
      { method: 'GET', endpoint: 'api/1', callTime: 3 },
      { method: 'DELETE', endpoint: 'api/1', callTime: 4 },
      { method: 'GET', endpoint: 'api/2', callTime: 5 },
      { method: 'GET', endpoint: 'api/2', callTime: 6 },
      { method: 'POST', endpoint: 'api/2', callTime: 7 },
      { method: 'POST', endpoint: 'api/2', callTime: 8 },
    ];

    await ServerResponseModel.insertMany(responses);

    const result: ServerResponse[] = await getAllResponses();
    expect(result).toHaveLength(responses.length);
    expect(result).toMatchObject(responses);
  });

  test('Get responses matching specific method and route', async () => {
    const getApi1: ServerResponse[] = [
      { method: 'GET', endpoint: 'api/1', callTime: 1 },
      { method: 'GET', endpoint: 'api/1', callTime: 2 },
      { method: 'GET', endpoint: 'api/1', callTime: 3 },
    ];
    const deleteApi1: ServerResponse[] = [
      { method: 'DELETE', endpoint: 'api/1', callTime: 4 },
    ];
    const getApi2: ServerResponse[] = [
      { method: 'GET', endpoint: 'api/2', callTime: 5 },
      { method: 'GET', endpoint: 'api/2', callTime: 6 },
    ];
    const postApi2: ServerResponse[] = [
      { method: 'POST', endpoint: 'api/2', callTime: 7 },
      { method: 'POST', endpoint: 'api/2', callTime: 8 },
    ];

    await ServerResponseModel.insertMany([...getApi1, ...deleteApi1, ...getApi2, ...postApi2]);

    for (const api of [getApi1, deleteApi1, getApi2, postApi2]) {
      const result: ServerResponse[] = await getAllResponses(api[0].method, api[0].endpoint);
      expect(result).toHaveLength(api.length);
      for (let i = 1; i < api.length; i++) {
        expect(result[i]).toMatchObject(api[i]);
      }
    }
  });
});
