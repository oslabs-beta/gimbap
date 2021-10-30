import { getLoadData, determineClusters } from '../../../src/server/utils/endpoints';
import { ServerResponseModel, ServerResponse } from '../../../src/shared/models/serverresponseModel';
import { calculateEndpointBuckets, EndpointBuckets, stopWatchingServerResponseModel } from './../../../src/server/models/endpointBucketsModel';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { simulateServerResponses, EndpointPDF, DistributionFunction } from '../../../src/shared/utils/dataGenerator';
import { Cluster, LoadData } from '../../../src/shared/types';


describe('Generate LoadData from array of responses', () => {
  test('Should return empty array if an empty array is passed in', () => {
    const result = getLoadData({
      method: 'GET',
      endpoint: '/test',
      buckets: [],
      lastEndpointId: 1,
      oldestDate: 1,
      newestDate: 1,
    });
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  test('Should return array with correct time division', () => {
    const granularity = 30;
    // Date at beginning of day will add all calls to bucket at index 0.
    const callTime: number = new Date(new Date().toDateString()).getTime();
    const nextDayCallTime: Date = new Date(callTime);
    nextDayCallTime.setDate(nextDayCallTime.getDate() + 2);

    const buckets = Array.from({ length: (24 * 60) / granularity }, () => 1);
    buckets[0] = 1;
    const result: LoadData = getLoadData({
      method: 'GET',
      endpoint: '/test',
      buckets,
      lastEndpointId: 1,
      oldestDate: callTime,
      newestDate: nextDayCallTime.getTime(),
    }, granularity);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength((24 * 60) / granularity);
    result.forEach(([, value]) => expect(value).toBe(0.5));
  });
});

describe('Correctness of clustering algorithm using step function pdf', () => {
  beforeAll(async () => await connect('mongodb://localhost:27017/gimbap-test'));
  afterAll(async () => {
    await stopWatchingServerResponseModel();
    await disconnect();
  });

  beforeEach(async () => {
    await ServerResponseModel.deleteMany();
  });

  test('Should return a single cluster for a single endpoint', async () => {
    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api', pdf: () => 1 / 24 }
    ];
    const callDist: DistributionFunction = () => 10;
    const singleEndpointServerResponses: ServerResponse[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);
    // const buckets = vectorizeEndpoints(endpoints);

    const endpointBuckets: EndpointBuckets = calculateEndpointBuckets(singleEndpointServerResponses);

    const clusters: Cluster[] = determineClusters([endpointBuckets]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api' });
  });

  test('Should return that endpoints with same pdf belongs in the same cluster', async () => {
    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api/1', pdf: () => 1 / 24 },
      { method: 'GET', endpoint: '/api/2', pdf: (x) => x / 24 },
      { method: 'GET', endpoint: '/api/3', pdf: (x) => x / 24 },
      { method: 'POST', endpoint: '/api/4', pdf: () => 1 / 24 }
    ];
    const callDist: DistributionFunction = () => 100;
    const singleEndpointServerResponses: ServerResponse[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    // TODO place this repeated code in a function
    // group by routes
    const sortedEndpoints: ServerResponse[][] = singleEndpointServerResponses.reduce((sorted, endpoint) => {
      const index = endpointsPDF.findIndex(pdf => pdf.method === endpoint.method && pdf.endpoint === endpoint.endpoint);
      sorted[index].push(endpoint);
      return sorted;
    }, Array.from({ length: endpointsPDF.length }, () => []));

    const allEndpointBuckets: EndpointBuckets[] = sortedEndpoints.map(endpoints => calculateEndpointBuckets(endpoints));

    const clusters: Cluster[] = determineClusters(allEndpointBuckets);

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

  test('Should return that endpoints with similar pdf belongs in the same cluster', async () => {
    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api/1', pdf: () => 0.8 / 24 },
      { method: 'GET', endpoint: '/api/2', pdf: (x) => 0.8 * x / 24 },
      { method: 'GET', endpoint: '/api/3', pdf: (x) => x / 24 },
      { method: 'POST', endpoint: '/api/4', pdf: () => 1 / 24 }
    ];
    const callDist: DistributionFunction = () => 100;
    const singleEndpointServerResponses: ServerResponse[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    // group by routes
    const sortedEndpoints: ServerResponse[][] = singleEndpointServerResponses.reduce((sorted, endpoint) => {
      const index = endpointsPDF.findIndex(pdf => pdf.method === endpoint.method && pdf.endpoint === endpoint.endpoint);
      sorted[index].push(endpoint);
      return sorted;
    }, Array.from({ length: endpointsPDF.length }, () => []));

    const allEndpointBuckets: EndpointBuckets[] = sortedEndpoints.map(endpoints => calculateEndpointBuckets(endpoints));

    const clusters: Cluster[] = determineClusters(allEndpointBuckets);

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

  test('Should return that endpoints with same total calls but different timing pdf belongs in the same cluster', async () => {
    function leftStep(x) {
      if (x < 12) return 1 / 12;
      return 0;
    }
    function rightStep(x) {
      if (x > 12) return 1 / 12;
      return 0;
    }

    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api/1', pdf: leftStep },
      { method: 'GET', endpoint: '/api/2', pdf: leftStep },
      { method: 'GET', endpoint: '/api/3', pdf: rightStep },
      { method: 'POST', endpoint: '/api/4', pdf: rightStep }
    ];
    const callDist: DistributionFunction = () => 100;
    const singleEndpointServerResponses: ServerResponse[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    // group by routes
    const sortedEndpoints: ServerResponse[][] = singleEndpointServerResponses.reduce((sorted, endpoint) => {
      const index = endpointsPDF.findIndex(pdf => pdf.method === endpoint.method && pdf.endpoint === endpoint.endpoint);
      sorted[index].push(endpoint);
      return sorted;
    }, Array.from({ length: endpointsPDF.length }, () => []));

    const allEndpointBuckets: EndpointBuckets[] = sortedEndpoints.map(endpoints => calculateEndpointBuckets(endpoints));

    const clusters: Cluster[] = determineClusters(allEndpointBuckets);

    expect(clusters).toHaveLength(2);
    // no guarantee on return clustering order
    if (clusters[0][1].endpoint === '/api/1' || clusters[0][1].endpoint === '/api/2') {
      expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/1' });
      expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/2' });
      expect(clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/3' });
      expect(clusters[1]).toContainEqual({ method: 'POST', endpoint: '/api/4' });
    } else {
      expect(clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/1' });
      expect(clusters[1]).toContainEqual({ method: 'GET', endpoint: '/api/2' });
      expect(clusters[0]).toContainEqual({ method: 'GET', endpoint: '/api/3' });
      expect(clusters[0]).toContainEqual({ method: 'POST', endpoint: '/api/4' });
    }
  });

  test('Should return that endpoints with similar pdf belongs in the same cluster, even if just one cluster. No need for microservice result.', async () => {
    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api/1', pdf: () => 1 },
      { method: 'GET', endpoint: '/api/2', pdf: () => 0.9 },
      { method: 'GET', endpoint: '/api/3', pdf: () => 1.2 },
      { method: 'POST', endpoint: '/api/4', pdf: () => 0.85 }
    ];
    const callDist: DistributionFunction = () => 100;
    const singleEndpointServerResponses: ServerResponse[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    // group by routes
    const sortedEndpoints: ServerResponse[][] = singleEndpointServerResponses.reduce((sorted, endpoint) => {
      const index = endpointsPDF.findIndex(pdf => pdf.method === endpoint.method && pdf.endpoint === endpoint.endpoint);
      sorted[index].push(endpoint);
      return sorted;
    }, Array.from({ length: endpointsPDF.length }, () => []));

    const allEndpointBuckets: EndpointBuckets[] = sortedEndpoints.map(endpoints => calculateEndpointBuckets(endpoints));

    const clusters: Cluster[] = determineClusters(allEndpointBuckets);

    expect(clusters).toHaveLength(1);
  });

  // TODO thoroughly test clustering results to different types of biasing pdf functions
});
