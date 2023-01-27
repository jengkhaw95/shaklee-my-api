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
    const {productId: product_no} = req.query;
    const db = await connectToDB();
    const data = await db.collection("products").findOne({product_no});
    if (!data) {
      return res.json({ok: false, error: "No data"});
    }
    res.json({ok: true, data});
  } catch (error) {
    res.json({ok: false, error});
  }
}

/**
 *
 * @api {GET} /product/:productId Get product by Id
 * @apiName GetProductById
 * @apiGroup Product
 * @apiVersion  1.0.0
 * @apiParam  {String} productId Product no./Id
 * @apiSuccess (200) {Boolean}  ok    Ok
 * @apiSuccess (200) {Object}   data  Product data
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "ok"    : true,
 *   "data"  : {
 *               "_id": "00P609",
 *               "product_no": "00P609",
 *               "name": "BB Cream Duo Set (2+3)",
 *               "status": "oos",
 *               "tags": [
 *                 "BUY ANY BB CREAM DUO SET",
 *                 "GET FREE  Shaklee YOUTH Hexagon Blend Brush",
 *                 "00P609",
 *                 "GWP"
 *               ],
 *               "images": [
 *                 "https://www.shaklee.com.my/front/images/products/00P609_master_normal.jpg",
 *                 "https://www.shaklee.com.my/front/images/products/00P609_master_zoom.jpg",
 *                 "https://www.shaklee.com.my/front/images/products/00P609_master_thumbnail.jpg",
 *                 "https://www.shaklee.com.my/front/images/products/00P609_master_prod_list.jpg"
 *               ],
 *               "pcat": "promotion",
 *               "dn": {
 *                 "uv": 70,
 *                 "pv": 248,
 *                 "price": 276,
 *                 "start_date": "2021-12-28",
 *                 "end_date": "2027-01-31"
 *               },
 *               "srp": {
 *                 "uv": 70,
 *                 "pv": 248,
 *                 "price": 345,
 *                 "start_date": "2021-12-28",
 *                 "end_date": "2027-01-31"
 *               }
 *             }
 * }
 */
