import {NextApiRequest, NextApiResponse} from "next";
import {verifySignature} from "@upstash/qstash/nextjs";
import Shaklee from "../../../lib/shaklee";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  req.statusCode = 200;

  const s = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  console.time("get meta");
  const data = await s.init();
  console.timeEnd("get meta");

  //   fetch
  //https://qstash.upstash.io/v1/publish/
  const url = `${process.env.QSTASH_URL!}https://${
    process.env.VERCEL_URL
  }/api/cron/update-product`;

  const headers = {
    Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify(data);

  //console.log({url, headers, body});
  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const d = await r.json();
  console.log({d});
  return res.json({ok: true, data});
  //   return res.status(500).json({});
  //

  //   console.time("get product");
  //   const d = await h.getProducts(data.cookie, data.token);
  //   console.timeEnd("get product");

  //   return res.json({ d });
};

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
