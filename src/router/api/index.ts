import express from "express";
import rateLimiter from "../../rateLimiter";
import v1 from "./v1";

const rateLimit = rateLimiter({max: 3, durationMs: 10 * 1000});

const api = (app: express.Application) => {
  app.use("/api/v1", rateLimit, v1);
};

export default api;
