import bodyParser from "body-parser";
import "dotenv/config";
import express, {Application} from "express";
import path from "path";
import {updateProductsAndBanners as cronUpdateProductsAndBanners} from "./cron/updateProductsAndBanners";
import api from "./router/api";
import telegram from "./router/telegram";

const app: Application = express();

const host = process.env.host || "0.0.0.0";
const port = process.env.$PORT || 5000;
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "../docs/output")));

// 3 is the number of proxy layer on Heroku
// app.set("trust proxy", 3);

telegram(app);
api(app);

// Used to check ip
//app.get("/ip", (req, res) => {
//  res.send(req.ip);
//});

app.listen(port as number, host, function () {
  console.log(`App is listening on ${host}:${port}!`);
});

// Set up cron scheduler
cronUpdateProductsAndBanners.start();
