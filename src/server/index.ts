import path from 'path';
import express, { Request, Response, NextFunction, Express } from 'express';
import gimbap from 'gimbap';

import MiddlewareError from './utils/MiddlewareError';
import apiRouter from './routes/apiRouter';

// import { MONGODB_URI } from './secrets.json'; //NEED TO UNCOMMENT BEFORE COMMITTING
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST: string = process.env.HOST || 'localhost';

const app: Express = express();
// gimbap(app, 'mongodb', MONGODB_URI); // TODO remove before merge with main


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
app.use('*', (req: Request, res: Response) =>
  // Send the 404 status with the redirection to the 404.html file and the content type
  res.status(404)
  .setHeader('Content-Type', 'text/html')
  .sendFile(path.resolve('src/client', 'assets/404.html')) //? Do we need to add .html to the end of 404? or not?
);


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
