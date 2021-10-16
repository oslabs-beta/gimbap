const express = require('express');
const request = require('supertest');
const gimbap = require('../../build/npm');

/**
 * Note: please run command `npm run build-npm` before running tests.
 * Test run on build javascript package.
 */

describe('test', () => {
  const app = express();
  gimbap(app);

  app.get('/', function (req, res) {
    res.status(200).json({ name: 'john' });
  });

  test('basic', (done) => {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
