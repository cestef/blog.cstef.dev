import { signIn } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";

export default function Login() {
	const router = useRouter();
	const search = useSearchParams();
	const callbackUrl = search.get("callbackUrl") ?? "/";
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<div className="w-full h-[100svh] flex flex-col items-center justify-center">
				<button
					className="absolute top-4 left-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out fill-current text-gray-800 dark:text-gray-100"
					onClick={() => router.back()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="w-6 h-6 inline-block"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M10.293 12l4.147-4.146a.5.5 0 0 0-.708-.708l-4.5 4.5a.5.5 0 0 0 0 .708l4.5 4.5a.5.5 0 0 0 .708-.708L10.293 12z"
						/>
					</svg>
				</button>

				<div className="flex flex-col items-center justify-center p-12 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/20">
					<div className="flex flex-col items-center justify-center space-y-6">
						<h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100">
							Login to cstef's Blog
						</h1>
						<p className="text-center text-gray-500 dark:text-gray-400 text-lg">
							Login with your GitHub account to comment on posts.
						</p>
					</div>
					<div className="flex flex-col items-center justify-center space-y-4 mt-8 w-full">
						<button
							onClick={() => signIn("github", { callbackUrl })}
							className="w-full rounded-lg px-6 py-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out fill-current text-gray-800 dark:text-gray-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 97.75 97.75"
								className="w-6 h-6 inline-block mr-2"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
								/>
							</svg>
							Login with GitHub
						</button>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
