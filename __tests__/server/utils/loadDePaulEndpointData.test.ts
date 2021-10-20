import fs from 'fs/promises';
import path from 'path';

import loadDePaulEndpointData from './../../../src/server/utilities/loadDePaulEndpointData';
import { EndpointModel, Endpoint } from './../../../src/shared/models/endpointModel';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';

describe('Populate database with DePaul CTI data and verify data is in DB', () => {
  jest.setTimeout(15 * 60 * 1000);

  beforeAll(async () => {
    await connect('mongodb+srv://admin:test@cluster0.dopf4.mongodb.net/DePaul?retryWrites=true&w=majority');
    await EndpointModel.deleteMany();
  });

  afterAll(async () => {
    await EndpointModel.deleteMany();
    await disconnect();
  });

  test('Check for a specific data point', async () => {
    await loadDePaulEndpointData();

    const data = await fs.readFile(path.resolve('cti-april02-log.txt'), 'utf8');
    const entries: string[] = data.split('\n').slice(4);

    for (let i = 0; i < entries.length; i += 1000) {
      const entry: string[] = data.split('\n').slice(4);
      const timeStamp: number = new Date(entry[0] + ' ' + entry[1]).getTime();
      const expected: Endpoint = {
        method: entry[8],
        endpoint: entry[9],
        callTime: timeStamp,
      };

      if (isNaN(timeStamp) || !entry[8] || !entry[9]) continue;

      const check: boolean = await EndpointModel.exists(expected); 
      expect(check).toBe(true); // expected endpoint to be in DB
    }
  });
});
