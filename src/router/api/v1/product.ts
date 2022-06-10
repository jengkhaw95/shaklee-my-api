import express from "express";
import {connectToDB} from "../../../db";
const router = express.Router();

// All products
// Queries:
// - status: 'oos' | 'promotion'
// - search: string
router.get("/", async (req, res) => {
  try {
    const q = req.query;
    let temp: any = {};
    if (q.status) {
      temp.status = q.status;
    }
    if (q.search) {
      temp.tags = {$in: [q.search]};
    }

    const filter = Object.keys(temp).length ? temp : undefined;
    const db = await connectToDB();
    const data = await db.collection("products").find(filter).toArray();
    const count = data.length;
    res.json({ok: true, data, count});
  } catch (error) {
    res.json({ok: false, error});
  }
});

// Specific product id
router.get("/:productId", async (req, res) => {
  try {
    const {productId: product_no} = req.params;
    const db = await connectToDB();
    const data = await db.collection("products").findOne({product_no});
    if (!data) {
      return res.json({ok: false, error: "No data"});
    }
    res.json({ok: true, data});
  } catch (error) {
    res.json({ok: false, error});
  }
});

export default router;