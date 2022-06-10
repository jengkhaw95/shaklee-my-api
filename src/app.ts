import "dotenv/config";
import express, {Application} from "express";
//import cache from "./middleware/cache";
import api from "./router/api";

const app: Application = express();

const port = process.env.PORT || 3001;

app.set("trust proxy", 3);

api(app);

app.get("/ip", (req, res) => {
  res.send(req.ip);
});

//app.use("/product", rateLimit, product);

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
