import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB if a connection has not already been established. Used for lazy connecting.
 * 
 * @param {string} mongoURI - URI to connect to database.
 * 
 * @public
 */
export async function connect(mongoURI: string): Promise<void> {
  if (!mongoURI.match(/mongodb/i)) throw new Error(`Invalid MongoDB URI: ${mongoURI}`);

  if (!isConnected) {
    isConnected = true;
    await mongoose.connect(mongoURI);
  }
}

/**
 * Disconnect from MongoDB.
 * 
 * @public
 */
export async function disconnect(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
