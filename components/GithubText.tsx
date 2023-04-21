const GithubText = ({
	repo,
	user,
}: {
	repo: string;
	user: string;
}) => {
	return (
		<span
			style={{
				padding: "0.5rem",
				borderRadius: "0.5rem",
				backgroundColor: "#2A2933",
				border: "1px solid #7e7e7e",
			}}
		>
			<span>
				<a href={`https://github.com/${user}`}>{user}</a>
			</span>
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
	);
};

export default GithubText;
