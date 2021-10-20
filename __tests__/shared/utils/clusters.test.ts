import { determineClusters, Cluster } from '../../../src/server/utils/endpoints';
import { EndpointModel, Endpoint } from './../../../src/shared/models/endpointModel';
import { connect, disconnect } from './../../../src/shared/models/mongoSetup';
import { simulateServerResponses, EndpointPDF, DistributionFunction } from './../../../src/shared/utils/dataGenerator';


describe('Correctness of clustering algorithm using step function pdf', () => {
  beforeAll(async () => await connect('mongodb://localhost:27017/gimbap-test'));
  afterAll(async () => await disconnect());

  beforeEach(async () => {
    await EndpointModel.deleteMany();
  });

  test('Should return a single cluster for a single endpoint', async () => {
    const endpointsPDF: EndpointPDF[] = [
      { method: 'GET', endpoint: '/api', pdf: () => 1 / 24 }
    ];
    const callDist: DistributionFunction = () => 10;
    const singleEndpointServerResponses: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    const clusters: Cluster[] = determineClusters(singleEndpointServerResponses);

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
    const singleEndpointServerResponses: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    const clusters: Cluster[] = determineClusters(singleEndpointServerResponses);

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
      { method: 'GET', endpoint: '/api/1', pdf: () => 0.7 / 24 },
      { method: 'GET', endpoint: '/api/2', pdf: (x) => 0.7 * x / 24 },
      { method: 'GET', endpoint: '/api/3', pdf: (x) => x / 24 },
      { method: 'POST', endpoint: '/api/4', pdf: () => 1 / 24 }
    ];
    const callDist: DistributionFunction = () => 100;
    const singleEndpointServerResponses: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    const clusters: Cluster[] = determineClusters(singleEndpointServerResponses);

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
    const singleEndpointServerResponses: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    const clusters: Cluster[] = determineClusters(singleEndpointServerResponses);

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
    const singleEndpointServerResponses: Endpoint[] = simulateServerResponses(endpointsPDF, callDist, 5, 60);

    const clusters: Cluster[] = determineClusters(singleEndpointServerResponses);

    expect(clusters).toHaveLength(1);
  });

  // TODO thoroughly test clustering results to different types of biasing pdf functions
});
