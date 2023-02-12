import {workerUpdateProducts} from ".";

(async () => {
  await Promise.resolve(workerUpdateProducts());
  process.exit();
})();
