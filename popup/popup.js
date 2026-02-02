document.addEventListener('DOMContentLoaded', function() {
    const authorList = document.getElementById('authorList');
    const yearList = document.getElementById('yearList');
    const applyBtn = document.getElementById('applyBtn');
    const resultsList = document.getElementById('resultsList');
    const authorCount = document.getElementById('authorCount');
    const yearCount = document.getElementById('yearCount');
    const totalCount = document.getElementById('totalCount');
    
    let detectedAuthors = new Set();
    let detectedYears = new Set();
    let searchResults = [];
    
    // Get current page results
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getResults"}, function(response) {
            if (response && response.results) {
                searchResults = response.results;
                
                // Extract unique authors and years
                response.results.forEach(result => {
                    if (result.author) {
                        detectedAuthors.add(result.author.trim());
                    }
                    if (result.year) {
                        detectedYears.add(result.year.toString());
                    }
                });
                
                // Populate author checkboxes
                populateCheckboxes(authorList, Array.from(detectedAuthors).sort());
                // Populate year checkboxes (most recent first)
                populateCheckboxes(yearList, Array.from(detectedYears).sort((a,b) => b-a));
                
                updateCounts();
            }
        });
    });
    
    // Populate checkboxes
    function populateCheckboxes(container, items) {
        container.innerHTML = '';
        
        items.forEach(item => {
            if (!item) return;
            
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="checkbox" id="${container.id}-${item}" value="${item}">
                <label for="${container.id}-${item}">${item}</label>
            `;
            container.appendChild(div);
        });
    }
    
    // Update counts
    function updateCounts() {
        const selectedAuthors = getSelectedValues('authorList');
        const selectedYears = getSelectedValues('yearList');
        
        authorCount.textContent = selectedAuthors.length;
        yearCount.textContent = selectedYears.length;
    }
    
    // Get selected checkbox values
    function getSelectedValues(containerId) {
        const checkboxes = document.querySelectorAll(`#${containerId} input:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    // Apply filter
    applyBtn.addEventListener('click', function() {
        const selectedAuthors = getSelectedValues('authorList');
        const selectedYears = getSelectedValues('yearList');
        
        // Filter results
        let filteredResults = searchResults;
        
        if (selectedAuthors.length > 0) {
            filteredResults = filteredResults.filter(result => 
                result.author && selectedAuthors.includes(result.author.trim())
            );
        }
        
        if (selectedYears.length > 0) {
            filteredResults = filteredResults.filter(result => 
                result.year && selectedYears.includes(result.year.toString())
            );
        }
        
        // Display results
        displayResults(filteredResults);
        
        // Update count
        totalCount.textContent = filteredResults.length;
        
        // Send to content script to highlight on page
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "highlightResults",
                results: filteredResults.map(r => r.url)
            });
        });
    });
    
    // Display results
    function displayResults(results) {
        resultsList.innerHTML = '';
        
        if (results.length === 0) {
            resultsList.innerHTML = '<div class="message">No results match your filters</div>';
            return;
        }
        
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <div class="result-title">${result.title || 'No title'}</div>
                <div class="result-url">${result.url}</div>
            `;
            
            div.addEventListener('click', function() {
                chrome.tabs.create({url: result.url, active: false});
            });
            
            resultsList.appendChild(div);
        });
    }
    
    // Update counts when checkboxes change
    authorList.addEventListener('change', updateCounts);
    yearList.addEventListener('change', updateCounts);
});