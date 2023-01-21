import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    req.statusCode = 200

    // GET META DATA FROM WEBSITE

    // 
    res.json({ ok: true })

}

export default handler;