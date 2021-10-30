import chiSquaredTest from 'chi-squared-test';

import { simulateServerResponses, DistributionFunction, EndpointPDF } from './../../../src/shared/utils/dataGenerator';
import { ServerResponse } from '../../../src/shared/models/serverresponseModel';

describe('Simulate server responses using uniform distributions', () => {
  test('For a single endpoint with uniform pdf and uniform call distribution of 1', () => {
    const endpointPDF: EndpointPDF = {
      method: 'GET',
      endpoint: '/api',
      pdf: () => 1 / 24,
    };
    const callDist: DistributionFunction = () => 1;
    const startDayTime: number = new Date(new Date().toLocaleDateString()).getTime();

    // one interval per hour, with call dist of 1 call per hour
    let result: ServerResponse[] = simulateServerResponses([endpointPDF], callDist, 1, 60);

    expect(result).toHaveLength(24);

    result.forEach((response: ServerResponse, i: number) => {
      expect(response).toMatchObject({ method: endpointPDF.method, endpoint: endpointPDF.endpoint });
      expect(response.callTime).toBeGreaterThanOrEqual(startDayTime + i * 60 * 60 * 1000);
      expect(response.callTime).toBeLessThanOrEqual(startDayTime + (i + 1) * 60 * 60 * 1000);
    });

    // 4 interval per hour, with call dist of 1 call per hour
    // When granularity is too small for dist, number of calls in each interval will be less than one and
    // no calls will be returned.
    result = simulateServerResponses([endpointPDF], callDist, 1, 15);
    expect(result).toHaveLength(0);

    // one interval per hour, with call dist of 1 call per hour, for multiple days
    const numDays = 7;
    result = simulateServerResponses([endpointPDF], callDist, numDays, 60);

    expect(result).toHaveLength(24 * numDays);

    result.forEach((response: ServerResponse, i: number) => {
      expect(response).toMatchObject({ method: endpointPDF.method, endpoint: endpointPDF.endpoint });
      expect(response.callTime).toBeGreaterThanOrEqual(startDayTime + i * 60 * 60 * 1000);
      expect(response.callTime).toBeLessThanOrEqual(startDayTime + (i + 1) * 60 * 60 * 1000);
    });
  });

  test('For a single endpoint with uniform pdf and large uniform call distribution', () => {
    const endpointPDF: EndpointPDF = {
      method: 'GET',
      endpoint: '/api',
      pdf: () => 1 / 24,
    };
    const callsPerHour = 100;
    const callDist: DistributionFunction = () => callsPerHour;
    const startDayTime: number = new Date(new Date().toLocaleDateString()).getTime();

    // one interval per hour, with call dist of 100 call per hour
    const result: ServerResponse[] = simulateServerResponses([endpointPDF], callDist, 1, 60);
    expect(result).toHaveLength(24 * callsPerHour);

    result.forEach((response: ServerResponse, i: number) => {
      const j = Math.floor(i / callsPerHour); // since 100 endpoints per hour

      expect(response).toMatchObject({ method: endpointPDF.method, endpoint: endpointPDF.endpoint });
      expect(response.callTime).toBeGreaterThanOrEqual(startDayTime + j * 60 * 60 * 1000);
      expect(response.callTime).toBeLessThanOrEqual(startDayTime + (j + 1) * 60 * 60 * 1000);
    });
  });

  test('Works for different granularity', () => {
    const endpointPDF: EndpointPDF = {
      method: 'GET',
      endpoint: '/api',
      pdf: () => 1 / 24,
    };
    const callsPerHour = 4;
    const granularity = 15;
    const callDist: DistributionFunction = () => callsPerHour;
    const startDayTime: number = new Date(new Date().toLocaleDateString()).getTime();

    // one interval per hour, with call dist of 100 call per hour
    const result: ServerResponse[] = simulateServerResponses([endpointPDF], callDist, 1, granularity);
    expect(result).toHaveLength(24 * callsPerHour);

    result.forEach((response: ServerResponse, i: number) => {
      expect(response).toMatchObject({ method: endpointPDF.method, endpoint: endpointPDF.endpoint });
      expect(response.callTime).toBeGreaterThanOrEqual(startDayTime + i * granularity * 60 * 1000);
      expect(response.callTime).toBeLessThanOrEqual(startDayTime + (i + 1) * granularity * 60 * 1000);
    });
  });

  test('Returned times in an interval follow a uniform distribution', () => {
    const endpoints: EndpointPDF[] = [
      {
        method: 'GET',
        endpoint: '/api/1',
        pdf: () => 1 / 24,
      },
    ];
    const numCallsPerInterval = 480; // make it divisible by 24
    const callDist: DistributionFunction = () => numCallsPerInterval / 24;
    const startDayTime: number = new Date(new Date().toLocaleDateString()).getTime();

    // single interval day long
    const result: ServerResponse[] = simulateServerResponses(endpoints, callDist, 1, 24 * 60);

    expect(result).toHaveLength(numCallsPerInterval);

    const numBuckets = 10, observedFrequencies: number[] = [];
    const bucketIntervalLength = 24 * 60 * 60 * 1000 / numBuckets;
    for (let i = 0; i < numBuckets; i++) {
      observedFrequencies[i] = result.filter(endpoint => endpoint.callTime >= startDayTime + i * bucketIntervalLength && endpoint.callTime <= startDayTime + (i + 1) * bucketIntervalLength).length;
    }

    const expected: number[] = Array.from({ length: numBuckets }, () => numCallsPerInterval / numBuckets);

    // We use a Chi Squared Test to test probability that interval times are uniformly distributed
    const probability = chiSquaredTest(observedFrequencies, expected, 1);
    expect(probability.probability).toBeGreaterThan(0.10);
  });

  test('For a multiple endpoint with uniform pdf and uniform call distribution of 1', () => {
    const endpoints: EndpointPDF[] = [
      {
        method: 'GET',
        endpoint: '/api/1',
        pdf: () => 1 / 24,
      },
      {
        method: 'GET',
        endpoint: '/api/2',
        pdf: () => 1 / 24,
      },
      {
        method: 'GET',
        endpoint: '/api/3',
        pdf: () => 1 / 24,
      },
      {
        method: 'GET',
        endpoint: '/api/4',
        pdf: () => 1 / 24,
      },
      {
        method: 'GET',
        endpoint: '/api/5',
        pdf: () => 1 / 24,
      },
    ];
    const callDist: DistributionFunction = () => 1;
    const numDays = 100;

    // one interval per hour, with call dist of 1 call per hour
    const result: ServerResponse[] = simulateServerResponses(endpoints, callDist, numDays, 60);

    expect(result).toHaveLength(24 * numDays);

    // Expect distribution of endpoints to be roughly uniform
    const endpointFrequencies: { [key: string]: number } = result.reduce(
      (frequencies: { [key: string]: number }, endpoint: ServerResponse): { [key: string]: number } => {
        frequencies[endpoint.endpoint] ??= 0;
        frequencies[endpoint.endpoint]++;

        return frequencies;
      }, Object.create(null)
    );

    // We use a Chi Squared Test to test probability that endpoint frequency is uniformly distributed
    const observed: number[] = Object.values(endpointFrequencies);
    const expected: number[] = Array.from({ length: observed.length }, () => (24 * numDays) / endpoints.length);

    const probability = chiSquaredTest(observed, expected, 1);
    expect(probability.probability).toBeGreaterThan(0.10);
  });
});
