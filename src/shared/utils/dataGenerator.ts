import { Endpoint } from './../models/endpointModel';

export type DistributionFunction = (x: number) => number;

export type EndpointPDF = {
  method: string;
  endpoint: string;
  pdf: DistributionFunction;
}

/**
 * Simulate the server responding to client calls at the specified endpoints. Algorithm is probabilistic. You specify the probability distribution function (pdf) as a function
 * for each endpoint in a 24 hour period as well as the overall server call distribution in a 24 hour period and calls are made randomly taking into account the pdf of each
 * endpoint.
 * 
 * @param {EndpointPDF[]} endpoints - Array of EndpointPDF which include method, endpoint, and pdf.
 * @param {DistributionFunction} numCallsDist - Distribution function of number of calls server received over a 24 hour period.
 * @param {number} numDays - Number of days to run simulation for.
 * @param {number} granularity - Granularity, in minutes, of internal calculation period. Defaults to 30 minutes. Smaller values means approximation is closer to continuos pdf 
 * since algorithm uses trapezoid rule numerical integration. Warning of using too small granularity: if number of calls for a granularity interval sums to less than one, no 
 * calls will be made for period.
 * 
 * @returns Array of Endpoints that simulate how a real life server would have responded given the endpoint bias in pdf.
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

/**
 * Simulate the server responding to client calls for a period of 24 hours.
 * 
 * @param {EndpointPDF} endpoints - Array of EndpointPDF which include method, endpoint, and pdf.
 * @param {DistributionFunction} numCallsDist - Distribution function of number of calls server received over a 24 hour period.
 * @param {number} granularity - Granularity, in minutes, of internal calculation period. Defaults to 30 minutes. Smaller values means approximation is closer to continuos pdf 
 * since algorithm uses trapezoid rule numerical integration. Warning of using too small granularity: if number of calls for a granularity interval sums to less than one, no 
 * calls will be made for period.
 * @param {Date} dayStart - Date indicating start of 24 hour period to be used as a full day.
 * 
 * @returns Array of Endpoints that simulate how a real life server would have responded given the endpoint bias in pdf.
 * 
 * @private
 */
function simulateSingleDayResponses(endpoints: EndpointPDF[], numCallsDist: DistributionFunction, granularity: number, dayStart: Date): Endpoint[] {
  const numIntervals = (24 * 60) / granularity;
  const intervalStartTime = new Date(dayStart);

  const dayResponses: Endpoint[] = [];
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
 * @returns {number} - area under curve between start and stop.
 * 
 * @private
 */
function integrate(fn: DistributionFunction, intervalStartTime: number, intervalEndTime: number): number {
  return 0.5 * (intervalEndTime - intervalStartTime) * (fn(intervalStartTime) + fn(intervalEndTime));
}
