import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const session = await getServerSession(req, res, authOptions);

	if (!session || !session.user) {
		return res.status(200).json({ admin: false });
	}

	const { email } = session.user;

	if (email !== process.env.ADMIN_EMAIL) {
		return res.status(200).json({ admin: false });
	}

	return res.status(200).json({ admin: true });
}
