const fs = require('fs');
const path = require('path');

//We can probably import the schema model here... and then push up to the mongodb.
//

try {
    //we have all our data being read
    const data = fs.readFileSync(path.resolve('cti-april02-test.txt'), 'utf8').split('\n'); //todo put this file in the right place!!!
    //we slice based on the first actual web usage entry

    //const headers = data[3];
    const entries = data.slice(4);
    //we now have an array of relevant data, but each entry is a string.  We should split now based on spaces.  We should use a for loop to iterate over each entry.

    const correctData = entries.map(entry => {
        // split each string (entry) based on space

        const values = entry.split(' ');
        //console.log(values);
        return {
            // iterate through the result, and push necessary data into return object
            start_time: values[0] + ' ' + values[1],
            method: values[8],
            route: values[9],
            response: values[12]
        };
    });
    console.log(correctData);
  } catch (err) {
    console.error(err);
}