import {cronJobOnEvery3HoursAt55thMinute, cronJobOnEvery55thMinute} from ".";
import {workerUpdateBanner, workerUpdateProducts} from "../worker";

export const updateProductsAndBanners = () => {
  console.log("Update cron started...");
  try {
    workerUpdateBanner();
    workerUpdateProducts();
  } catch (error) {
    console.log("Update cron error!");
    console.log(error);
  }
  console.log("Update cron completed!");
};

export const cronUpdateProductsAndBanners = cronJobOnEvery3HoursAt55thMinute(
  updateProductsAndBanners
);
