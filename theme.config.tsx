import { NextraBlogTheme } from "nextra-theme-blog";
import { signIn, useSession } from "next-auth/react";
import useComment, { fetcher } from "./lib/useComment";
import useSWR from "swr";
import Moment from "react-moment";

const Comments = () => {
	const { data: session } = useSession();
	const { data: { admin: isAdmin } = {} } = useSWR("/api/admin", fetcher);
	const { text, setText, comments, onDelete, onSubmit } = useComment();
	return (
		<>
			<div className="mt-8 h-px bg-gray-200 dark:bg-gray-800" />
			<h3 className="mt-8">Comments</h3>
			{session ? (
				<div className="flex flex-col space-y-4">
					<form onSubmit={onSubmit} className="flex flex-col space-y-4">
						<div className="flex justify-between">
							<input
								type="text"
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder={`Leave a comment as ${session.user.name}`}
								className="w-full rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out outline-none"
							/>
							<button
								type="submit"
								className="ml-2 rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out"
							>
								Submit
							</button>
						</div>
					</form>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center">
					<p>You must be logged in to comment.</p>
					<button
						onClick={() => signIn()}
						className="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out"
					>
						Login
					</button>
				</div>
			)}
			<div className="flex flex-col space-y-4 mt-8">
				{comments.map((comment) => (
					<div
						key={comment.id}
						className="flex flex-col space-y-2 group px-4 py-2 bg-gray-200/20 dark:bg-gray-800/20 rounded-lg relative"
					>
						<div className="flex justify-between m-2">
							<div className="flex items-center space-x-2">
								<img
									src={comment.user.image}
									alt={comment.user.name}
									className="w-8 h-8 rounded-full m-0"
								/>
								<p className="font-bold my-2">{comment.user.name}</p>
							</div>
							{(session?.user?.id === comment.user.id || isAdmin) && (
								<button
									onClick={() => onDelete(comment)}
									className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out text-sm text-red-500"
								>
									Delete
								</button>
							)}
						</div>
						<p className="pb-4 px-4 mt-0">{comment.text}</p>
						<Moment
							className="text-sm text-gray-500 dark:text-gray-400 text-end absolute bottom-4 right-4"
							fromNow
						>
							{comment.created_at}
						</Moment>
					</div>
				))}
				{comments.length === 0 && (
					<p className="text-center text-gray-500 dark:text-gray-400 mt-0">
						No comments yet. Be the first to comment!
					</p>
				)}
			</div>
		</>
	);
};

const config: NextraBlogTheme = {
	footer: (
		<p className="mt-12 text-center text-gray-500 dark:text-gray-400">
			© {new Date().getFullYear()} - Built with <a href="https://nextra.site/">Nextra</a> ·{" "}
			<a href="https://github.com/cestef">GitHub</a>
		</p>
	),
	head: ({ title, meta }) => (
		<>
			{meta.description && <meta name="description" content={meta.description} />}
			{meta.tag && <meta name="keywords" content={meta.tag} />}
			{meta.author && <meta name="author" content={meta.author} />}
			{meta.image && <meta name="image" content={meta.image} />}
			{meta.url && <meta name="url" content={meta.url} />}
			{meta.title && <meta name="title" content={meta.title} />}
			{/* <link rel='icon' href='/favicon.ico' /> */}
		</>
	),
	dateFormatter: (date) => `${date.toDateString()}`,
	readMore: "Read →",
	darkMode: true,
	comments: <Comments />,
};

export default config;
