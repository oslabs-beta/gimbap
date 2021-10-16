import { Express as ExpressApp } from 'express';
import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';
// import { env } from 'process';

export const collections: { webusage?: mongoDB.Collection } = {};

export async function connectToDatabase() {
    // Pulls in the .env file so it can be accessed from process.env. No path as .env is in root, the default location
    dotenv.config();

    // Create a new MongoDB client with the connection string from .env
    const client: mongoDB.MongoClient = new mongoDB.MongoClient('mongodb+srv://admin:test@cluster0.dopf4.mongodb.net');

    // Connect to the cluster
    await client.connect();

    // Connect to the database with the name specified in .env
    const db: mongoDB.Db = client.db('DePaul');
    
    // Apply schema validation to the collection
    //await applySchemaValidation(db);


    // Connect to the collection with the specific name from .env, found in the database previously specified
    const webusageCollection: mongoDB.Collection = db.collection('webusage');

    // Persist the connection to the webusage collection
    collections.webusage = webusageCollection;

    console.log(
        `Successfully connected to database: ${db.databaseName} and collection: ${webusageCollection.collectionName}`,
    );
}
