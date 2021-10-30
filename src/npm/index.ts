import { Application, Request, Response } from 'express';
import { logResponse } from '../shared/models/serverresponseModel';
import { connect, disconnect } from '../shared/models/mongoSetup';

let appRef: InternalApplication | null = null;
let originalHandleFunction: HandleFunction | null = null;

type DoneCallback = () => void;
type HandleFunction = (req: Request, res: Response, callback: DoneCallback) => void;
interface InternalApplication extends Application {
  handle: HandleFunction;
}

/**
 * Mutates express app object to inject route data logging.
 * 
 * @param {Application} app - express application object. Usually created with `const app = express();`.
 * @param {'mongodb' | 'postgresql'} database - choose between using `mongodb` or `postgresql` database to send data to.
 * @param {string} dbURI - URI to connect to database.
 * 
 * @return {Promise<void>} Promise<void> returns when connection to database has been established.
 * 
 * @public
 */
export default function gimbap(
  app: Application,
  database: 'mongodb' | 'postgresql',
  dbURI: string
): Promise<void> {
  // TODO implement PostgreSQL support.
  if (database === 'postgresql') throw new Error('PostgreSQL is not currently supported.');

  appRef = app as InternalApplication;
  originalHandleFunction = appRef.handle;

  appRef.handle = function handleGimbapMiddleware(req: Request, res: Response, callback: DoneCallback): void {
    logResponse(req.method, req.originalUrl || req.url, Date.now());

    return (originalHandleFunction as HandleFunction).call(appRef, req, res, callback);
  };

  return connect(dbURI);
}

/**
 * Close connection with database and stop logging endpoints.
 * 
 * @public
 */
gimbap.stop = async (): Promise<void> => {
  if (appRef && originalHandleFunction) {
    appRef.handle = originalHandleFunction;
    return disconnect();
  }
};
