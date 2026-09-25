/**
 * ReadAloud Extension for Medium & Partner Blogs.
 *
 * Extracts story text, bypasses sticky headers, removes membership prompts.
 */
(function() {
    try {
        // Extract Title
        var titleEl = document.querySelector('h1[data-testid="storyTitle"]') ||
                      document.querySelector('h1') ||
                      document.querySelector('meta[property="og:title"]');
        var title = titleEl ? (titleEl.innerText || titleEl.getAttribute('content') || document.title) : document.title;
        title = (title || "").trim();

        // Extract story content
        var storySection = document.querySelector('section') || document.querySelector('article') || document.body;
        if (!storySection) {
            return JSON.stringify({ title: title, text: "" });
        }

        var clone = storySection.cloneNode(true);

        // Remove paywalls, member previews, clapping counters, and author headers
        var removeList = [
            'header', 'footer', 'nav', 'script', 'style',
            '[data-testid="header"]', '[data-testid="authorDetails"]',
            '[data-testid="paywall-overlay"]', '.meteredContent',
            'button', 'form', 'svg'
        ];

        removeList.forEach(function(sel) {
            var elements = clone.querySelectorAll(sel);
            for (var i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
        });

        // Collect all paragraphs and headings in order
        var paragraphs = [];
        var nodes = clone.querySelectorAll('p, h1, h2, h3, blockquote');
        for (var j = 0; j < nodes.length; j++) {
            var text = (nodes[j].innerText || nodes[j].textContent || "").trim();
            if (text.length > 0 && !text.includes("Open in app") && !text.includes("Member-only story")) {
                paragraphs.push(text);
            }
        }

        var fullText = paragraphs.join("\n\n");
        if (!fullText) {
            fullText = (clone.innerText || clone.textContent || "").trim();
        }

        return JSON.stringify({
            title: title,
            text: fullText
        });
    } catch (e) {
        return JSON.stringify({
            title: document.title || "",
            text: document.body ? document.body.innerText : ""
        });
    }
})();
