import { randomUUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import redis from "../lib/redis";

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}
	const session = await getServerSession(req, res, authOptions);
	if (!session) {
		return res.status(401).json({ error: "Unauthorized" });
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
		console.log(session.user);
		const { name, image, id } = session.user;
		const user = { name, image, id };
		const { text } = req.body;
		const comment = {
			id: randomUUID(),
			created_at: Date.now(),
			referer,
			text,
			user,
		};
		await redis.lpush(referer, JSON.stringify(comment));
		return res.status(200).json(comment);
	} catch (error) {
		return res.status(500).json({ error: "Unexpected Error" });
	}
}
