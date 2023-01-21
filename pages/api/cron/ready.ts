import { log } from 'console';
import { NextApiRequest, NextApiResponse } from 'next';
import Shaklee from '../../../src/worker/shaklee';

export default async (req: NextApiRequest, res: NextApiResponse) => {

    req.statusCode = 200

    const s = new Shaklee({ username: process.env.SHAKLEE_ID!, password: process.env.SHAKLEE_PW! });

    const data = await s.init();

    log({ data });

    return res.json({ data });

}