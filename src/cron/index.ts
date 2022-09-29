import cron from "node-cron";

export const cronJobOnEvery55thMinute = (cb: () => void) =>
  cron.schedule("55 * * * *", cb, {
    scheduled: false,
    timezone: "Asia/Singapore",
  });
