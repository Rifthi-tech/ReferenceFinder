document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const filterAuthor = document.getElementById('filterAuthor');
    const filterYear = document.getElementById('filterYear');
    const filterSite = document.getElementById('filterSite');
    const filterUrl = document.getElementById('filterUrl');
    const authorInput = document.getElementById('authorInput');
    const yearFrom = document.getElementById('yearFrom');
    const yearTo = document.getElementById('yearTo');
    const siteInput = document.getElementById('siteInput');
    const urlInput = document.getElementById('urlInput');
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const saveBtn = document.getElementById('saveResults');
    const copyBtn = document.getElementById('copyResults');
    const toggleView = document.getElementById('toggleView');
    const loading = document.getElementById('loading');
    
    let currentResults = [];
    let isDetailedView = false;

    // Set current year as default
    const currentYear = new Date().getFullYear();
    yearFrom.placeholder = currentYear - 5;
    yearTo.placeholder = currentYear;
    
    // Initialize checkbox behavior
    setupCheckbox(filterAuthor, authorInput);
    setupCheckbox(filterYear, yearFrom);
    setupCheckbox(filterYear, yearTo);
    setupCheckbox(filterSite, siteInput);
    setupCheckbox(filterUrl, urlInput);
    
    // Get current tab and extract search results
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        // Only show loading if we're on a search engine page
        if (isSearchEngine(currentTab.url)) {
            loading.style.display = 'flex';
            
            // Request content script to extract search results
            chrome.tabs.sendMessage(currentTab.id, {action: "extractResults"}, function(response) {
                loading.style.display = 'none';
                
                if (response && response.success) {
                    currentResults = response.results;
                    updateResultsCount(currentResults.length);
                } else {
                    showMessage("Could not extract results from this page.", "error");
                }
            });
        } else {
            loading.innerHTML = '<span>⚠️ Navigate to a search engine to use this extension</span>';
        }
    });

    // Apply filters button click
    applyBtn.addEventListener('click', function() {
        const filters = getActiveFilters();
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "applyFilters",
                filters: filters
            }, function(response) {
                if (response && response.success) {
                    currentResults = response.results;
                    updateResultsCount(currentResults.length);
                    displayResults(currentResults);
                    
                    // Enable action buttons if we have results
                    saveBtn.disabled = currentResults.length === 0;
                    copyBtn.disabled = currentResults.length === 0;
                }
            });
        });
    });

    // Reset all filters
    resetBtn.addEventListener('click', function() {
        resetAllFilters();
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "resetFilters"
            }, function(response) {
                if (response && response.success) {
                    currentResults = response.results;
                    updateResultsCount(currentResults.length);
                    displayResults([]);
                    
                    saveBtn.disabled = true;
                    copyBtn.disabled = true;
                }
            });
        });
    });

    // Toggle detailed/simple view
    toggleView.addEventListener('click', function() {
        isDetailedView = !isDetailedView;
        toggleView.textContent = isDetailedView ? "Simple View" : "Show Details";
        displayResults(currentResults);
    });

    // Save results
    saveBtn.addEventListener('click', function() {
        if (currentResults.length === 0) return;
        
        const timestamp = new Date().toISOString().split('T')[0];
        const data = {
            date: timestamp,
            filters: getActiveFilters(),
            results: currentResults
        };
        
        chrome.storage.local.get(['savedSearches'], function(result) {
            const savedSearches = result.savedSearches || [];
            savedSearches.push(data);
            
            chrome.storage.local.set({savedSearches: savedSearches}, function() {
                showMessage("Results saved successfully!", "success");
            });
        });
    });

    // Copy as CSV
    copyBtn.addEventListener('click', function() {
        if (currentResults.length === 0) return;
        
        const csv = convertToCSV(currentResults);
        navigator.clipboard.writeText(csv).then(function() {
            showMessage("CSV copied to clipboard!", "success");
        });
    });

    // Helper functions
    function setupCheckbox(checkbox, input) {
        checkbox.addEventListener('change', function() {
            if (checkbox === filterYear) {
                yearFrom.disabled = !this.checked;
                yearTo.disabled = !this.checked;
            } else {
                input.disabled = !this.checked;
            }
        });
    }

    function getActiveFilters() {
        const filters = {};
        
        if (filterAuthor.checked && authorInput.value.trim()) {
            filters.author = authorInput.value.trim().toLowerCase();
        }
        
        if (filterYear.checked) {
            filters.yearFrom = yearFrom.value ? parseInt(yearFrom.value) : null;
            filters.yearTo = yearTo.value ? parseInt(yearTo.value) : null;
        }
        
        if (filterSite.checked && siteInput.value.trim()) {
            filters.site = siteInput.value.trim().toLowerCase();
        }
        
        if (filterUrl.checked && urlInput.value.trim()) {
            filters.urlKeyword = urlInput.value.trim().toLowerCase();
        }
        
        return filters;
    }

    function resetAllFilters() {
        filterAuthor.checked = false;
        filterYear.checked = false;
        filterSite.checked = false;
        filterUrl.checked = false;
        
        authorInput.disabled = true;
        yearFrom.disabled = true;
        yearTo.disabled = true;
        siteInput.disabled = true;
        urlInput.disabled = true;
        
        authorInput.value = '';
        yearFrom.value = '';
        yearTo.value = '';
        siteInput.value = '';
        urlInput.value = '';
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No results match your filters. Try different criteria.</p>
                </div>
            `;
            return;
        }
        
        results.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item';
            resultElement.dataset.index = index;
            
            if (isDetailedView) {
                resultElement.innerHTML = `
                    <div class="result-title">${result.title || 'No title'}</div>
                    <div class="result-url">${result.url}</div>
                    <div class="result-meta">
                        ${result.author ? `<span>👤 ${result.author}</span>` : ''}
                        ${result.year ? `<span>📅 ${result.year}</span>` : ''}
                        <span>🌐 ${extractDomain(result.url)}</span>
                    </div>
                `;
            } else {
                resultElement.innerHTML = `
                    <div class="result-title">${result.title || 'No title'}</div>
                    <div class="result-url">${result.url}</div>
                `;
            }
            
            resultElement.addEventListener('click', function() {
                chrome.tabs.create({url: result.url, active: false});
            });
            
            resultsContainer.appendChild(resultElement);
        });
    }

    function updateResultsCount(count) {
        resultsCount.textContent = count;
    }

    function extractDomain(url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain;
        } catch {
            return url;
        }
    }

    function convertToCSV(results) {
        const headers = ['Title', 'URL', 'Author', 'Year', 'Domain'];
        const rows = results.map(result => [
            `"${(result.title || '').replace(/"/g, '""')}"`,
            `"${result.url}"`,
            `"${result.author || ''}"`,
            `"${result.year || ''}"`,
            `"${extractDomain(result.url)}"`
        ]);
        
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    function showMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    function isSearchEngine(url) {
        const searchEngines = [
            'google.com/search',
            'bing.com/search',
            'duckduckgo.com/',
            'scholar.google.com/'
        ];
        return searchEngines.some(engine => url.includes(engine));
    }
});