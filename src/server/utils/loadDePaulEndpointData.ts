import fs, {promises as fsPromises} from 'fs';
import path from 'path';
import {connect, disconnect} from '../../shared/models/mongoSetup';
import { logAllEndpoints, Endpoint } from '../../shared/models/endpointModel';
import { MONGODB_URI } from '../secrets.json';

/**
 * Data from https://cds.cdm.depaul.edu/resources/datasets/ using Non-Preprocessed DePaul CTI Web Usage Data.
 * Download zip file, and extract cti-april02-log.txt to the root directory before running this function.
 *
 * @returns { | undefined} Returns undefined if cti-april02-log.txt file does not exist in root directory.
 *
 * @public
 */
export default async function loadDePaulEndpointData() {
    if (!fs.existsSync(path.resolve('cti-april02-log.txt'))) {
        console.error('cti-april02-log.txt not found in root directory. Please see documentation for loadDePaulEndpointData.');
        return;
    }
    const data = await fsPromises.readFile(path.resolve('cti-april02-log.txt'), 'utf8');

    const entries = data.split('\n').slice(4);

    //we now have an array of relevant data, but each entry is a string.  We should split now based on spaces.  We should use a for loop to iterate over each entry.
    const allEndpoints: Endpoint[] = [];
    for (const entry of entries) {
        const values: string[] = entry.split(' ');
        const timeStamp: number = new Date(values[0] + ' ' + values[1]).getTime();

        if (isNaN(timeStamp) || !values[8] || !values[9]) continue;

        allEndpoints.push({
        method: values[8],
        endpoint: values[9],
        callTime: timeStamp,
        });
    }

    const batchSize = 1000;
    for (let begin = 0; begin < allEndpoints.length; begin += batchSize) {
        const batch = allEndpoints.slice(begin, begin + batchSize);
        await logAllEndpoints(batch);
        console.log(`Percent completed: ${(((begin + batchSize) / allEndpoints.length) * 100).toFixed(2)}`);
    }
}
connect(MONGODB_URI).then(loadDePaulEndpointData).then(disconnect);