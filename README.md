# ReferenceFinder

ReferenceFinder is a lightweight browser extension that extracts citation-ready references (author, year, title, site, URL) from search results and web pages and helps you quickly filter them by website, author, and year.

**Why this tool exists**
- Saves time when gathering bibliographic references during research, literature reviews, and writing tasks.
- Reduces manual copy/paste and metadata lookups for frequently cited web resources.

**What it does**
- Scans the current page for links and tries to extract minimal metadata (author and year where present).
- Lets you filter results by website (site-first), then by author and year, so you can focus only on relevant sources.
- Displays concise, copy-ready references you can paste directly into notes or documents.

**How to use**
1. Click the extension action (the toolbar icon) to open the popup (`popup.html`).
2. Select a website from the website list to narrow results to that domain.
3. Pick one or more authors and years from the lists, then click "Apply Filters".
4. Click any result to copy a citation-ready line to your clipboard.

**Why it helps**
- Speeds up collecting references from search results and pages without leaving the browser.
- Encourages consistent reference snippets (author — year — URL) for quick note-taking.
- Lightweight and focused: no account or cloud service required; data stays in your browser session.

**Permissions**
- The extension requests access to pages where it runs so it can read page links and metadata. It only reads the content of pages when you open the popup and request links.

**Troubleshooting & Tips**
- If you see few or no results, open the popup console (right-click popup → Inspect) and check logs; many sites don't include clear author/year text in link text.
- The extraction uses heuristics — verify copied references before using them in formal documents.

**Development & Contribution**
- Code lives in this folder. To change the popup layout, edit `popup.html` and the styling. Keep existing element IDs so the scripts in `popup.js` keep working.

---
_If you'd like, I can add a short video GIF or screenshot to demonstrate the popup workflow._
