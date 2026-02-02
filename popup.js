let allLinks = [];

window.addEventListener("load", () => {
  console.log("===== POPUP LOADED =====");
  setTimeout(() => {
    loadReferences();
    setupEventListeners();
  }, 200);
});

function loadReferences() {
  console.log("Starting loadReferences...");
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Tabs query returned:", tabs);
    
    if (!tabs || tabs.length === 0) {
      console.error("NO ACTIVE TAB FOUND");
      document.getElementById("results").innerHTML = "<li style='color:red;'>Error: No active tab</li>";
      return;
    }

    const tabId = tabs[0].id;
    const tabUrl = tabs[0].url;
    console.log("Active tab ID:", tabId, "URL:", tabUrl);
    
    console.log("Sending message to content script...");
    
    chrome.tabs.sendMessage(
      tabId,
      { action: "getLinks" },
      (response) => {
        console.log("Response received from content script:", response);
        
        if (chrome.runtime.lastError) {
          console.error("MESSAGE ERROR:", chrome.runtime.lastError.message);
          const resultsDiv = document.getElementById("results");
          if (resultsDiv) {
            resultsDiv.innerHTML = "<li style='color:red;'>Error: " + chrome.runtime.lastError.message + "</li>";
          }
          return;
        }

        allLinks = response || [];
        console.log("Total links received:", allLinks.length);
        
        if (allLinks.length === 0) {
          document.getElementById("results").innerHTML = "<li>No references found. Try searching for academic papers or articles.</li>";
          return;
        }

        console.log("Sample links:", allLinks.slice(0, 3));
        
        displayResults(allLinks);
        populateWebsiteFilter();
      }
    );
  });
}

function setupEventListeners() {
  console.log("Setting up event listeners...");
  
  const websiteFilter = document.getElementById("websiteFilter");
  const filterBtn = document.getElementById("filterBtn");

  if (websiteFilter) {
    websiteFilter.addEventListener("change", onWebsiteChange);
    console.log("Website filter listener added");
  } else {
    console.error("websiteFilter element not found!");
  }
  
  if (filterBtn) {
    filterBtn.addEventListener("click", applyFilters);
    console.log("Filter button listener added");
  } else {
    console.error("filterBtn element not found!");
  }
}

function populateWebsiteFilter() {
  const websites = [...new Set(allLinks.map(l => l.domain).filter(d => d))].sort();

  const websiteSelect = document.getElementById("websiteFilter");
  
  console.log("Populating website filter with " + websites.length + " unique websites");
  console.log("Websites:", websites);

  websites.forEach(website => {
    const option = document.createElement("option");
    option.value = website;
    option.textContent = website;
    websiteSelect.appendChild(option);
  });
}

function onWebsiteChange() {
  const selectedWebsite = document.getElementById("websiteFilter").value;
  
  console.log("Website selection changed to: '" + selectedWebsite + "'");

  const websiteLinks = selectedWebsite === "" ? allLinks : allLinks.filter(l => l.domain === selectedWebsite);

  console.log("Links for selected website:", websiteLinks.length);

  populateAuthorFilter(websiteLinks);
  populateYearFilter(websiteLinks);

  applyFilters();
}

function populateAuthorFilter(linksToUse) {
  const authorSelect = document.getElementById("authorFilter");
  const currentValue = authorSelect.value;
  
  while (authorSelect.options.length > 1) {
    authorSelect.remove(1);
  }

  const authors = [...new Set(linksToUse.map(l => l.author).filter(a => a))].sort();

  console.log("Authors: " + authors.length, authors.slice(0, 5));

  authors.forEach(author => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    authorSelect.appendChild(option);
  });

  if ([...authorSelect.options].map(o => o.value).includes(currentValue)) {
    authorSelect.value = currentValue;
  } else {
    authorSelect.value = "";
  }
}

function populateYearFilter(linksToUse) {
  const yearSelect = document.getElementById("yearFilter");
  const currentValue = yearSelect.value;
  
  while (yearSelect.options.length > 1) {
    yearSelect.remove(1);
  }

  const years = [...new Set(linksToUse.map(l => l.year).filter(y => y))].sort((a, b) => b - a);

  console.log("Years: " + years.length, years);

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  if ([...yearSelect.options].map(o => o.value).includes(currentValue)) {
    yearSelect.value = currentValue;
  } else {
    yearSelect.value = "";
  }
}

function applyFilters() {
  const selectedWebsite = document.getElementById("websiteFilter").value;
  const selectedAuthor = document.getElementById("authorFilter").value;
  const selectedYear = document.getElementById("yearFilter").value;

  console.log("Applying filters - Website: '" + selectedWebsite + "' Author: '" + selectedAuthor + "' Year: '" + selectedYear + "'");

  let filtered = allLinks.filter(link => {
    const websiteMatch = selectedWebsite === "" || link.domain === selectedWebsite;
    const authorMatch = selectedAuthor === "" || link.author === selectedAuthor;
    const yearMatch = selectedYear === "" || link.year === selectedYear;
    
    return websiteMatch && authorMatch && yearMatch;
  });

  console.log("Filtered results: " + filtered.length);
  displayResults(filtered);
}

function displayResults(links) {
  const list = document.getElementById("results");
  if (!list) {
    console.error("Results list element not found!");
    return;
  }
  
  list.innerHTML = "";

  if (links.length === 0) {
    list.innerHTML = "<li class='no-results'>No matching references found</li>";
    return;
  }

  links.forEach(link => {
    const li = document.createElement("li");
    const div = document.createElement("div");
    div.className = "reference-item";
    
    const titleDiv = document.createElement("div");
    titleDiv.className = "ref-title";
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.text;
    a.target = "_blank";
    a.className = "ref-link";
    titleDiv.appendChild(a);

    const metaDiv = document.createElement("div");
    metaDiv.className = "ref-meta";
    
    const authorSpan = document.createElement("span");
    authorSpan.className = "tag author-tag";
    authorSpan.textContent = link.author;
    metaDiv.appendChild(authorSpan);
    
    const yearSpan = document.createElement("span");
    yearSpan.className = "tag year-tag";
    yearSpan.textContent = link.year;
    metaDiv.appendChild(yearSpan);

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.className = "copy-btn";
    copyBtn.addEventListener("click", () => copyToClipboard(link));

    div.appendChild(titleDiv);
    div.appendChild(metaDiv);
    div.appendChild(copyBtn);
    li.appendChild(div);
    list.appendChild(li);
  });
}

function copyToClipboard(link) {
  const text = link.author + " (" + link.year + ")\n" + link.text + "\n" + link.url;
  navigator.clipboard.writeText(text).then(() => {
    alert("Reference copied!");
  }).catch(err => {
    console.error("Copy failed:", err);
  });
}
