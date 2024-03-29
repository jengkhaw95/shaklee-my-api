import {NextApiRequest, NextApiResponse} from "next";
import {workerUpdateProducts} from "../../../lib/db";
import Shaklee from "../../../lib/shaklee";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  req.statusCode = 200;

  const s = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  console.time("get products");
  const data = await s.getProducts(req.body.cookie, req.body.token);
  console.timeEnd("get products");

  console.time("update products");
  await workerUpdateProducts(data);
  console.timeEnd("update products");

  return res.json({ok: true});
};

export default handler;
