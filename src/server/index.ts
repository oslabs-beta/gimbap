import path from 'path';
import express, { Request, Response, NextFunction, Express } from 'express';

import MiddlewareError from './utils/MiddlewareError';
import apiRouter from './routes/apiRouter';


const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST: string = process.env.HOST || 'localhost';
const MONGODB_URI = 'mongodb+srv://nodeuser:nodeuser@dev-cluster.pqpcc.mongodb.net/express-compute?retryWrites=true&w=majority';

const app: Express = express();


/* MIDDLEWARE */
app.use(express.json());


/* STATIC SERVER */
if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.resolve(__dirname, './../client')));
}


/* ROUTES */
app.use('/api', apiRouter);


/* GLOBAL 404 */
// TODO build and serve global 404 page


/* GLOBAL ERROR HANDLER */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: MiddlewareError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  const defaultClientError = new MiddlewareError('Unknown server error. Please check server log.', 500);
  const clientError = Object.assign(defaultClientError, err);
  res.status(clientError.status).send(JSON.stringify({ error: clientError.error }));
});


/* INIT SERVER */
app.listen(PORT, HOST, () => console.log(`Server listening on http://${HOST}:${PORT}`));


export default app;
