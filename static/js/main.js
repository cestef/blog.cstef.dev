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
    const preElements = document.querySelectorAll("pre");
    for (const preElement of preElements) {
        const canCopy = preElement.dataset.copy !== undefined;
        const buttonsHolder = document.createElement("div");
        buttonsHolder.className = "buttons-holder";
        preElement.appendChild(buttonsHolder);
        const toggleWrapButton = document.createElement("button");
        toggleWrapButton.className = "wrap-toggle";
        toggleWrapButton.textContent = "Wrap";
        toggleWrapButton.addEventListener("click", () => {
            const html = document.querySelector("html");
            html.toggleAttribute("data-wrap");
        });
        buttonsHolder.appendChild(toggleWrapButton);

        if (canCopy) {
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
            buttonsHolder.appendChild(copyButton);
        }
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
    const overlay = document.getElementById("goto-overlay");

    let selectedIndex = -1;
    let searchResults = [];

    const showPopup = () => {
        popup.classList.add("active");
        overlay.classList.add("opacity-100");
        input.focus();
        input.select();
    };

    const hidePopup = () => {
        popup.classList.remove("active");
        overlay.classList.remove("opacity-100");
        input.blur();
    };

    const togglePopup = () => {
        popup.classList.contains("active") ? hidePopup() : showPopup();
    };

    const highlightResult = (index) => {
        const resultElements = results.querySelectorAll(".goto-result");
        // biome-ignore lint/complexity/noForEach: it's fine
        resultElements.forEach((el) => el.classList.remove("selected"));

        if (index >= 0 && index < resultElements.length) {
            resultElements[index].classList.add("selected");
            resultElements[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    };

    const performSearch = () => {
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

        searchResults.forEach(({ item }, index) => {
            const result = document.createElement("a");
            result.href = item.url;
            result.className = "goto-result";
            result.innerHTML = `<h3>${item.title}</h3>`;
            result.addEventListener("mouseenter", () => {
                selectedIndex = index;
                highlightResult(selectedIndex);
            });
            results.appendChild(result);
        });

        selectedIndex = searchResults.length > 0 ? 0 : -1;
        highlightResult(selectedIndex);
    };

    const navigateToSelected = () => {
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            window.location.href = searchResults[selectedIndex].item.url;
        }
    };

    const navigateResults = (direction) => {
        if (searchResults.length === 0) return;
        selectedIndex = (selectedIndex + direction + searchResults.length) % searchResults.length;
        highlightResult(selectedIndex);
    };

    let buttonClicked = false;

    input.addEventListener("input", performSearch);

    input.addEventListener("keydown", (e) => {
        const actions = {
            ArrowDown: () => navigateResults(1),
            Tab: () => navigateResults(1),
            ArrowUp: () => navigateResults(-1),
            Enter: navigateToSelected,
            Escape: hidePopup,
        };

        if (actions[e.key]) {
            e.preventDefault();
            actions[e.key]();
        }
    });

    input.addEventListener("blur", (e) => {
        if (!buttonClicked && !popup.contains(e.relatedTarget)) {
            setTimeout(hidePopup, 50);
        }
        buttonClicked = false;
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            togglePopup();
            return;
        }

        if (
            e.key === "/" &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "TEXTAREA"
        ) {
            e.preventDefault();
            showPopup();
            return;
        }

        if (e.key === "Escape" && popup.classList.contains("active")) {
            e.preventDefault();
            hidePopup();
            return;
        }

        if (popup.classList.contains("active") || e.ctrlKey || e.metaKey) return;

        const scrollActions = {
            k: -100,
            j: 100,
            h: () => window.history.back(),
            l: () => window.history.forward(),
        };

        const action = scrollActions[e.key];
        if (action !== undefined) {
            if (typeof action === "number") {
                document.getElementById("scroll-element").scrollBy({ top: action });
            } else {
                action();
            }
        }
    });

    const gotoButton = document.getElementById("goto-button");
    if (gotoButton) {
        gotoButton.addEventListener("click", () => {
            buttonClicked = true;
            togglePopup();
        });
    }

    document.addEventListener("touchstart", (e) => {
        if (
            popup.classList.contains("active") &&
            !popup.contains(e.target) &&
            e.target !== gotoButton
        ) {
            hidePopup();
        }
    });
});
