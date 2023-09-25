import { NextApiRequest, NextApiResponse } from "next";
import redis from "../lib/redis";

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}
	if (!redis) {
		return res.status(500).json({ error: "Redis connection failed" });
	}
	const headersList = req.headers;
	const referer = headersList.referer;
	if (!referer) {
		return res.status(400).json({ error: "Referer Header not set" });
	}
	try {
		console.log(referer);
		const rawComments = await redis.lrange(referer, 0, -1);
		const comments = rawComments.map((c) => {
			const comment = JSON.parse(JSON.stringify(c));
			delete comment.user.email;
			return comment;
		});
		return res.status(200).json(comments);
	} catch (error) {
		return res.status(500).json({ message: error });
	}
}
