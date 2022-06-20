import "dotenv/config";
import express, {Application} from "express";
import path from "path";
import api from "./router/api";
import telegram from "./router/telegram";

const app: Application = express();

const port = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, "../docs/output")));

// 3 is the number of proxy layer on Heroku
app.set("trust proxy", 3);

telegram(app);
api(app);

// Used to check ip
//app.get("/ip", (req, res) => {
//  res.send(req.ip);
//});

app.listen(port, function () {
  console.log(`App is listening on port ${port}!`);
});
