import { Application, Request, Response } from 'express';

type DoneCallback = () => void;

interface InternalApplication extends Application {
  handle: (req: Request, res: Response, callback: DoneCallback) => void;
}

/**
 * Mutates express app object to inject route data logging.
 * 
 * @param {Application} app express application object. Usually created with `const app = express();`.
 */
export = function gimbap(app: Application) {
  const internalApp = app as InternalApplication;

  const originalHandle = internalApp.handle.bind(internalApp);

  internalApp.handle = function (req: Request, res: Response, callback: DoneCallback) {

    console.log('I\'m in the middle!'); // ! remove 

    return originalHandle(req, res, callback);
  };
}
