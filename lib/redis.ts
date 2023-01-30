import {Redis} from "@upstash/redis";
import {Ratelimit} from "@upstash/ratelimit";

export const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
  //@ts-ignore
  redis: redis,
  limiter: Ratelimit.fixedWindow(12, "60 s"),
});
