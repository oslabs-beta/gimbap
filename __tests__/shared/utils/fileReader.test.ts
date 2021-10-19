import { Endpoint, EndpointModel } from './../../../src/shared/models/endpointModel';
import { fileReader } from './../../../src/server/utilities/fileReader';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import express, { Application } from 'express';


describe('Check for DePaul CTI data entry', () => {
  
  beforeAll(async () => {
    await fileReader();
  });


  afterAll(async () => {
    //  await EndpointModel.deleteMany();
     await disconnect();
  });
  //,  
  test('Check for a specific data point', async () => {
    const firstObject = { method: 'get', endpoint: '/courses/syllabus.asp', callTime: 1017637220000 };
    await connect('mongodb+srv://admin:test@cluster0.dopf4.mongodb.net/DePaul');
    const check = await EndpointModel.exists(firstObject); 
    console.log(check);// fileReader[0];
    expect(check).toBe(true);
    //await (EndpointModel).exists(firstObject);
  });
});



// expected output: { method: 'post', endpoint: 'login', callTime: 2000293938420 }