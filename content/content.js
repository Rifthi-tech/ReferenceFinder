// Content script for extracting and filtering search results

class SearchResultExtractor {
    constructor() {
        this.results = [];
        this.originalResults = [];
        this.isGoogle = window.location.hostname.includes('google');
        this.isGoogleScholar = window.location.hostname.includes('scholar.google');
        this.isBing = window.location.hostname.includes('bing.com');
        this.initialize();
    }

    initialize() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'extractResults':
                    this.extractAllResults();
                    sendResponse({success: true, results: this.results});
                    break;
                    
                case 'applyFilters':
                    this.applyFilters(request.filters);
                    this.highlightResults();
                    sendResponse({success: true, results: this.results});
                    break;
                    
                case 'resetFilters':
                    this.resetFilters();
                    sendResponse({success: true, results: this.results});
                    break;
            }
            return true;
        });
    }

    extractAllResults() {
        this.results = [];
        this.originalResults = [];
        
        if (this.isGoogle || this.isGoogleScholar) {
            this.extractGoogleResults();
        } else if (this.isBing) {
            this.extractBingResults();
        } else {
            this.extractGenericResults();
        }
        
        this.originalResults = [...this.results];
    }

    extractGoogleResults() {
        // Select all search result containers
        const resultSelectors = [
            'div.g', // Regular Google results
            'div[data-hveid]', // Some Google results
            'div.gs_r.gs_or.gs_scl', // Google Scholar results
            'div.gs_ri' // Google Scholar result items
        ];
        
        let resultElements = [];
        resultSelectors.forEach(selector => {
            resultElements = resultElements.concat(Array.from(document.querySelectorAll(selector)));
        });
        
        // Remove duplicates by checking if element already exists
        resultElements = [...new Set(resultElements)];
        
        resultElements.forEach((element, index) => {
            const result = this.parseGoogleResult(element, index);
            if (result && result.url) {
                this.results.push(result);
            }
        });
    }

    parseGoogleResult(element, index) {
        const result = {
            id: index,
            title: '',
            url: '',
            author: '',
            year: '',
            domain: ''
        };
        
        // Try to get title
        const titleElement = element.querySelector('h3, .gs_rt a, a[data-ved]');
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            
            // Get URL from title link
            if (titleElement.tagName === 'A') {
                result.url = titleElement.href;
            }
        }
        
        // Alternative URL extraction
        if (!result.url) {
            const link = element.querySelector('a[href*="http"]');
            if (link) {
                result.url = link.href;
            }
        }
        
        // Extract domain from URL
        if (result.url) {
            try {
                const urlObj = new URL(result.url);
                result.domain = urlObj.hostname.replace('www.', '');
            } catch (e) {
                result.domain = '';
            }
        }
        
        // Try to extract author and year (common in academic papers)
        const textContent = element.textContent;
        
        // Look for author patterns
        const authorMatch = textContent.match(/by\s+([^\.]+?)(?:\.|,|\d|$)/i);
        if (authorMatch) {
            result.author = authorMatch[1].trim();
        }
        
        // Look for year patterns (4-digit years)
        const yearMatch = textContent.match(/(?:19|20)\d{2}/);
        if (yearMatch) {
            result.year = yearMatch[0];
        }
        
        // For Google Scholar, check specific elements
        if (this.isGoogleScholar) {
            const authorsElement = element.querySelector('.gs_a');
            if (authorsElement) {
                const authorText = authorsElement.textContent;
                const authorYearMatch = authorText.match(/([^-]+)-([^,]+),.*?(\d{4})/);
                if (authorYearMatch) {
                    result.author = authorYearMatch[1].trim();
                    result.year = authorYearMatch[3];
                }
            }
        }
        
        return result;
    }

    extractBingResults() {
        const resultElements = document.querySelectorAll('li.b_algo');
        
        resultElements.forEach((element, index) => {
            const result = {
                id: index,
                title: '',
                url: '',
                author: '',
                year: '',
                domain: ''
            };
            
            // Bing specific extraction
            const titleElement = element.querySelector('h2 a');
            if (titleElement) {
                result.title = titleElement.textContent.trim();
                result.url = titleElement.href;
            }
            
            if (result.url) {
                try {
                    const urlObj = new URL(result.url);
                    result.domain = urlObj.hostname.replace('www.', '');
                } catch (e) {
                    result.domain = '';
                }
            }
            
            // Try to extract metadata from snippet
            const snippet = element.querySelector('.b_caption p');
            if (snippet) {
                const snippetText = snippet.textContent;
                
                // Look for author
                const authorMatch = snippetText.match(/(?:by|author[s]?)\s+([^\.]+?)(?:\.|,|\d|$)/i);
                if (authorMatch) {
                    result.author = authorMatch[1].trim();
                }
                
                // Look for year
                const yearMatch = snippetText.match(/(?:19|20)\d{2}/);
                if (yearMatch) {
                    result.year = yearMatch[0];
                }
            }
            
            this.results.push(result);
        });
    }

    extractGenericResults() {
        // Fallback for other search engines
        const links = document.querySelectorAll('a[href*="http"]');
        const seenUrls = new Set();
        
        links.forEach((link, index) => {
            const url = link.href;
            
            // Skip common navigation links and duplicates
            if (seenUrls.has(url) || 
                url.includes('google.com') || 
                url.includes('bing.com') ||
                !url.startsWith('http')) {
                return;
            }
            
            seenUrls.add(url);
            
            const result = {
                id: index,
                title: link.textContent.trim() || link.title || 'No title',
                url: url,
                author: '',
                year: '',
                domain: ''
            };
            
            try {
                const urlObj = new URL(url);
                result.domain = urlObj.hostname.replace('www.', '');
            } catch (e) {
                result.domain = '';
            }
            
            this.results.push(result);
        });
    }

    applyFilters(filters) {
        // Reset to original results
        this.results = [...this.originalResults];
        
        if (!filters || Object.keys(filters).length === 0) {
            return;
        }
        
        // Apply each filter
        this.results = this.results.filter(result => {
            let passes = true;
            
            // Author filter
            if (filters.author && result.author) {
                passes = passes && result.author.toLowerCase().includes(filters.author);
            }
            
            // Year filter
            if (filters.yearFrom || filters.yearTo) {
                if (result.year) {
                    const year = parseInt(result.year);
                    if (filters.yearFrom && year < filters.yearFrom) passes = false;
                    if (filters.yearTo && year > filters.yearTo) passes = false;
                } else {
                    passes = false; // No year information available
                }
            }
            
            // Site/Domain filter
            if (filters.site && result.domain) {
                passes = passes && result.domain.toLowerCase().includes(filters.site);
            }
            
            // URL keyword filter
            if (filters.urlKeyword && result.url) {
                passes = passes && result.url.toLowerCase().includes(filters.urlKeyword);
            }
            
            return passes;
        });
    }

    resetFilters() {
        this.results = [...this.originalResults];
        this.removeHighlighting();
    }

    highlightResults() {
        this.removeHighlighting();
        
        // Create highlighted results container if it doesn't exist
        let highlightContainer = document.getElementById('rrf-highlight-container');
        if (!highlightContainer) {
            highlightContainer = document.createElement('div');
            highlightContainer.id = 'rrf-highlight-container';
            highlightContainer.className = 'rrf-highlight-container';
            document.body.appendChild(highlightContainer);
        }
        
        // Show filtered results count
        const filteredCount = this.results.length;
        const totalCount = this.originalResults.length;
        
        const countBadge = document.createElement('div');
        countBadge.className = 'rrf-count-badge';
        countBadge.textContent = `📊 Showing ${filteredCount} of ${totalCount} results`;
        highlightContainer.appendChild(countBadge);
        
        // Add each filtered result to highlight container
        this.results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'rrf-result-card';
            resultCard.dataset.url = result.url;
            
            resultCard.innerHTML = `
                <div class="rrf-result-title">${result.title || 'No title'}</div>
                <div class="rrf-result-url">${result.url}</div>
                <div class="rrf-result-meta">
                    ${result.author ? `<span class="rrf-author">👤 ${result.author}</span>` : ''}
                    ${result.year ? `<span class="rrf-year">📅 ${result.year}</span>` : ''}
                    ${result.domain ? `<span class="rrf-domain">🌐 ${result.domain}</span>` : ''}
                </div>
                <button class="rrf-visit-btn">Visit →</button>
            `;
            
            // Add click handler for visit button
            resultCard.querySelector('.rrf-visit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(result.url, '_blank');
            });
            
            highlightContainer.appendChild(resultCard);
        });
    }

    removeHighlighting() {
        const container = document.getElementById('rrf-highlight-container');
        if (container) {
            container.remove();
        }
    }
}

// Initialize the extractor when page loads
let extractor;

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        extractor = new SearchResultExtractor();
    });
} else {
    extractor = new SearchResultExtractor();
}