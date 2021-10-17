/**
 * Utility used to generate endpoint biased data sets.
 */

import { Endpoint } from './../models/endpointModel';

export type DistributionFunction = (x: number) => number;

export type EndpointPDF = {
  method: string;
  endpoint: string;
  pdf: DistributionFunction;
}

/**
 * TODO
 * 
 * @param endpoints 
 * @param numCallsDist 
 * @param numDays 
 * @param granularity 
 * 
 * @returns
 * 
 * @public
 */
export function simulateServerResponses(endpoints: EndpointPDF[], numCallsDist: DistributionFunction, numDays: number, granularity = 30): Endpoint[] {
  if ((24 * 60) % granularity !== 0) throw new RangeError('Granularity does not divide a day.');

  const dayStartTime: Date = new Date(new Date().toLocaleDateString());

  const simulatedCalls: Endpoint[] = [];
  for (let i = 0; i < numDays; i++) {
    simulatedCalls.push(...simulateSingleDayResponses(endpoints, numCallsDist, granularity, dayStartTime));

    // Increment the day start time by one day
    dayStartTime.setDate(dayStartTime.getDate() + 1);
  }

  return simulatedCalls;
}

function simulateSingleDayResponses(endpoints: EndpointPDF[], numCallsDist: DistributionFunction, granularity: number, dayStart: Date): Endpoint[] {
  const numIntervals = (24 * 60) / granularity;
  const intervalStartTime = new Date(dayStart);

  const dayResponses = [];
  for (let i = 0; i < numIntervals; i++) {
    const intervalStartHour: number = intervalStartTime.getHours() + (intervalStartTime.getMinutes() / 60);
    const intervalEndHour: number = intervalStartTime.getHours() + ((intervalStartTime.getMinutes() + granularity) / 60);

    // determine number of server calls in interval
    const numServerCalls: number = Math.floor(integrate(numCallsDist, intervalStartHour, intervalEndHour));

    // build random endpoint selection array
    // each endpoint will be the value for 100 * # endpoint * probability indices in the array
    const endpointSelectionArray: EndpointPDF[] = endpoints.reduce(
      (selectionArray: EndpointPDF[], endpoint: EndpointPDF): EndpointPDF[] => {
        // endpoints probability as the interval's midpoint probability
        const probability = endpoint.pdf((intervalStartHour + intervalEndHour) / 2);

        const numIndices = Math.round(100 * endpoints.length * probability);
        for (let i = 0; i < numIndices; i++) selectionArray.push(endpoint);

        return selectionArray;
      }, []);

    const intervalResponses: Endpoint[] = Array.from({ length: numServerCalls }, (): Endpoint => {
      const endpoint: EndpointPDF = endpointSelectionArray[Math.floor(Math.random() * endpointSelectionArray.length)];

      // pick time from random uniform distribution in interval
      const callTime = new Date(intervalStartTime);
      callTime.setMinutes(callTime.getMinutes() + Math.round(Math.random() * granularity));

      return {
        method: endpoint.method,
        endpoint: endpoint.endpoint,
        callTime: callTime.getTime(),
      };
    });

    dayResponses.push(...intervalResponses);

    // Increment interval start time by the granularity
    intervalStartTime.setMinutes(intervalStartTime.getMinutes() + granularity);
  }

  return dayResponses;
}

/**
 * Numerically calculated approximation to the definite integral by trapezoid rule.
 * 
 * @param {DistributionFunction} fn - Function to be integrated between intervalStartTime and intervalEndTime.
 * @param {number} intervalStartTime - Position on the x-axis at which to begin integration.
 * @param {number} intervalEndTime - Position on the x-aix at which to end integration.
 * 
 * @private
 */
function integrate(fn: DistributionFunction, intervalStartTime: number, intervalEndTime: number): number {
  return 0.5 * (intervalEndTime - intervalStartTime) * (fn(intervalStartTime) + fn(intervalEndTime));
}
