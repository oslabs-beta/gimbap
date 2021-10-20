import fs from 'fs/promises';
import path from 'path';
import { connect, disconnect } from '../../../src/shared/models/mongoSetup';
import clusterRouter from './../../../src/server/routes/clusterRouter';
const mongoose = require('mongoose');


beforeEach((done) => {
  mongoose.connect("mongodb://localhost:27017/JestDB",
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});
