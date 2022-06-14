import express from "express";
import product from "./product";
import banner from "./banner";
const router = express.Router();

router.use("/product", product);
router.use("/banner", banner);

export default router;
