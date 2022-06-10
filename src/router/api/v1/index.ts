import express from "express";
import product from "./product";
const router = express.Router();

router.use("/product", product);

export default router;
