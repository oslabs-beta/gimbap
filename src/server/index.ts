const path = require('path');
const express = require('express');

const apiRouter = require('./routes/apiRouter');


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const app = express();


/* MIDDLEWARE */
app.use(express.json());


/* STATIC SERVER */
if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.resolve(__dirname, './../client')));
}

app.get('/', (req, res) => res.send('Hello World'));


/* ROUTES */
app.use('/api', apiRouter);


/* GLOBAL 404 */
// TODO build and serve global 404 page


/* GLOBAL ERROR HANDLER */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req, res, next) => {
  console.error(err);

  const defaultClientError = {
    status: 500,
    message: { error: 'Unknown server error. Please check server log.' },
  };
  const clientError = Object.assign(defaultClientError, err);
  res.status(clientError.status).send(JSON.stringify(clientError.message));
});


/* INIT SERVER */
app.listen(PORT, HOST, () => console.log(`Server listening on http://${HOST}:${PORT}`));


module.exports = app;
