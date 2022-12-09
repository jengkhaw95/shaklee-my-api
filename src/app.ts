import "dotenv/config";
import bodyParser from "body-parser";
import express, {Application} from "express";
import path from "path";
import {
  cronUpdateProductsAndBanners,
  updateProductsAndBanners,
} from "./cron/updateProductsAndBanners";
import api from "./router/api";
import telegram from "./router/telegram";

try {
  const app: Application = express();

  const port = process.env.PORT || 5000;
  app.use(bodyParser.json());
  app.use(express.static(path.resolve(__dirname, "../docs/output")));

  // 3 is the number of proxy layer on Heroku
  // app.set("trust proxy", 3);
  app.use((req, _, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
  telegram(app);
  api(app);

  // Used to check ip
  //app.get("/ip", (req, res) => {
  //  res.send(req.ip);
  //});

  app.listen(port as number, function () {
    console.log(`App is listening on port: ${port}!`);
  });

  // Run right after app is deployed once
  if (process.env.NODE_ENV !== "development") {
    updateProductsAndBanners();
  }

  // Set up cron scheduler
  cronUpdateProductsAndBanners.start();
} catch (error) {
  console.log("Runtime error");
  console.log(error);
}
