const GradientText = ({ children }) => {
	return (
		<span
			style={{
				WebkitBackgroundClip: "text",
				WebkitTextFillColor: "transparent",
				backgroundClip: "text",
				backgroundImage:
					"linear-gradient(90deg, hsla(238, 100%, 71%, 1) 0%, hsla(295, 100%, 84%, 1) 100%)",
			}}
		>
			{children}
		</span>
	);
};

export default GradientText;
