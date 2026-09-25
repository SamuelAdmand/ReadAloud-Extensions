/**
 * ReadAloud Extension for Wikipedia articles.
 *
 * Strips citation notes, references, infoboxes, and edit links for seamless listening.
 */
(function() {
    try {
        var firstHeading = document.getElementById('firstHeading');
        var title = firstHeading ? firstHeading.innerText.trim() : document.title;

        var bodyContent = document.getElementById('mw-content-text');
        if (!bodyContent) {
            bodyContent = document.querySelector('.mw-parser-output') || document.body;
        }

        var clone = bodyContent.cloneNode(true);

        // Remove citations like [1], [edit], infoboxes, hatnotes, navboxes, audio players
        var clutterSelectors = [
            'sup.reference', '.mw-editsection', '.infobox', '.sidebar',
            '.navbox', '.hatnote', '.ambox', '.reflist', '.noprint',
            'style', 'script', 'table', '.metadata'
        ];

        clutterSelectors.forEach(function(sel) {
            var items = clone.querySelectorAll(sel);
            for (var i = 0; i < items.length; i++) {
                items[i].remove();
            }
        });

        // Collect all readable paragraphs
        var paragraphs = [];
        var pTags = clone.querySelectorAll('p, h2, h3');
        for (var j = 0; j < pTags.length; j++) {
            var rawText = (pTags[j].innerText || pTags[j].textContent || "").trim();
            // Remove lingering bracket citations like [12]
            var cleanText = rawText.replace(/\[\d+\]/g, "").trim();
            if (cleanText.length > 0) {
                paragraphs.push(cleanText);
            }
        }

        return JSON.stringify({
            title: title,
            text: paragraphs.join("\n\n")
        });
    } catch (e) {
        return JSON.stringify({
            title: document.title || "",
            text: document.body ? document.body.innerText : ""
        });
    }
})();
