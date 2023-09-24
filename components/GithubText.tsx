const GithubText = ({
	repo,
	user,
}: {
	repo: string;
	user: string;
}) => {
	return (
		<span className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10">
			<span>
				<a href={`https://github.com/${user}`}>{user}</a>
			</span>
			<span>
				<span
					style={{
						margin: "0 0.25rem",
					}}
				>
					/
				</span>
				<span>
					<a href={`https://github.com/${user}/${repo}`}>{repo}</a>
				</span>
			</span>
		</span>
	);
};

export default GithubText;
