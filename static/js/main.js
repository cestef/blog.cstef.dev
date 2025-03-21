window.addEventListener("DOMContentLoaded", () => {
	const fuse = new Fuse(window.searchIndex, {
		keys: ["title", "description"],
		includeScore: true,
		includeMatches: true,
	});

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
			scrollButton.style.pointerEvents = "auto";
			enabled = true;
		} else {
			scrollButton.style.opacity = 0;
			scrollButton.style.pointerEvents = "none";
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
	const codeBlockStart = performance.now();
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
	console.log(
		`Copy buttons injection took ${(performance.now() - codeBlockStart).toFixed(2)} ms`
	);

	const twemojiStart = performance.now();
	twemoji.parse(document.body);
	console.log(`twemoji.parse() took ${(performance.now() - twemojiStart).toFixed(2)} ms`);

	const input = document.getElementById("goto-input");
	const results = document.getElementById("goto-results");
	const popup = document.getElementById("goto-popup");

	let selectedIndex = -1;
	let searchResults = [];

	function highlightResult(index) {
		const resultElements = results.querySelectorAll(".goto-result");

		for (const el of resultElements) {
			el.classList.remove("selected");
		}

		if (index >= 0 && index < resultElements.length) {
			resultElements[index].classList.add("selected");
			resultElements[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}

	function performSearch() {
		const query = input.value.trim();
		searchResults = query ? fuse.search(query) : [];

		results.innerHTML = "";

		if (searchResults.length === 0 && query) {
			const noResult = document.createElement("div");
			noResult.className = "goto-no-result";
			noResult.textContent = "No results found";
			results.appendChild(noResult);
			return;
		}

		for (const { item } of searchResults) {
			const result = document.createElement("a");
			result.href = item.url;
			result.className = "goto-result";
			result.innerHTML = `<h3>${item.title}</h3>`;

			// Add mouse interactions
			result.addEventListener("mouseenter", () => {
				selectedIndex = Array.from(results.children).indexOf(result);
				highlightResult(selectedIndex);
			});

			results.appendChild(result);
		}

		// Reset selection
		selectedIndex = searchResults.length > 0 ? 0 : -1;
		highlightResult(selectedIndex);
	}

	function navigateToResult(index) {
		if (index >= 0 && index < searchResults.length) {
			window.location.href = searchResults[index].item.url;
		}
	}

	let buttonClicked = false;

	input.addEventListener("input", () => {
		// const now = performance.now();
		performSearch();
		// console.log(`Search took ${(performance.now() - now).toFixed(2)} ms`);
	});

	input.addEventListener("keydown", (e) => {
		switch (e.key) {
			case "ArrowDown":
			case "Tab":
				e.preventDefault();
				if (searchResults.length > 0) {
					selectedIndex = (selectedIndex + 1) % searchResults.length;
					highlightResult(selectedIndex);
				}
				break;

			case "ArrowUp":
				e.preventDefault();
				if (searchResults.length > 0) {
					selectedIndex =
						(selectedIndex - 1 + searchResults.length) % searchResults.length;
					highlightResult(selectedIndex);
				}
				break;

			case "Enter":
				e.preventDefault();
				navigateToResult(selectedIndex);
				break;

			case "Escape":
				e.preventDefault();
				popup.classList.remove("active");
				input.blur();
				break;
		}
	});

	input.addEventListener("blur", (e) => {
		if (!buttonClicked && !popup.contains(e.relatedTarget)) {
			console.log("blur,hidePopup");
			setTimeout(() => {
				popup.classList.remove("active");
			}, 50);
		}
		buttonClicked = false;
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			if (popup.classList.contains("active")) {
				popup.classList.remove("active");
				// input.blur();
			} else {
				popup.classList.add("active");
				input.focus();
				input.select();
			}
		}

		if (
			e.key === "/" &&
			document.activeElement.tagName !== "INPUT" &&
			document.activeElement.tagName !== "TEXTAREA"
		) {
			e.preventDefault();
			popup.classList.add("active");
			input.focus();
			input.select();
		}

		if (e.key === "Escape" && popup.classList.contains("active")) {
			e.preventDefault();
			popup.classList.remove("active");
			input.blur();
		}

		if (!popup.classList.contains("active") && !(e.ctrlKey || e.metaKey)) {
			let scrollBy;
			switch (e.key) {
				case "k":
					scrollBy = -100;
					break;
				case "j":
					scrollBy = 100;
					break;

				case "h":
					window.history.back();
					break;
				case "l":
					window.history.forward();
					break;

				default:
					return;
			}

			const scrollElement = document.getElementById("scroll-element");
			scrollElement.scrollBy({
				top: scrollBy,
			});
		}
	});

	const gotoButton = document.getElementById("goto-button");
	if (gotoButton) {
		gotoButton.addEventListener("click", () => {
			buttonClicked = true;
			popup.classList.toggle("active");
			if (popup.classList.contains("active")) {
				input.focus();
				input.select();
			}
		});
	}

	document.addEventListener("touchstart", (e) => {
		if (
			popup.classList.contains("active") &&
			!popup.contains(e.target) &&
			e.target !== gotoButton
		) {
			popup.classList.remove("active");
		}
	});
});
