import fs from 'fs/promises';
import path from 'path';

import loadDePaulEndpointData from './../../../src/server/utils/loadDePaulEndpointData';
import { EndpointModel, Endpoint } from './../../../src/shared/models/endpointModel';
import { startWatchingEndpointModel, EndpointBucketsModel, forceAllPendingUpdates } from './../../../src/server/models/endpointBucketsModel';
import { startWatchingClusterModel, forceUpdate } from '../../../src/server/models/clusterModel';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import { delay } from './../../testUtils';

import { MONGODB_URI } from './../../../src/server/secrets.json';

xdescribe('Populate database with DePaul CTI data and verify data is in DB', () => {
  jest.setTimeout(60 * 60 * 1000);

  beforeAll(async () => {
    await connect(MONGODB_URI);
    await EndpointModel.deleteMany({});
    await EndpointBucketsModel.deleteMany({});
    startWatchingEndpointModel();
    startWatchingClusterModel();
  });

  afterAll(async () => {
    await delay(60 * 1000); // wait a minute for update calls to finish, increase if you got errors at the end
    await forceAllPendingUpdates();
    await forceUpdate();
    await disconnect();
  });

  test('Check for a specific data point', async () => {
    const batchSize = 5000;

    await loadDePaulEndpointData(batchSize);

    const data = await fs.readFile(path.resolve('cti-april02-log.txt'), 'utf8');
    const entries: string[] = data.split('\n').slice(4);

    for (let i = 0; i < entries.length; i += batchSize) {
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
