import {NextApiRequest, NextApiResponse} from "next";
import {verifySignature} from "@upstash/qstash/nextjs";
import Shaklee from "../../../lib/shaklee";
import {workerUpdateProducts} from "../../../lib/db";

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

  res.json({ok: true});
};

export default handler; //verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
