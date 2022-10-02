import {cronJobOnEvery55thMinute} from ".";
import {workerUpdateBanner, workerUpdateProducts} from "../worker";

export const updateProductsAndBanners = cronJobOnEvery55thMinute(() => {
  console.log("Update cron started...");
  try {
    workerUpdateBanner();
    workerUpdateProducts();
  } catch (error) {
    console.log("Update cron error!");
    console.log(error);
  }
  console.log("Update cron completed!");
});
