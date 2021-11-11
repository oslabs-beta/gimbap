import { delay } from './../../testUtils';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { startWatchingClusterModel, stopWatchingClusterModel, forceUpdate, } from '../../../src/server/models/clusterModel';
import { EndpointBucketsModel, startWatchingEndpointModel, stopWatchingEndpointModel, forceAllPendingUpdates } from './../../../src/server/models/endpointBucketsModel';
import { EndpointModel, logAllEndpoints, Endpoint } from '../../../src/shared/models/endpointModel';
import { simulateServerResponses, EndpointPDF, DistributionFunction } from '../../../src/shared/utils/dataGenerator';
import { MONGODB_URI } from './../../../src/server/secrets.json';

describe('Populate database with 3 clusters, with 3 methods per cluster, and around 50 endpoints', () => {
  jest.setTimeout(60 * 60 * 1000);
  beforeAll(async () => {
    await connect(MONGODB_URI);
    await EndpointModel.deleteMany({});
    await EndpointBucketsModel.deleteMany({});
    startWatchingEndpointModel();
    startWatchingClusterModel();
  });
  afterAll(async () => {
    // await delay(60 * 1000); // wait a minute for update calls to finish, increase if you got errors at the end
    await forceAllPendingUpdates();
    await forceUpdate();
    stopWatchingEndpointModel();
    stopWatchingClusterModel();
    await disconnect();
  });
  test('Generate and load data', async () => {
    const batchSize = 5000;
    /**
     * 3 clusters -> 3 different pdf
     * 3 methods per cluster
     * ~50 endpoints per cluster
     */
    const pdf1: DistributionFunction = (x) => {
      if (x < 24 / 3) return 1;
      return 0;
    };
    const pdf2: DistributionFunction = (x) => {
      if (x > 24 / 3 && x <= (2 * 24) / 3) return 1;
      return 0;
    };
    const pdf3: DistributionFunction = (x) => {
      if (x > (2 * 24) / 3) return 1;
      return 0;
    };
    const numCallDist: DistributionFunction = () => 1000;
    const endpointsPDF: EndpointPDF[] = [];

    for (const method of ['GET', 'POST', 'DELETE']) {
      for (const pdf of [pdf1, pdf2, pdf3]) {
        for (let i = 0; i < 25 + Math.ceil(Math.random() * 25); i++) {
          let apiEndpoint;
          if (pdf === pdf1) {
            apiEndpoint = ['/api/shrek/', '/comose/llama'][Math.floor(Math.random() * 2)];
          } else if (pdf === pdf2) {
            apiEndpoint = '/swamp';
          } else {
            apiEndpoint = ['/api/applefingers', '/codeduck'][Math.floor(Math.random() * 2)];
          }
          endpointsPDF.push({ method, endpoint: apiEndpoint + i, pdf });
        }
      }
    }
    // get out of my swamp with your cubic time complexity!
    const endpoints: Endpoint[] = simulateServerResponses(endpointsPDF, numCallDist, 7);
    for (let begin = 0; begin < endpoints.length; begin += batchSize) {
      const batch = endpoints.slice(begin, begin + batchSize);
      await logAllEndpoints(batch);
      console.log(`Percent completed: ${(((begin + batchSize) / endpoints.length) * 100).toFixed(2)}`);
    }
    expect('shrek').toBe('shrek');
  });
});
