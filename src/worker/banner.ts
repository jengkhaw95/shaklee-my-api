import {workerUpdateBanner} from ".";

(async () => {
  await Promise.resolve(workerUpdateBanner());
  process.exit();
})();
