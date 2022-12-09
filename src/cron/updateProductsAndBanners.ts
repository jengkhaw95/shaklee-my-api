import {cronJobOnEvery3HoursAt55thMinute, cronJobOnEvery55thMinute} from ".";
import {workerUpdateBanner, workerUpdateProducts} from "../worker";

export const updateProductsAndBanners = async () => {
  console.log("Update cron started...");
  console.time("Cron");
  try {
    console.time("Update banner");
    await workerUpdateBanner();
    console.timeEnd("Update banner");

    console.time("Update product");
    await workerUpdateProducts();
    console.timeEnd("Update product");
  } catch (error) {
    console.log("Error running cron");
    console.log(error);
  }
  console.timeEnd("Cron");

  process.exit();
};

export const cronUpdateProductsAndBanners = cronJobOnEvery3HoursAt55thMinute(
  updateProductsAndBanners
);
