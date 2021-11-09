import mongoose, { QueryOptions } from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

// TODO abstract so it can work with either MongoDB or PostgreSQL depending on how setup is called.

export interface Endpoint { method: string, endpoint: string, callTime: number, _id?: number }

const EndpointSchema = new mongoose.Schema<Endpoint>({
  _id: { type: Number, required: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  callTime: { type: Number, required: true }, // unix timestamp
});
// use auto incrementing _id of type Number
EndpointSchema.plugin(autoIncrement, {
  model: 'Endpoint',
  startAt: 0,
  incrementBy: 1,
});
// TODO add validation for call_time to be convertible to Date
export const EndpointModel = mongoose.model<Endpoint>('Endpoint', EndpointSchema);

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

/**
 * Log an array of endpoint request data point to external database.
 *
 * @param {Endpoint[]} endpoints - Array of endpoints to be added to database.
 *
 * @public
 */
export async function logAllEndpoints(endpoints: Endpoint[]): Promise<void> {
  // TODO validate inputs

  try {
    await EndpointModel.insertMany(endpoints);
  } catch (error) {
    console.error('\n\nERROR LOGGING RESPONSES TO DATABASE - LOG MANY');
    console.error(error);
    console.log('\n\n');
  }
}

/**
 * Get a list of all endpoints. If no method or endpoint is specified, it will return all endpoints in the database.
 * 
 * @param {string} method - (optional) HTTP method
 * @param {string} endpoint - (optional) HTTP request relative endpoint
 * @param {number} afterId -(optional) _id of EndpointModel used to filter result to include only _id greater than this value
 * @returns Promise of array of endpoints
 *
 * @public
 */
export async function getAllEndpoints(method?: string, endpoint?: string, afterId?: number): Promise<Endpoint[]> {
  const query: QueryOptions = {};
  if (method) query.method = method;
  if (endpoint) query.endpoint = endpoint;
  if (afterId) query._id = { $gt: afterId };

  return await EndpointModel.find(query);
}


/**
 * Get the last endpoint. If no endpoints exit in database, it will return null.
 * 
 * @returns Promise of the last endpoint or null if no endpoints in collection
 *
 * @public
 */
export async function getLastEndpoint(): Promise<Endpoint & { _id: number } | null> {
  return await EndpointModel.findOne().sort({ _id: -1 });
}
