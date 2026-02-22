# 🚀 ReferenceFinder

<div align="center">


[![GitHub stars](https://img.shields.io/github/stars/Rifthi-tech/ReferenceFinder?style=for-the-badge)](https://github.com/Rifthi-tech/ReferenceFinder/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Rifthi-tech/ReferenceFinder?style=for-the-badge)](https://github.com/Rifthi-tech/ReferenceFinder/network)
[![GitHub issues](https://img.shields.io/github/issues/Rifthi-tech/ReferenceFinder?style=for-the-badge)](https://github.com/Rifthi-tech/ReferenceFinder/issues)
[![GitHub license](https://img.shields.io/github/license/Rifthi-tech/ReferenceFinder?style=for-the-badge)](LICENSE) <!-- TODO: Add LICENSE file or specify license in manifest -->

**Seamlessly extract, filter, and generate citation-ready references from search results and web pages.**


</div>

## 📖 Overview

ReferenceFinder is an intelligent browser extension designed to streamline the academic and research process. It automatically identifies and extracts key bibliographic information such as author, year, title, site name, and URL from search engine results and active web pages. By automating this tedious task, ReferenceFinder empowers students, researchers, and professionals to significantly reduce the time spent on creating accurate reports, assignments, and theses, allowing them to focus more on content and analysis.

## ✨ Features

- 🎯 **Automatic Reference Extraction**: Intelligently parses search results and web page content to identify potential references.
- ⚙️ **Intelligent Data Filtering**: Extracts precise components like author, year, title, site name, and URL from complex web structures.
- 📝 **Citation-Ready Generation**: Formats extracted data into a structured, citation-ready format suitable for various academic styles.
- 🚀 **One-Click Access**: Easily view and manage extracted references directly from the extension's popup UI.
- 🌐 **Broad Compatibility**: Designed to work across various web pages and search engines.

## 🛠️ Tech Stack

**Browser Extension Technologies:**

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Web Extensions API](https://img.shields.io/badge/Web_Extensions_API-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 🚀 Quick Start

To install and run ReferenceFinder as a browser extension in developer mode, follow these steps.

### Prerequisites

- A Chromium-based web browser (e.g., Google Chrome, Microsoft Edge, Brave, Vivaldi).

### Installation (Developer Mode)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Rifthi-tech/ReferenceFinder.git
    cd ReferenceFinder
    ```

2.  **Open your browser's extensions page**
    -   For Chrome: Go to `chrome://extensions`
    -   For Edge: Go to `edge://extensions`
    -   For Brave: Go to `brave://extensions`

3.  **Enable Developer Mode**
    -   Toggle the "Developer mode" switch, usually found in the top-right corner of the extensions page.

4.  **Load the unpacked extension**
    -   Click the "Load unpacked" button.
    -   Navigate to the cloned `ReferenceFinder` directory on your computer and select it.

5.  **Pin the extension (optional)**
    -   Click the puzzle piece icon (Extensions icon) in your browser toolbar.
    -   Find "ReferenceFinder" and click the pin icon next to it to make it easily accessible.

The ReferenceFinder icon should now appear in your browser's toolbar, and the extension is ready for use.

## 📁 Project Structure

```
ReferenceFinder/
├── Image/             # Contains extension icons and potential screenshots
├── content.js         # Script injected into web pages for content extraction
├── manifest.json      # Browser extension configuration file
├── popup.html         # HTML structure for the extension's popup UI
├── popup.js           # JavaScript logic for the extension's popup UI
└── README.md          # Project README file
```

## ⚙️ Configuration

The primary configuration for ReferenceFinder is managed through its `manifest.json` file. This file defines the extension's name, version, permissions, content scripts, and popup UI.

### manifest.json

-   **`name`**: The name of the extension.
-   **`version`**: The current version of the extension.
-   **`description`**: A brief summary of the extension's functionality.
-   **`permissions`**: Required browser API permissions (e.g., `activeTab`, `scripting`, `storage`).
-   **`host_permissions`**: Specifies which websites the extension can interact with (e.g., `<all_urls>`).
-   **`action`**: Defines the popup UI (`popup.html`).
-   **`content_scripts`**: Specifies `content.js` to run on certain URLs (`matches`).

## 🔧 Development

ReferenceFinder is built with vanilla JavaScript, HTML, and CSS, making development straightforward.

### Modifying the Extension

1.  **Edit Files**: Make changes to `popup.html`, `popup.js`, `content.js`, or `manifest.json` as needed.
2.  **Reload Extension**: After making changes, go back to your browser's `chrome://extensions` page (or equivalent), find "ReferenceFinder," and click the reload button (a circular arrow icon) to apply your changes.
3.  **Test Functionality**: Test the updated extension's behavior on relevant web pages.

### Important Development Notes

-   `content.js` runs in the context of the web page, allowing it to interact with the DOM.
-   `popup.js` runs in the context of the extension's popup and handles the UI logic.
-   Communication between `content.js` and `popup.js` (or other extension scripts) can be achieved using `chrome.runtime.sendMessage` and `chrome.runtime.onMessage`.

## 🧪 Testing

Given the client-side nature and lack of external dependencies, testing is primarily manual.

-   **Functional Testing**:
    -   Open various search engines (Google, Bing, etc.) and perform searches.
    -   Navigate to different types of web pages (articles, blogs, academic journals).
    -   Open the ReferenceFinder popup and verify that references are extracted correctly and displayed as expected.
    -   Test edge cases, such as pages with minimal text or complex layouts.
-   **Permission Testing**: Ensure the extension only accesses resources it has permission for.

## 🚀 Deployment

To prepare ReferenceFinder for distribution (e.g., uploading to the Chrome Web Store), you'll need to package it.

### Creating a Production Build

1.  **Review `manifest.json`**: Ensure all permissions and configurations are final and correct for a production environment.
2.  **Remove Developer Mode**: Disable "Developer mode" in your browser's extensions page.
3.  **Pack the Extension**:
    -   On the `chrome://extensions` page, click the "Pack extension" button.
    -   For "Extension root directory", browse and select the `ReferenceFinder` folder.
    -   Leave the "Private key file" field empty if this is your first time packing. The browser will generate a `.pem` file for you. Keep this `.pem` file safe; it's needed to update your extension later.
    -   Click "Pack extension".
    -   This will create a `.crx` file (the packaged extension) and a `.pem` file in the parent directory of your `ReferenceFinder` folder.

The `.crx` file is your distributable extension package.

## 🤝 Contributing

We welcome contributions to ReferenceFinder! If you have suggestions for new features, bug fixes, or improvements, please feel free to contribute.

1.  **Fork the repository**.
2.  **Create a new branch** for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  **Make your changes** and ensure they align with the project's purpose.
4.  **Test your changes** thoroughly in developer mode.
5.  **Commit your changes** (`git commit -m 'feat: Add new reference extraction logic'`).
6.  **Push to your fork** (`git push origin feature/your-feature-name`).
7.  **Open a Pull Request** to the `main` branch of this repository, describing your changes in detail.


## 🙏 Acknowledgments

-   Inspired by the need for efficient academic research tools.

## 📞 Support & Contact

-   🐛 Issues: [GitHub Issues](https://github.com/Rifthi-tech/ReferenceFinder/issues)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Rifthi-tech

</div>
