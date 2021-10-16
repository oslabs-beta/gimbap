import { ObjectId } from 'mongodb';

interface WebUsageEntry {
  startTime: string;// Date + ' ' + time
  method: string;
  route: string;
  response: string;
  id: ObjectId
}

// create a function that adds a single object to the database

// const result = await Student.create(info);

// create a function that deletes all objects from the database


// export all the functions
export { WebUsageEntry };