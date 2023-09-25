import NextAuth from "next-auth";
interface MyUser {
	name: string;
	login: string;
	image: string;
	email: string;
	id: string;
}
declare module "next-auth" {
	interface Session {
		user: User;
	}
	interface User extends MyUser {}
}
declare module "next-auth/jwt" {
	interface JWT {
		user: MyUser;
	}
}
