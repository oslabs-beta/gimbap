import {promises} from 'fs';
import path from 'path';
import { logEndpoint } from '../../shared/models/endpointModel';
import {WebUsageEntry} from '../models/interface';
import { connect, disconnect } from '../../shared/models/mongoSetup';
//import {connectToDatabase, collections} from '../services/database.service';

export const fileReader = () =>{
    return connect('mongodb+srv://admin:test@cluster0.dopf4.mongodb.net/DePaul')
    .then( async ()=>{
        try {
            //we have all our data being read
            const data = await promises.readFile(path.resolve('cti-april02-log.txt'), 'utf8')
            .then(content=> content.split('\n')); //todo put this file in the right place!!!
            //we slice based on the first actual web usage entry
        
            //const headers = data[3];
            const entries = data.slice(4);
            console.log(entries);
            //we now have an array of relevant data, but each entry is a string.  We should split now based on spaces.  We should use a for loop to iterate over each entry.
            //const result =  await collections.webusage.insertOne({
            // await entries.reduce(async (promise, entry) => {
            //     await promise;
            //     const values = entry.split(' ');
            //     //const newWebUsage: WebUsageEntry = {startTime: values[0] + ' ' + values[1], method: values[8], route: values[9], response: values[12]} as WebUsageEntry;
            //     const timeStamp = new Date(values[0] + ' ' + values[1]).getTime();
            //     //console.log(timeStamp);
            //     await logEndpoint(values[8], values[9], timeStamp);
            //     // try{
            //     //     const newWebUsage: WebUsageEntry = {startTime: values[0] + ' ' + values[1], method: values[8], route: values[9], response: values[12]} as WebUsageEntry;
            //     //     const result = await collections.webusage?.insertOne(newWebUsage);
            //     //     result
            //     //         ? console.log(`Successfully created a new game with id ${result.insertedId}`)
            //     //         : console.log('Failed to create a new game.');
            //     // }
            //     // catch(error){
            //     //     console.error(error);
            //     // }
            // }, Promise.resolve());
            // entries.forEach(entry => {
            //     // split each string (entry) based on space
            //     const values = entry.split(' ');
            //     //console.log(values);
                
            //         // iterate through the result, and push necessary data into return object
            //         start_time: values[0] + ' ' + values[1],
            //         method: values[8],
            //         route: values[9],
            //         response: values[12]
            //     });
            // });
            // console.log(correctData);
            //console.log(entries);
        } 
        catch (err) {
            console.error(err);
        }
    })
    .catch((error: Error)=>{
        console.error('Database connection failed', error);
        process.exit();
    })
    .then(()=>{
        return disconnect();
    });
};
//We can probably import the schema model here... and then push up to the mongodb.
//

