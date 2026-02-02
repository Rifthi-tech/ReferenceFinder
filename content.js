// Content script for Research Finder

console.log('Research Finder content script loaded');

// Store detected results
let pageResults = [];

// Extract results from search page
function extractSearchResults() {
    console.log('Extracting search results...');
    pageResults = [];
    
    const url = window.location.href;
    
    if (url.includes('google.com/search')) {
        extractGoogleSearchResults();
    } else if (url.includes('scholar.google.com')) {
        extractGoogleScholarResults();
    } else if (url.includes('bing.com/search')) {
        extractBingResults();
    } else {
        extractGenericResults();
    }
    
    console.log(`Found ${pageResults.length} results`);
    return pageResults;
}

// Google Search results
function extractGoogleSearchResults() {
    const resultElements = document.querySelectorAll('div.g, div[data-hveid]');
    
    resultElements.forEach((element, index) => {
        const result = {
            id: `result-${index}`,
            title: '',
            url: '',
            author: '',
            year: '',
            domain: ''
        };
        
        // Get title and URL
        const titleElement = element.querySelector('h3 a, .yuRUbf a, a[data-ved]');
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            result.url = titleElement.href;
        }
        
        // Get snippet text for author/year extraction
        const snippetElement = element.querySelector('.VwiC3b, .IsZvec, .st');
        if (snippetElement) {
            const snippetText = snippetElement.textContent;
            
            // Try to extract author
            const authorMatch = snippetText.match(/(?:by|author[s]?)\s+([^\.]+?)(?:\.|,|\d|$)/i);
            if (authorMatch) {
                result.author = authorMatch[1].trim();
            }
            
            // Try to extract year (4-digit year)
            const yearMatch = snippetText.match(/(?:19|20)\d{2}/);
            if (yearMatch) {
                result.year = yearMatch[0];
            }
        }
        
        // Get domain from URL
        try {
            if (result.url) {
                const urlObj = new URL(result.url);
                result.domain = urlObj.hostname.replace('www.', '');
            }
        } catch(e) {
            console.log('URL parse error:', e);
        }
        
        if (result.title || result.url) {
            pageResults.push(result);
        }
    });
}

// Google Scholar results
function extractGoogleScholarResults() {
    const resultElements = document.querySelectorAll('.gs_r, .gs_ri, .gs_or');
    
    resultElements.forEach((element, index) => {
        const result = {
            id: `scholar-${index}`,
            title: '',
            url: '',
            author: '',
            year: '',
            domain: 'scholar.google.com'
        };
        
        // Title
        const titleElement = element.querySelector('.gs_rt a, h3 a');
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            result.url = titleElement.href || '#';
        }
        
        // Author and year info
        const infoElement = element.querySelector('.gs_a');
        if (infoElement) {
            const infoText = infoElement.textContent;
            
            // Format: Authors - Publication, Year
            const match = infoText.match(/([^-]+)-([^,]+),\s*(\d{4})/);
            if (match) {
                result.author = match[1].trim();
                result.year = match[3];
            }
        }
        
        if (result.title) {
            pageResults.push(result);
        }
    });
}

// Bing results
function extractBingResults() {
    const resultElements = document.querySelectorAll('li.b_algo');
    
    resultElements.forEach((element, index) => {
        const result = {
            id: `bing-${index}`,
            title: '',
            url: '',
            author: '',
            year: '',
            domain: ''
        };
        
        // Title and URL
        const titleElement = element.querySelector('h2 a');
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            result.url = titleElement.href;
        }
        
        // Snippet for metadata
        const snippetElement = element.querySelector('.b_caption p');
        if (snippetElement) {
            const snippetText = snippetElement.textContent;
            
            const authorMatch = snippetText.match(/(?:by|author[s]?)\s+([^\.]+?)(?:\.|,|$)/i);
            if (authorMatch) {
                result.author = authorMatch[1].trim();
            }
            
            const yearMatch = snippetText.match(/(?:19|20)\d{2}/);
            if (yearMatch) {
                result.year = yearMatch[0];
            }
        }
        
        // Domain
        try {
            if (result.url) {
                const urlObj = new URL(result.url);
                result.domain = urlObj.hostname.replace('www.', '');
            }
        } catch(e) {}
        
        if (result.title) {
            pageResults.push(result);
        }
    });
}

// Generic fallback
function extractGenericResults() {
    const links = document.querySelectorAll('a[href^="http"]');
    const seen = new Set();
    
    links.forEach((link, index) => {
        if (seen.has(link.href)) return;
        seen.add(link.href);
        
        const result = {
            id: `link-${index}`,
            title: link.textContent.trim().substring(0, 100) || link.title || 'Untitled',
            url: link.href,
            author: '',
            year: '',
            domain: ''
        };
        
        try {
            const urlObj = new URL(link.href);
            result.domain = urlObj.hostname.replace('www.', '');
        } catch(e) {}
        
        pageResults.push(result);
    });
}

// Highlight results on page
function highlightResultsOnPage(filteredResults) {
    console.log('Highlighting', filteredResults.length, 'results');
    
    // Remove old highlights
    document.querySelectorAll('.research-finder-highlight').forEach(el => {
        el.classList.remove('research-finder-highlight');
    });
    
    if (filteredResults.length === 0) return;
    
    // Find and highlight matching results
    filteredResults.forEach(result => {
        if (!result.url) return;
        
        // Try to find the result element by URL
        const elements = document.querySelectorAll(`a[href*="${result.url}"]`);
        
        if (elements.length === 0) {
            // Try partial match
            const urlParts = result.url.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart) {
                const partialElements = document.querySelectorAll(`a[href*="${lastPart}"]`);
                partialElements.forEach(el => {
                    const parent = el.closest('div.g, .gs_r, li.b_algo, .search-result');
                    if (parent) {
                        parent.classList.add('research-finder-highlight');
                    }
                });
            }
        } else {
            elements.forEach(el => {
                const parent = el.closest('div.g, .gs_r, li.b_algo, .search-result');
                if (parent) {
                    parent.classList.add('research-finder-highlight');
                }
            });
        }
    });
}

// Add CSS for highlighting
const style = document.createElement('style');
style.textContent = `
    .research-finder-highlight {
        background-color: #e8f0fe !important;
        border: 2px solid #1a73e8 !important;
        border-radius: 8px !important;
        padding: 8px !important;
        margin: 5px 0 !important;
        transition: all 0.3s ease;
    }
    
    .research-finder-highlight:hover {
        background-color: #d2e3fc !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action);
    
    try {
        switch(request.action) {
            case "getResults":
                const results = extractSearchResults();
                sendResponse({
                    success: true,
                    results: results,
                    count: results.length
                });
                break;
                
            case "highlight":
                highlightResultsOnPage(request.results);
                sendResponse({success: true});
                break;
                
            default:
                sendResponse({success: false, error: "Unknown action"});
        }
    } catch(error) {
        console.error('Error in content script:', error);
        sendResponse({success: false, error: error.message});
    }
    
    return true; // Keep message channel open for async response
});

// Auto-extract when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractSearchResults);
} else {
    setTimeout(extractSearchResults, 1000); // Wait a bit for dynamic content
}

// Also extract when page changes (for SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(extractSearchResults, 500);
    }
}).observe(document, {subtree: true, childList: true});