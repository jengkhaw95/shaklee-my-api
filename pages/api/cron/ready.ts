import { log } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import Shaklee from "../../../src/worker/shaklee";
import { verifySignature } from "@upstash/qstash/nextjs";

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
  const r = await fetch(
    process.env.QSTASH_URL! +
      "https://shaklee-my-api.vercel.app/api/cron/ready",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      },
    }
  );

  if (r.ok) {
    return res.json({ ok: true });
  }
  return res.status(500).json({});
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