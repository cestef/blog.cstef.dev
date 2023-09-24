import twemoji from "twemoji";

const Twemoji = ({ emoji }: { emoji: string }) => {
	return (
		<span
			style={{
				display: "inline-block",
				width: "1.5rem",
				height: "1.5rem",
				verticalAlign: "text-bottom",
			}}
			// rome-ignore lint/security/noDangerouslySetInnerHtml: Need to use dangerouslySetInnerHTML to render twemoji
			dangerouslySetInnerHTML={{
				__html: twemoji.parse(emoji, {
					folder: "svg",
					ext: ".svg",
					base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
				}),
			}}
		/>
	);
};

export default Twemoji;
