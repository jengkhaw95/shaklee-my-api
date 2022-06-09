import "dotenv/config";
import express, {Application, Request, Response} from "express";
import product from "./router/product";

const app: Application = express();

const port = process.env.PORT || 3001;

app.use("/product", product);

app.get("/toto", (req: Request, res: Response) => {
  res.send("Hello toto");
});

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
