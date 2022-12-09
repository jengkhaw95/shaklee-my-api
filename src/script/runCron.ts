// This script is used to run cron

import {updateProductsAndBanners} from "../cron/updateProductsAndBanners";

(async () => {
  await updateProductsAndBanners();
})();
