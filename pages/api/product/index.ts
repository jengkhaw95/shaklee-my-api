import {NextApiRequest, NextApiResponse} from "next";
import {connectToDB} from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  req.statusCode = 200;

  if (req.method !== "GET") {
    return res.status(429);
  }

  try {
    const q = req.query;
    let temp: any = {};
    if (q.status && typeof q.status === "string") {
      if (q.status.split(",").length > 1) {
        temp.status = {$in: q.status.split(",").map((s) => s.trim())};
      } else {
        temp.status = q.status;
      }
    }
    if (q.search && typeof q.search === "string") {
      if (q.search.split(",").length > 1) {
        temp.$text = {
          $search: q.search
            .split(",")
            .map((s) => s.trim())
            .join(" "),
        };
      } else {
        temp.$text = {$search: q.search};
      }
    }

    const filter = Object.keys(temp).length ? temp : undefined;
    const db = await connectToDB();
    const data = await db.collection("products").find(filter).toArray();
    const count = data.length;
    res.json({ok: true, data, count});
  } catch (error) {
    res.json({ok: false, error});
  }
}

/**
 *
 * @api {GET} /product Get all products
 * @apiName GetProducts
 * @apiGroup Product
 * @apiVersion  1.0.0
 * @apiQuery {string="available","oos","promotion","archived"} [status] Products status (Can use multiple split with ',' E.g. status=oos,promotion)
 * @apiQuery {string} [search]  Products tags/category search (Can use multiple split with ',' E.g. search=esp,sachet)
 * @apiSuccess (200) {Boolean}  ok    Ok
 * @apiSuccess (200) {Object[]} data  Products data
 * @apiSuccess (200) {Number}   count Products count
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "ok"    : true,
 *   "data"  : [
 *               {
 *                 "_id": "00P609",
 *                 "product_no": "00P609",
 *                 "name": "BB Cream Duo Set (2+3)",
 *                 "status": "oos",
 *                 "tags": [
 *                   "BUY ANY BB CREAM DUO SET",
 *                   "GET FREE  Shaklee YOUTH Hexagon Blend Brush",
 *                   "00P609",
 *                   "GWP"
 *                 ],
 *                 "images": [
 *                   "https://www.shaklee.com.my/front/images/products/00P609_master_normal.jpg",
 *                   "https://www.shaklee.com.my/front/images/products/00P609_master_zoom.jpg",
 *                   "https://www.shaklee.com.my/front/images/products/00P609_master_thumbnail.jpg",
 *                   "https://www.shaklee.com.my/front/images/products/00P609_master_prod_list.jpg"
 *                 ],
 *                 "pcat": "promotion",
 *                 "dn": {
 *                   "uv": 70,
 *                   "pv": 248,
 *                   "price": 276,
 *                   "start_date": "2021-12-28",
 *                   "end_date": "2027-01-31"
 *                 },
 *                 "srp": {
 *                   "uv": 70,
 *                   "pv": 248,
 *                   "price": 345,
 *                   "start_date": "2021-12-28",
 *                   "end_date": "2027-01-31"
 *                 }
 *               },
 *               ...
 *             ],
 *   "count" : 3
 * }
 */
