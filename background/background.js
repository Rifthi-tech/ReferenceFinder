// Background service worker for Research Reference Finder

// Store user preferences and search history
chrome.runtime.onInstalled.addListener(() => {
    console.log('Research Reference Finder installed');
    
    // Initialize storage with default values
    chrome.storage.local.get(['settings', 'savedSearches'], (result) => {
        if (!result.settings) {
            chrome.storage.local.set({
                settings: {
                    autoExtract: true,
                    highlightResults: true,
                    showNotifications: true,
                    defaultFilters: {
                        yearFrom: new Date().getFullYear() - 5,
                        yearTo: new Date().getFullYear()
                    }
                },
                savedSearches: []
            });
        }
    });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_SEARCH') {
        saveSearchToHistory(message.data);
        sendResponse({success: true});
    }
    return true;
});

// Function to save search to history
function saveSearchToHistory(searchData) {
    chrome.storage.local.get(['savedSearches'], (result) => {
        const savedSearches = result.savedSearches || [];
        const newSearch = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            query: searchData.query,
            filters: searchData.filters,
            resultCount: searchData.resultCount,
            results: searchData.results.slice(0, 10) // Save only first 10 results
        };
        
        savedSearches.unshift(newSearch); // Add to beginning
        if (savedSearches.length > 50) {
            savedSearches.pop(); // Keep only last 50 searches
        }
        
        chrome.storage.local.set({savedSearches});
    });
}

// Context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "findReferences",
        title: "Find References with Research Finder",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "findReferences") {
        // Open the extension popup
        chrome.action.openPopup();
        
        // Send the selected text to the popup
        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
                action: "setSearchQuery",
                query: info.selectionText
            });
        }, 500);
    }
});