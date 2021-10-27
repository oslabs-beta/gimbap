import { delay } from '../../testUtils';

import { connect, disconnect } from './../../../src/shared/models/mongoSetup';
import {
  EndpointBucketsModel,
  EndpointBuckets,
  startWatchingEndpointModel,
  stopWatchingEndpointModel,
  getEndpointBuckets,
  getAllEndpointBuckets,
  getDistinctRoutes,
  forceAllPendingUpdated,
  MIN_NUM_CHANGES_TO_UPDATE,
  NUM_DAILY_DIVISIONS,
} from './../../../src/server/models/endpointBucketsModel';
import { EndpointModel, logEndpoint, logAllEndpoints, Endpoint } from './../../../src/shared/models/endpointModel';
import { Route } from './../../../src/shared/types';

// Note to user: to make this test work, follow instructions here to convert your database to a replica set
// https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/

describe('EndpointBuckets tests', () => {
  beforeAll(async () => {
    await connect('mongodb://localhost:27017/gimbap-test');
  });

  afterAll(async () => {
    await EndpointModel.deleteMany({});
    await EndpointBucketsModel.deleteMany({});
    await stopWatchingEndpointModel();
    return await disconnect();
  });

  beforeEach(async () => {
    await stopWatchingEndpointModel();
    startWatchingEndpointModel();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await EndpointModel.deleteMany({});
    await EndpointBucketsModel.deleteMany();
  });

  describe('Test storing endpoint buckets', () => {
    test('Updating less than the required number of changes should not trigger update functionality', async () => {
      let result = await EndpointBucketsModel.find({});
      expect(result).toHaveLength(0); // sanity check

      // add one less than needed number of change events to trigger update
      for (let i = 0; i < MIN_NUM_CHANGES_TO_UPDATE - 1; i++) {
        await logEndpoint('GET', '/test', Date.now());
      }

      result = await EndpointBucketsModel.find({});
      // expect no update to have occurred
      expect(result).toHaveLength(0);
    });

    test('Updating more than the required number of changes should trigger update functionality', async () => {
      let result: EndpointBuckets[] = await EndpointBucketsModel.find({});
      expect(result).toHaveLength(0); // sanity check

      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();

      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);

      await delay(200);

      result = await EndpointBucketsModel.find({});
      // expect no update to have occurred
      expect(result).toHaveLength(1);
      expect(result[0].buckets).toHaveLength(NUM_DAILY_DIVISIONS);
      expect(result[0].buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE);
    });

    test('Multiple updates correctly updates endpoint bucket', async () => {
      const numUpdates = 3;
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();

      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      for (let i = 0; i < numUpdates; i++) {
        await logAllEndpoints(endpoints);
      }

      await delay(200);

      const result = await EndpointBucketsModel.find({});

      // expect no update to have occurred
      expect(result).toHaveLength(1);
      expect(result[0].buckets).toHaveLength(NUM_DAILY_DIVISIONS);
      expect(result[0].buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE * numUpdates);
    });

    // TODO figure out how to mock the timer to test the time based update
    // test('Test storing endpoint buckets because 5 minute timeout has occurred, even before enough data entry events have caused an update', async () => {
    //   // Date at beginning of day will add all calls to bucket at index 0.
    //   const callTime: number = new Date(new Date().toDateString()).getTime();
    //   await stopWatchingEndpointModel();

    //   jest.useFakeTimers('legacy');
    //   Promise.resolve().then(() => jest.advanceTimersByTime(5 * 60 * 1000)); // because jest timer mocks are broken https://stackoverflow.com/questions/51126786/jest-fake-timers-with-promises 

    //   startWatchingEndpointModel();

    //   const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE - 1 }, () => ({ method: 'GET', endpoint: '/test', callTime }));
    //   await logAllEndpoints(endpoints);
    //   await delay(200);

    //   jest.spyOn(global, 'setTimeout');

    //   const inDatabase: EndpointBuckets[] = await EndpointBucketsModel.find({});
    //   expect(inDatabase).toHaveLength(0); // sanity check

    //   const result: EndpointBuckets[] = await EndpointBucketsModel.find({});
    //   // expect no update to have occurred
    //   expect(result).toHaveLength(1);
    //   expect(result[0].buckets).toHaveLength(NUM_DAILY_DIVISIONS);
    //   expect(result[0].buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE - 1);
    // });
  });


  describe('Test retrieving endpoint buckets', () => {
    test('Retrieve buckets for an empty database', async () => {
      const result: EndpointBuckets = await getEndpointBuckets('GET', '/test');
      expect(result).toBeNull();
    });

    test('Retrieve buckets for a filled database', async () => {
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();

      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE - 1 }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);
      await logEndpoint('GET', '/test', callTime + 1);
      await delay(200);

      const result: EndpointBuckets = await getEndpointBuckets('GET', '/test');
      // expect no update to have occurred
      expect(result.method).toBe('GET');
      expect(result.endpoint).toBe('/test');
      expect(result.oldestDate).toBe(callTime);
      expect(result.newestDate).toBe(callTime + 1);
      expect(result.buckets).toHaveLength(NUM_DAILY_DIVISIONS);
      expect(result.buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE);
    });

    test('Test retrieving endpoint buckets before an update has occurred. An update should be forced when retrieval is attempted on an empty database.', async () => {
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();

      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE - 1 }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      const inDatabase: EndpointBuckets[] = await EndpointBucketsModel.find({});
      expect(inDatabase).toHaveLength(0); // sanity check

      const result: EndpointBuckets = await getEndpointBuckets('GET', '/test');
      // expect no update to have occurred
      expect(result.buckets).toHaveLength(NUM_DAILY_DIVISIONS);
      expect(result.buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE - 1);
    });

    test('Test retrieving all endpoint buckets from the database.', async () => {
      const method1 = 'GET', method2 = 'POST';
      const endpoint1 = '/api/1', endpoint2 = '/api/2';
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();

      let endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: method1, endpoint: endpoint1, callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      endpoints = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: method2, endpoint: endpoint2, callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      const result: EndpointBuckets[] = await getAllEndpointBuckets();
      expect(result).toHaveLength(2);
      expect(result[0].buckets).toHaveLength(NUM_DAILY_DIVISIONS);
      expect(result[0].buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE);
      expect(result[1].buckets).toHaveLength(NUM_DAILY_DIVISIONS);
      expect(result[1].buckets[0]).toBe(MIN_NUM_CHANGES_TO_UPDATE);
    });

    test('Test retrieving all endpoint buckets from an empty database.', async () => {
      const result: EndpointBuckets[] = await getAllEndpointBuckets();
      expect(result).toHaveLength(0);
    });

    test('Get distinct endpoints', async () => {
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

      await logAllEndpoints([...getApi1, ...deleteApi1, ...getApi2, ...postApi2]);
      await delay(200);

      await forceAllPendingUpdated();

      const result2: EndpointBuckets[] = await getAllEndpointBuckets();
      console.log({ result2 });

      const result: Route[] = await getDistinctRoutes();

      expect(result).toHaveLength(4);
      expect(result).toMatchObject([
        { method: 'GET', endpoint: 'api/1' },
        { method: 'DELETE', endpoint: 'api/1' },
        { method: 'GET', endpoint: 'api/2' },
        { method: 'POST', endpoint: 'api/2' },
      ]);
    });
  });
});
