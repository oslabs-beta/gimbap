import path from 'path';
import express, { Request, Response, NextFunction, Express } from 'express';
import { connect } from './../shared/models/mongoSetup';
// import gimbap from 'gimbap';

import { MONGODB_URI } from './secrets.json';

import MiddlewareError from './utils/MiddlewareError';
import apiRouter from './routes/apiRouter';

//import { MONGODB_URI } from './secrets.json';
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST: string = process.env.HOST || 'localhost';

const app: Express = express();
//gimbap(app, 'mongodb', MONGODB_URI); // TODO remove before merge with main
// TODO figure out why this causes Endpoint to be overwritten and conflict


/* MIDDLEWARE */
app.use(express.json());


/* STATIC SERVER */
if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.resolve(__dirname, './../client')));
}

// app.get('/', (req, res) => {
//   res.send('Hello world!!');
// });


/* ROUTES */
app.use('/api', apiRouter);


/* GLOBAL 404 */
if (process.env.NODE_ENV !== 'test') {
  app.use('*', (req: Request, res: Response) => res.status(404).sendFile(path.resolve(__dirname, './../client/404.html')));
}
// TODO improve 404 layout


/* GLOBAL ERROR HANDLER */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: MiddlewareError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  console.error(err);

  const defaultClientError = new MiddlewareError('Unknown server error. Please check server log.', 500);
  const clientError = Object.assign(defaultClientError, err);
  res.status(clientError.status).send(JSON.stringify({ error: clientError.error }));
});


/* INIT SERVER */
if (process.env.NODE_ENV !== 'test') {
  connect(MONGODB_URI).then(() =>
    app.listen(PORT, HOST, () => console.log(`Server listening on http://${HOST}:${PORT}`))
  );
}

export default app;
