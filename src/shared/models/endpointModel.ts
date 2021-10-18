import mongoose from 'mongoose';

// TODO abstract so it can work with either MongoDB or PostgreSQL depending on how setup is called.

export type Endpoint = { method: string, endpoint: string, callTime: number };

export const EndpointModel = mongoose.model<Endpoint>('Endpoint', new mongoose.Schema<Endpoint>({
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  callTime: { type: Number, required: true }, // unix timestamp
  //response_time: { type: Number, required: true }, // ms
}));
// TODO add validation for call_time to be convertible to Date

/**
 * Log an endpoint request data point to external database.
 * 
 * @param {String} method - HTTP method type
 * @param {String} endpoint - HTTP request relative endpoint
 * @param {number} callTime - UNIX timestamp of when request first communicated with the server
 * 
 * @public
 */
export async function logEndpoint(method: string, endpoint: string, callTime: number): Promise<void> {
  // TODO validate inputs

  try {
    await EndpointModel.create({
      method,
      endpoint,
      callTime,
    });
  } catch (error) {
    console.error('\n\nERROR LOGGING RESPONSE TO DATABASE');
    console.error(error);
    console.log('\n\n');
  }
}
