import express from "express";
import cors from "cors";
import cache from "../../middleware/cache";
import rateLimiter from "../../rateLimiter";
import v1 from "./v1";

const rateLimit = rateLimiter({ max: 120, durationMs: 60 * 1000 });

const c = cache(5 * 60 * 1000);

const api = (app: express.Application) => {
  app.use("/api/v1", cors(), rateLimit, c as any, v1);
};

export default api;
