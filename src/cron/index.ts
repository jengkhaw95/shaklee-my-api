import cron from "node-cron";

export const cronJobOnEvery55thMinute = (cb: () => void) =>
  cron.schedule("55 */3 * * *", cb, {
    scheduled: false,
    timezone: "Asia/Singapore",
  });
