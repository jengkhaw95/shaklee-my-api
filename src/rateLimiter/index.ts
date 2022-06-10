import express from "express";

interface RateLimitOption {
  durationMs: number;
  max: number;
}

export default function (options?: RateLimitOption | undefined) {
  const {durationMs, max} = options!;

  const ipCount = new Map<string, number>();
  const ipResetTime = new Map<string, number>();

  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const ip = req.ip;

    const count = ipCount.get(ip);
    const resetTime = ipResetTime.get(ip);
    const n = Date.now();

    res.setHeader("X-RateLimit-Limit", max);
    if (!count || n > resetTime!) {
      // First
      ipCount.set(ip, 1);
      ipResetTime.set(ip, n + durationMs);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      res.setHeader("X-RateLimit-Reset-Ms", n + durationMs);
      return next();
    }

    const nextCount = count + 1;

    if (nextCount > max && n < resetTime!) {
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset-Ms", resetTime!);
      return res.status(429).json({error: "Too many request"});
    }

    // Pass
    ipCount.set(ip, nextCount);
    res.setHeader("X-RateLimit-Remaining", max - nextCount);
    res.setHeader("X-RateLimit-Reset-Ms", resetTime!);
    return next();
  };
}
