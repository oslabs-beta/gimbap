import { delay } from '../../testUtils';

import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import {
  ClusterModel,
  startWatchingClusterModel,
  stopWatchingClusterModel,
  forceUpdate,
  getClusters,
} from '../../../src/server/models/clusterModel';
import {
  MIN_NUM_CHANGES_TO_UPDATE,
  EndpointBucketsModel,
  stopWatchingEndpointModel,
  startWatchingEndpointModel,
  forceAllPendingUpdates
} from './../../../src/server/models/endpointBucketsModel';
import { EndpointModel, logAllEndpoints, Endpoint } from '../../../src/shared/models/endpointModel';
import { simulateServerResponses, EndpointPDF, DistributionFunction } from '../../../src/shared/utils/dataGenerator';
import { Cluster } from '../../../src/shared/types';

// Note to user: to make this test work, follow instructions here to convert your database to a replica set
// https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/


jest.setTimeout(10 * 1000);


describe('ClusterModel tests', () => {
  beforeAll(async () => {
    await connect('mongodb://localhost:27017/gimbap-test');
  });

  afterAll(async () => {
    await ClusterModel.deleteMany({});
    await EndpointBucketsModel.deleteMany({});
    await EndpointModel.deleteMany({});
    stopWatchingClusterModel();
    await stopWatchingEndpointModel();
    return await disconnect();
  });

  beforeEach(async () => {
    stopWatchingClusterModel();
    await stopWatchingEndpointModel();
    startWatchingEndpointModel();
    startWatchingClusterModel();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await ClusterModel.deleteMany({});
    await EndpointBucketsModel.deleteMany({});
    await EndpointModel.deleteMany({});
  });

  describe('Test storing cluster model', () => {
    test('Waiting less than the required timeout should not trigger update functionality', async () => {
      let result = await ClusterModel.find({});
      expect(result).toHaveLength(0); // sanity check
      const result2 = await EndpointBucketsModel.find({});
      expect(result2).toHaveLength(0); // sanity check

      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();
      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      await forceAllPendingUpdates(); // endpoint buckets

      result = await ClusterModel.find({});
      // expect no update to have occurred
      expect(result).toHaveLength(0);
    });

    test('Forcing update should trigger update functionality', async () => {
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();
      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      await forceAllPendingUpdates(); // endpoint buckets

      await forceUpdate(); // cluster model

      const result = await ClusterModel.find({});
      // expect no update to have occurred
      expect(result).toHaveLength(1);
      expect(result[0].clusters).toBeInstanceOf(Array);
      expect(result[0].clusters).toHaveLength(1);
      expect(result[0].clusters[0]).toMatchObject([{ method: 'GET', endpoint: '/test' }]);
    });

    test('Should cluster endpoints correctly', async () => {
      // Only weakly testing this here, full testing of clustering algorithm is done in endpoints.test.ts

      const endpointsPDF: EndpointPDF[] = [
        { method: 'GET', endpoint: '/api/1', pdf: () => 1 / 24 },
        { method: 'GET', endpoint: '/api/2', pdf: (x) => x / 24 },
        { method: 'GET', endpoint: '/api/3', pdf: (x) => x / 24 },
        { method: 'POST', endpoint: '/api/4', pdf: () => 1 / 24 }
      ];
      const callDist: DistributionFunction = () => 100;
      const endpoints: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 2);

      await logAllEndpoints(endpoints);
      await delay(200);

      await forceAllPendingUpdates(); // endpoint buckets

      await forceUpdate(); // cluster model

      const result = await ClusterModel.find({});

      // expect no update to have occurred
      expect(result).toHaveLength(1);
      expect(result[0].clusters).toBeInstanceOf(Array);

      const clusters: Cluster[] = result[0].clusters.map(dbCluster => dbCluster.map(dbRoute => ({ method: dbRoute.method, endpoint: dbRoute.endpoint })));
      expect(clusters).toHaveLength(2);
      // no guarantee on return clustering order
      if (clusters[0][1].endpoint === '/api/1' || clusters[0][1].endpoint === '/api/4') {
        expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/1' });
        expect(clusters[0]).toContainEqual({ method: 'POST', endpoint: '/api/4' });
        expect(clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/2' });
        expect(clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/3' });
      } else {
        expect(clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/1' });
        expect(clusters[1]).toContainEqual({ method: 'POST', endpoint: '/api/4' });
        expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/2' });
        expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/3' });
      }
    });

    // TODO figure out how to mock the timer to test the time based update
  });


  describe('Test retrieving cluster model', () => {
    test('Retrieve buckets for an empty database', async () => {
      const result: Cluster[] | null = await getClusters();
      expect(result).toBeNull();
    });

    test('Retrieve clusters for a filled database', async () => {
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();
      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      await forceAllPendingUpdates(); // endpoint buckets

      await forceUpdate(); // cluster model

      const result: Cluster[] | null = await getClusters();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject([{ method: 'GET', endpoint: '/test' }]);
    });

    test('Test retrieving clusters before an update has occurred. An update should be forced when retrieval is attempted on a database without cluster model.', async () => {
      // Date at beginning of day will add all calls to bucket at index 0.
      const callTime: number = new Date(new Date().toDateString()).getTime();
      const endpoints: Endpoint[] = Array.from({ length: MIN_NUM_CHANGES_TO_UPDATE }, () => ({ method: 'GET', endpoint: '/test', callTime }));
      await logAllEndpoints(endpoints);
      await delay(200);

      await forceAllPendingUpdates(); // endpoint buckets

      const result: Cluster[] | null = await getClusters();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject([{ method: 'GET', endpoint: '/test' }]);
    });
  });
});
