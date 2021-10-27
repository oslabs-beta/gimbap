import { Request, Response, NextFunction } from 'express';
import mcache from 'memory-cache';

export function cache(duration: number) {
  return function cachingMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = `__express__${req.method}__${req.originalUrl || req.url}`;
    const cachedResponse = mcache.get(key);
    if (cachedResponse) {
      return res.send(cachedResponse);
    } else {
      const originalSendFunc = res.send;
      res.send = (body: string): void => {
        mcache.put(key, body, duration);
        originalSendFunc.call(res, body);
      };
    }
    return next();
  };
}
