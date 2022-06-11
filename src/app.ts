import "dotenv/config";
import express, {Application} from "express";
import api from "./router/api";

const app: Application = express();

const port = process.env.PORT || 3001;

// 3 is the number of proxy layer on Heroku
app.set("trust proxy", 3);

api(app);

// Used to check ip

//app.get("/ip", (req, res) => {
//  res.send(req.ip);
//});

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
