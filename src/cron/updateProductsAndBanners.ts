import { cronJobOnEvery55thMinute } from ".";
import { workerUpdateBanner, workerUpdateProducts } from "../worker";

export const updateProductsAndBanners = cronJobOnEvery55thMinute(() => {
  workerUpdateBanner();
  workerUpdateProducts();
});
