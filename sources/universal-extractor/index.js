/**
 * ReadAloud Universal Extractor & Paywall Bypasser
 *
 * All-in-one dynamic content extractor supporting custom rules for Medium,
 * Wikipedia, Substack, NYTimes, Bloomberg, The Verge, Vox, TechCrunch, Wired, and
 * a smart heuristic reader for all general websites.
 */
(function() {
    try {
        var host = (window.location.hostname || "").toLowerCase();

        // Helper to remove unwanted DOM elements
        function removeElements(root, selectors) {
            selectors.forEach(function(sel) {
                var els = root.querySelectorAll(sel);
                for (var i = 0; i < els.length; i++) {
                    els[i].remove();
                }
            });
        }

        // Helper to clean and collect paragraph text
        function collectText(root, tagSelector, textFilter) {
            var items = root.querySelectorAll(tagSelector || 'p, h2, h3, blockquote');
            var collected = [];
            for (var i = 0; i < items.length; i++) {
                var raw = (items[i].innerText || items[i].textContent || "").trim();
                if (textFilter ? textFilter(raw) : (raw.length > 0)) {
                    collected.push(raw);
                }
            }
            return collected.join("\n\n");
        }

        // -------------------------------------------------------------
        // 1. Wikipedia Rules
        // -------------------------------------------------------------
        if (host.includes("wikipedia.org")) {
            var firstHeading = document.getElementById('firstHeading');
            var wikiTitle = firstHeading ? firstHeading.innerText.trim() : document.title;
            var wikiBody = document.getElementById('mw-content-text') ||
                           document.querySelector('.mw-parser-output') ||
                           document.body;

            var wikiClone = wikiBody.cloneNode(true);
            removeElements(wikiClone, [
                'sup.reference', '.mw-editsection', '.infobox', '.sidebar',
                '.navbox', '.hatnote', '.ambox', '.reflist', '.noprint',
                'style', 'script', 'table', '.metadata'
            ]);

            var wikiParas = [];
            var tags = wikiClone.querySelectorAll('p, h2, h3');
            for (var w = 0; w < tags.length; w++) {
                var clean = (tags[w].innerText || tags[w].textContent || "").replace(/\[\d+\]/g, "").trim();
                if (clean.length > 0) {
                    wikiParas.push(clean);
                }
            }

            return JSON.stringify({
                title: wikiTitle,
                text: wikiParas.join("\n\n")
            });
        }

        // -------------------------------------------------------------
        // 2. Medium & Partner Blogs
        // -------------------------------------------------------------
        if (host.includes("medium.com") || host.includes("towardsdatascience.com") ||
            host.includes("hackernoon.com") || host.includes("betterprogramming.pub")) {
            var mTitleEl = document.querySelector('h1[data-testid="storyTitle"]') ||
                           document.querySelector('h1') ||
                           document.querySelector('meta[property="og:title"]');
            var mTitle = mTitleEl ? (mTitleEl.innerText || mTitleEl.getAttribute('content') || document.title) : document.title;

            var mSection = document.querySelector('section') || document.querySelector('article') || document.body;
            var mClone = mSection.cloneNode(true);
            removeElements(mClone, [
                'header', 'footer', 'nav', 'script', 'style',
                '[data-testid="header"]', '[data-testid="authorDetails"]',
                '[data-testid="paywall-overlay"]', '.meteredContent',
                'button', 'form', 'svg'
            ]);

            var mText = collectText(mClone, 'p, h2, h3, blockquote', function(t) {
                return t.length > 0 && !t.includes("Open in app") && !t.includes("Member-only story");
            });

            return JSON.stringify({
                title: (mTitle || "").trim(),
                text: mText
            });
        }

        // -------------------------------------------------------------
        // 3. Substack Newsletters
        // -------------------------------------------------------------
        if (host.includes("substack.com")) {
            var subTitleEl = document.querySelector('h1.post-title') || document.querySelector('h1');
            var subTitle = subTitleEl ? subTitleEl.innerText.trim() : document.title;

            var subBody = document.querySelector('.available-content') ||
                          document.querySelector('.body.markup') ||
                          document.querySelector('article') || document.body;
            var subClone = subBody.cloneNode(true);
            removeElements(subClone, [
                '.subscribe-widget', '.subscription-widget-wrap', '.paywall-curtain',
                'header', 'footer', 'nav', 'script', 'style', 'button'
            ]);

            var subText = collectText(subClone, 'p, h2, h3, blockquote', function(t) {
                return t.length > 0 && !t.includes("Get more from") && !t.includes("Upgrade to paid");
            });

            return JSON.stringify({
                title: subTitle,
                text: subText
            });
        }

        // -------------------------------------------------------------
        // 4. The New York Times
        // -------------------------------------------------------------
        if (host.includes("nytimes.com")) {
            var nytTitleEl = document.querySelector('h1[data-testid="headline"]') || document.querySelector('h1');
            var nytTitle = nytTitleEl ? nytTitleEl.innerText.trim() : document.title;

            var nytBody = document.querySelector('section[name="articleBody"]') ||
                          document.querySelector('article') || document.body;
            var nytClone = nytBody.cloneNode(true);
            removeElements(nytClone, [
                '#gateway-content', '[id^="expanded-dock"]', '.css-1hy2vtq',
                'header', 'footer', 'nav', 'script', 'style', 'button', 'figure'
            ]);

            var nytText = collectText(nytClone, 'p, h2, h3');
            return JSON.stringify({
                title: nytTitle,
                text: nytText
            });
        }

        // -------------------------------------------------------------
        // 5. Bloomberg
        // -------------------------------------------------------------
        if (host.includes("bloomberg.com")) {
            var bTitleEl = document.querySelector('h1') || document.querySelector('meta[property="og:title"]');
            var bTitle = bTitleEl ? (bTitleEl.innerText || bTitleEl.getAttribute('content') || document.title) : document.title;

            var bBody = document.querySelector('article') ||
                        document.querySelector('.body-content') ||
                        document.body;
            var bClone = bBody.cloneNode(true);
            removeElements(bClone, [
                '.paywall-fence', '[data-component="paywall"]',
                'header', 'footer', 'nav', 'script', 'style', 'button'
            ]);

            var bText = collectText(bClone, 'p, h2, h3');
            return JSON.stringify({
                title: (bTitle || "").trim(),
                text: bText
            });
        }

        // -------------------------------------------------------------
        // 6. The Verge & Vox Media
        // -------------------------------------------------------------
        if (host.includes("theverge.com") || host.includes("vox.com") ||
            host.includes("polygon.com") || host.includes("eater.com")) {
            var vTitleEl = document.querySelector('h1') || document.querySelector('meta[property="og:title"]');
            var vTitle = vTitleEl ? (vTitleEl.innerText || vTitleEl.getAttribute('content') || document.title) : document.title;

            var vBody = document.querySelector('article') ||
                        document.querySelector('.c-entry-content') ||
                        document.body;
            var vClone = vBody.cloneNode(true);
            removeElements(vClone, [
                '.c-entry-hero', '.c-commerce', '.c-newsletter-signup',
                'header', 'footer', 'nav', 'script', 'style', 'button'
            ]);

            var vText = collectText(vClone, 'p, h2, h3');
            return JSON.stringify({
                title: (vTitle || "").trim(),
                text: vText
            });
        }

        // -------------------------------------------------------------
        // 7. Universal Smart Reader (Fallback for any website)
        // -------------------------------------------------------------
        var uTitleEl = document.querySelector('h1') ||
                       document.querySelector('meta[property="og:title"]') ||
                       document.querySelector('meta[name="twitter:title"]');
        var uTitle = uTitleEl ? (uTitleEl.innerText || uTitleEl.getAttribute('content') || document.title) : document.title;

        var mainContent = document.querySelector('article') ||
                          document.querySelector('[role="main"]') ||
                          document.querySelector('main') ||
                          document.querySelector('.post-content') ||
                          document.querySelector('.entry-content') ||
                          document.querySelector('.article-body') ||
                          document.getElementById('content') ||
                          document.body;

        if (!mainContent) {
            return JSON.stringify({
                title: (uTitle || document.title || "").trim(),
                text: document.body ? document.body.innerText.trim() : ""
            });
        }

        var uClone = mainContent.cloneNode(true);
        removeElements(uClone, [
            'header', 'footer', 'nav', 'aside', 'script', 'style', 'noscript',
            '.ad', '.advertisement', '.social-share', '.cookie-banner', '.popup',
            '.newsletter', '.modal', '.banner', 'form', 'button', 'svg', 'iframe'
        ]);

        var uText = collectText(uClone, 'p, h2, h3, blockquote');
        if (!uText || uText.length < 50) {
            uText = (uClone.innerText || uClone.textContent || "").trim();
        }

        return JSON.stringify({
            title: (uTitle || document.title || "").trim(),
            text: uText
        });

    } catch (e) {
        return JSON.stringify({
            title: document.title || "",
            text: document.body ? document.body.innerText : ""
        });
    }
})();
