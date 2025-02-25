window.addEventListener("DOMContentLoaded", () => {
	// Hide/show the scroll-to-top button
	const scrollButton = document.getElementById("scroll-to-top");
	const fillElement = document.getElementById("scroll-fill");
	const scrollElement = document.getElementById("scroll-element");
	let enabled = false;
	scrollElement.addEventListener("scroll", (e) => {
		const percent =
			(e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)) * 100;
		fillElement.style.width = `${percent}%`;
		if (e.target.scrollTop > 300) {
			scrollButton.style.opacity = 1;
			scrollButton.style.cursor = "pointer";
			enabled = true;
		} else {
			scrollButton.style.opacity = 0;
			scrollButton.style.cursor = "default";
			enabled = false;
		}
	});

	scrollButton.addEventListener("click", (e) => {
		if (!enabled) return;
		scrollElement.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	});

	// Add copy buttons to code blocks (data-copy)
	const preElements = document.querySelectorAll("pre[data-copy]");
	for (const preElement of preElements) {
		const codeElement = preElement.querySelector("code");
		const copyButton = document.createElement("button");
		copyButton.className = "copy-button";
		copyButton.textContent = "Copy";
		copyButton.addEventListener("click", () => {
			navigator.clipboard.writeText(codeElement.textContent);
			copyButton.textContent = "Copied!";
			setTimeout(() => {
				copyButton.textContent = "Copy";
			}, 2000);
		});
		preElement.appendChild(copyButton);
	}
});
