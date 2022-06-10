import * as express from "express";
import cache from "../cache";

interface ExtendedRes extends express.Response {
  copySend(body?: any): this;
  send(body?: any): any;
}

export default (cacheDurationInMs: number) => {
  const c = cache(cacheDurationInMs);
  return (
    req: express.Request,
    res: ExtendedRes,
    next: express.NextFunction
  ) => {
    //console.log(req.originalUrl);   // - /api/v1/product
    //console.log(req.url);           // - /product
    const key = "_express_" + (req.url || req.originalUrl);
    const cData = c.get(key);
    if (cData) {
      return res.send(cData);
    }
    res.copySend = res.send as any;

    res.send = (body: any) => {
      c.set(key, body);
      res.copySend(body);
    };

    next();
  };
};
