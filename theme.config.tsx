const config = {
	footer: (
		<p>
			© {new Date().getFullYear()} - Built with{" "}
			<a href="https://nextra.site/">Nextra</a> ·{" "}
			<a href="https://github.com/cestef">GitHub</a>
		</p>
	),
	head: ({ title, meta }) => (
		<>
			{meta.description && (
				<meta name='description' content={meta.description} />
			)}
			{meta.tag && <meta name='keywords' content={meta.tag} />}
			{meta.author && <meta name='author' content={meta.author} />}
			{meta.image && <meta name='image' content={meta.image} />}
			{meta.url && <meta name='url' content={meta.url} />}
			{meta.title && <meta name='title' content={meta.title} />}
			{/* <link rel='icon' href='/favicon.ico' /> */}
		</>
	),
	dateFormatter: (date) => `${date.toDateString()}`,

	components: {
		h1: ({ children }) => (
			<h1
				style={{
					WebkitBackgroundClip: "inherit",
					WebkitTextFillColor: "inherit",
					backgroundClip: "inherit",
					backgroundImage: "none",
				}}
			>
				{children}
			</h1>
		),
	},
	readMore: "Read →",
	darkMode: true,
};

export default config;
