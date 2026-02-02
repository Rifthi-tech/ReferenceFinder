// Auto-detect search results on page
const detectedResults = [];

// Common author patterns in search results
const authorPatterns = [
    /by\s+([^\.]+?)(?:\.|,|\d|$)/i,
    /author[s]?:\s*([^\.]+?)(?:\.|,|$)/i,
    /([A-Z][a-z]+ [A-Z][a-z]+)(?:\s+et al\.)?\s*[-–]\s*(?:19|20)\d{2}/,
    /([A-Z]\.[A-Z][a-z]+)(?:\s+et al\.)?\s*,\s*(?:19|20)\d{2}/
];

// Year patterns
const yearPatterns = [
    /(?:19|20)\d{2}/g
];

function extractResults() {
    detectedResults.length = 0;
    
    // For Google Search
    const googleResults = document.querySelectorAll('div.g, div[data-hveid]');
    if (googleResults.length > 0) {
        extractGoogleResults(googleResults);
        return;
    }
    
    // For Google Scholar
    const scholarResults = document.querySelectorAll('.gs_r, .gs_ri');
    if (scholarResults.length > 0) {
        extractScholarResults(scholarResults);
        return;
    }
    
    // Fallback: find all links that look like research papers
    extractGenericResults();
}

function extractGoogleResults(elements) {
    elements.forEach((element, index) => {
        const result = {
            id: index,
            title: '',
            url: '',
            author: '',
            year: '',
            domain: ''
        };
        
        // Get title and URL
        const titleLink = element.querySelector('h3 a, .yuRUbf a');
        if (titleLink) {
            result.title = titleLink.textContent.trim();
            result.url = titleLink.href;
        }
        
        // Get domain
        try {
            if (result.url) {
                result.domain = new URL(result.url).hostname.replace('www.', '');
            }
        } catch(e) {}
        
        // Extract author and year from snippet
        const snippet = element.querySelector('.VwiC3b, .IsZvec, .st');
        if (snippet) {
            const text = snippet.textContent;
            result.author = extractAuthor(text);
            result.year = extractYear(text);
        }
        
        if (result.url) {
            detectedResults.push(result);
        }
    });
}

function extractScholarResults(elements) {
    elements.forEach((element, index) => {
        const result = {
            id: index,
            title: '',
            url: '',
            author: '',
            year: '',
            domain: 'scholar.google.com'
        };
        
        // Title and link
        const titleEl = element.querySelector('.gs_rt a, h3 a');
        if (titleEl) {
            result.title = titleEl.textContent.trim();
            result.url = titleEl.href || '#';
        }
        
        // Author and year info (Google Scholar specific)
        const infoEl = element.querySelector('.gs_a');
        if (infoEl) {
            const infoText = infoEl.textContent;
            // Format: "Authors - Publication, Year"
            const match = infoText.match(/([^-]+)-([^,]+),\s*(\d{4})/);
            if (match) {
                result.author = match[1].trim();
                result.year = match[3];
            }
        }
        
        if (result.title) {
            detectedResults.push(result);
        }
    });
}

function extractGenericResults() {
    const links = document.querySelectorAll('a[href*="http"]');
    const seen = new Set();
    
    links.forEach((link, index) => {
        const url = link.href;
        if (seen.has(url) || !url.startsWith('http')) return;
        seen.add(url);
        
        const result = {
            id: index,
            title: link.textContent.trim() || link.title || 'No title',
            url: url,
            author: '',
            year: '',
            domain: ''
        };
        
        try {
            result.domain = new URL(url).hostname.replace('www.', '');
        } catch(e) {}
        
        detectedResults.push(result);
    });
}

function extractAuthor(text) {
    for (const pattern of authorPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return '';
}

function extractYear(text) {
    for (const pattern of yearPatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[0];
        }
    }
    return '';
}

// Highlight results on page
function highlightResults(urls) {
    // Remove previous highlights
    document.querySelectorAll('.ref-finder-highlight').forEach(el => {
        el.classList.remove('ref-finder-highlight');
    });
    
    // Highlight matching results
    detectedResults.forEach(result => {
        if (urls.includes(result.url)) {
            // Find the element containing this result
            const elements = document.querySelectorAll(`a[href="${result.url}"]`);
            elements.forEach(el => {
                let parent = el.closest('div.g, .gs_r, .gs_ri, li');
                if (parent) {
                    parent.classList.add('ref-finder-highlight');
                }
            });
        }
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.action) {
        case "getResults":
            extractResults();
            sendResponse({results: detectedResults});
            break;
            
        case "highlightResults":
            highlightResults(request.results);
            sendResponse({success: true});
            break;
    }
    return true;
});

// Add CSS for highlighting
const style = document.createElement('style');
style.textContent = `
    .ref-finder-highlight {
        background-color: rgba(26, 115, 232, 0.1) !important;
        border: 2px solid #1a73e8 !important;
        border-radius: 8px !important;
        padding: 10px !important;
        margin: 5px 0 !important;
        transition: all 0.3s ease !important;
    }
    
    .ref-finder-highlight:hover {
        background-color: rgba(26, 115, 232, 0.2) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
`;
document.head.appendChild(style);

// Auto-extract when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractResults);
} else {
    extractResults();
}