import "dotenv/config";
import express, {Application} from "express";
import rateLimiter from "./rateLimiter";
import product from "./router/product";

const app: Application = express();

const port = process.env.PORT || 3001;

const rateLimit = rateLimiter({max: 3, durationMs: 10 * 1000});

app.set("trust proxy", 3);

app.get("/ip", rateLimit, (req, res) => {
  res.send(req.ip);
});

app.use("/product", rateLimit, product);

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
