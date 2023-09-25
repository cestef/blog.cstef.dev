import nextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
	throw new Error("The GITHUB_ID and GITHUB_SECRET env variables must be set.");
}

export const authOptions: NextAuthOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			profile(profile) {
				return {
					id: profile.id,
					login: profile.login,
					name: profile.name,
					image: profile.avatar_url,
					email: profile.email,
				};
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user)
				token.user = {
					email: user.email,
					name: user.name,
					id: user.id,
					image: user.image,
					login: user.login,
				};
			return Promise.resolve(token);
		},
		session: async ({ session, token, user }) => {
			session.user = token.user;
			return Promise.resolve(session);
		},
	},
	pages: {
		signIn: "/login",
	},
};

const authHandler = nextAuth(authOptions);
export default async function handler(...params: any[]) {
	await authHandler(...params);
}
