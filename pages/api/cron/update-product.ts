import { NextApiRequest, NextApiResponse } from 'next';
import { workerUpdateProducts } from "../../../src/worker"
import { verifySignature } from "@upstash/qstash/nextjs"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    req.statusCode = 200

    res.json({ ok: true })
}

export default verifySignature(handler);

export const config = {
    api: {
        bodyParser: false,
    },
};