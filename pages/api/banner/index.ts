import {NextApiRequest, NextApiResponse} from "next";
import {connectToDB} from "../../../lib/db";
import {ratelimit, redis} from "../../../lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  req.statusCode = 200;

  const result = await ratelimit.limit("banner");
  res.setHeader("X-RateLimit-Limit", result.limit);
  res.setHeader("X-RateLimit-Remaining", result.remaining);

  if (req.method !== "GET") {
    return res.status(429);
  }
  try {
    const q = req.query;
    let temp: any = {};
    if (!q.status) {
      temp.status = {$exists: false};
    } else {
      temp.status = q.status;
    }

    const filter = Object.keys(temp).length ? temp : undefined;

    const filterString = `banner:${JSON.stringify(filter) || "root"}`;

    let cache;
    try {
      const c = await redis.get<any>(filterString);
      if (c) {
        cache = c;
      }
    } catch (error) {
      console.log(error);
      cache = null;
    }
    if (cache) {
      return res.json({ok: true, data: cache, count: cache.length});
    }

    const db = await connectToDB();
    const data = await db.collection("banners").find(filter).toArray();
    const count = data.length;

    await redis.set(filterString, JSON.stringify(data), {ex: 60 * 5});

    return res.json({ok: true, data, count});
  } catch (error) {
    return res.json({ok: false, error});
  }
}

/**
 *
 * @api {GET} /banner Get all banners
 * @apiName GetBanners
 * @apiGroup Banner
 * @apiVersion  1.0.0
 * @apiQuery {string="archived"} [status] Banners status (Leave blank for non-archived banners)
 * @apiSuccess (200) {Boolean}  ok    Ok
 * @apiSuccess (200) {Object[]} data  Banners data
 * @apiSuccess (200) {Number}   count Banners count
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "ok"    : true,
 *   "data"  : [
 *               {
 *                 "_id": "HeroBanner_20220518_Vita-C_Chewable",
 *                 "url": "https://www.shaklee.com.my/products/live-healthier/10621",
 *                 "images_url": [
 *                   "https://www.shaklee.com.my/front/uploads/Images/homepage/202206/HeroBanner_20220518_Vita-C_Chewable_FULL.jpg",
 *                   "https://www.shaklee.com.my/front/uploads/Images/homepage/202206/HeroBanner_20220518_Vita-C_Chewable_SMALL.jpg"
 *                 ],
 *                 "name": "HeroBanner_20220518_Vita-C_Chewable"
 *                 },
 *               ...
 *             ],
 *   "count" : 3
 * }
 */
