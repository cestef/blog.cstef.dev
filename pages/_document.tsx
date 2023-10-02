import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

const { UMAMI_WEBSITE_ID } = publicRuntimeConfig;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script
					async
					src="https://analytics.eu.umami.is/script.js"
					data-website-id={UMAMI_WEBSITE_ID}
				></script>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
