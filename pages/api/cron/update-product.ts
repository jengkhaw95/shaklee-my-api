import { NextApiRequest, NextApiResponse } from "next";
import { workerUpdateProducts } from "../../../src/worker";
import { verifySignature } from "@upstash/qstash/nextjs";
import Shaklee from "../../../src/worker/shaklee";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  req.statusCode = 200;

  const s = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  console.log(req.body);
  console.time("get products");
  const data = await s.getProducts(req.body.cookie, req.body.token);
  console.timeEnd("get products");

  res.json({ ok: true, body: req.body, data });
};

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
