const TODO = ({ children }) => {
	return (
		<code className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10  ">
			<span
				style={{
					color: "rgb(239, 98, 112)",
				}}
			>
				TODO: {children}
			</span>
		</code>
	);
};

export default TODO;
