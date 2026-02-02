document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('content');
    const authorList = document.getElementById('authorList');
    const yearList = document.getElementById('yearList');
    const applyBtn = document.getElementById('applyBtn');
    const resultsList = document.getElementById('resultsList');
    const authorCount = document.getElementById('authorCount');
    const yearCount = document.getElementById('yearCount');
    const resultCount = document.getElementById('resultCount');
    
    let allResults = [];
    let detectedAuthors = [];
    let detectedYears = [];
    
    // Check current tab and get results
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const url = currentTab.url;
        
        // Check if it's a search engine page
        if (url.includes('google.com/search') || 
            url.includes('scholar.google.com') || 
            url.includes('bing.com/search')) {
            
            // Try to get results from content script
            chrome.tabs.sendMessage(currentTab.id, {action: "getResults"}, function(response) {
                if (chrome.runtime.lastError) {
                    // Content script not loaded or error
                    showError();
                    return;
                }
                
                if (response && response.success && response.results.length > 0) {
                    allResults = response.results;
                    processResults();
                } else {
                    showError();
                }
            });
        } else {
            showError();
        }
    });
    
    function processResults() {
        // Extract unique authors and years
        const authorsSet = new Set();
        const yearsSet = new Set();
        
        allResults.forEach(result => {
            if (result.author && result.author.trim()) {
                authorsSet.add(result.author.trim());
            }
            if (result.year && result.year.toString().trim()) {
                yearsSet.add(result.year.toString().trim());
            }
        });
        
        detectedAuthors = Array.from(authorsSet).sort();
        detectedYears = Array.from(yearsSet).sort((a, b) => b - a); // Most recent first
        
        // Populate checkboxes
        populateCheckboxes(authorList, detectedAuthors, 'author');
        populateCheckboxes(yearList, detectedYears, 'year');
        
        // Update counts
        updateCounts();
        
        // Show content
        loading.style.display = 'none';
        content.style.display = 'block';
        applyBtn.disabled = false;
    }
    
    function populateCheckboxes(container, items, type) {
        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = `<div style="color:#666; font-style:italic; text-align:center; padding:10px;">
                No ${type}s detected
            </div>`;
            return;
        }
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="checkbox" id="${type}-${item}" value="${item}">
                <label for="${type}-${item}">${item}</label>
            `;
            container.appendChild(div);
        });
    }
    
    function updateCounts() {
        const selectedAuthors = getSelectedValues('author');
        const selectedYears = getSelectedValues('year');
        
        authorCount.textContent = selectedAuthors.length;
        yearCount.textContent = selectedYears.length;
    }
    
    function getSelectedValues(type) {
        const checkboxes = document.querySelectorAll(`input[id^="${type}-"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    function showError() {
        loading.style.display = 'none';
        error.style.display = 'block';
    }
    
    // Apply filter button
    applyBtn.addEventListener('click', function() {
        const selectedAuthors = getSelectedValues('author');
        const selectedYears = getSelectedValues('year');
        
        // Filter results
        let filteredResults = allResults.filter(result => {
            if (selectedAuthors.length > 0 && !selectedAuthors.includes(result.author)) {
                return false;
            }
            if (selectedYears.length > 0 && !selectedYears.includes(result.year?.toString())) {
                return false;
            }
            return true;
        });
        
        // Display results
        displayResults(filteredResults);
        
        // Highlight on page
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "highlight",
                results: filteredResults
            });
        });
    });
    
    function displayResults(results) {
        resultsList.innerHTML = '';
        resultCount.textContent = results.length;
        
        if (results.length === 0) {
            resultsList.innerHTML = '<div class="no-results">No matching results found</div>';
            return;
        }
        
        // Show top 10 results
        const displayResults = results.slice(0, 10);
        
        displayResults.forEach(result => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.title = "Click to open website";
            
            const meta = [];
            if (result.author) meta.push(`👤 ${result.author}`);
            if (result.year) meta.push(`📅 ${result.year}`);
            if (result.domain) meta.push(`🌐 ${result.domain}`);
            
            div.innerHTML = `
                <div class="result-title">${result.title || 'No title'}</div>
                <div class="result-meta">${meta.join(' • ')}</div>
            `;
            
            div.addEventListener('click', function() {
                if (result.url && result.url.startsWith('http')) {
                    chrome.tabs.create({url: result.url, active: false});
                }
            });
            
            resultsList.appendChild(div);
        });
        
        // Show "more results" message if needed
        if (results.length > 10) {
            const moreDiv = document.createElement('div');
            moreDiv.style.textAlign = 'center';
            moreDiv.style.padding = '10px';
            moreDiv.style.color = '#666';
            moreDiv.style.fontSize = '12px';
            moreDiv.textContent = `... and ${results.length - 10} more results`;
            resultsList.appendChild(moreDiv);
        }
    }
    
    // Update counts when checkboxes change
    authorList.addEventListener('change', updateCounts);
    yearList.addEventListener('change', updateCounts);
});