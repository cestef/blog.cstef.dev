import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import redis from "../lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}
	const headersList = req.headers;
	const session = await getServerSession(req, res, authOptions);
	const referer = headersList.referer;
	if (!session) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	if (!referer) {
		return res.status(400).json({ error: "Referer Header not set" });
	}
	try {
		const { comment } = req.body;
		const isAdmin = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === session.user.email;
		const isAuthor = session.user.id === comment.user.id;
		if (!isAdmin && !isAuthor) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		await redis.lrem(referer, 0, JSON.stringify(comment));
		return res.status(200).json({ success: true });
	} catch (error) {
		return res.status(500).json({ error: "Unexpected error occurred." });
	}
}
