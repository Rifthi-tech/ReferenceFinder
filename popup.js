let allLinks = [];

window.addEventListener("load", () => {
  console.log("Popup loaded");
  setTimeout(() => {
    loadReferences();
    setupEventListeners();
  }, 100);
});

function loadReferences() {
  console.log("Loading references from page...");
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.error("No active tab");
      document.getElementById("results").innerHTML = "<li>No active tab</li>";
      return;
    }

    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(
      tabId,
      { action: "getLinks" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
          return;
        }

        allLinks = response || [];
        console.log("Found " + allLinks.length + " references with author and year");
        
        if (allLinks.length === 0) {
          document.getElementById("results").innerHTML = "<li>No references found on this page</li>";
          return;
        }

        displayResults(allLinks);
        populateWebsiteFilter();
      }
    );
  });
}

function setupEventListeners() {
  const websiteFilter = document.getElementById("websiteFilter");
  const filterBtn = document.getElementById("filterBtn");

  if (websiteFilter) websiteFilter.addEventListener("change", onWebsiteChange);
  if (filterBtn) filterBtn.addEventListener("click", applyFilters);
}

function populateWebsiteFilter() {
  const websites = [...new Set(allLinks.map(l => l.domain).filter(d => d))].sort();

  const websiteSelect = document.getElementById("websiteFilter");
  
  console.log("Unique websites: " + websites.length);

  websites.forEach(website => {
    const option = document.createElement("option");
    option.value = website;
    option.textContent = website;
    websiteSelect.appendChild(option);
  });
}

function onWebsiteChange() {
  const selectedWebsite = document.getElementById("websiteFilter").value;
  
  console.log("Website changed to: " + selectedWebsite);

  // Filter links by selected website
  const websiteLinks = selectedWebsite === "" ? allLinks : allLinks.filter(l => l.domain === selectedWebsite);

  // Populate author and year dropdowns based on selected website
  populateAuthorFilter(websiteLinks);
  populateYearFilter(websiteLinks);

  // Reset and display all results from selected website
  applyFilters();
}

function populateAuthorFilter(linksToUse) {
  const authorSelect = document.getElementById("authorFilter");
  const currentValue = authorSelect.value;
  
  // Clear existing options except the first one
  while (authorSelect.options.length > 1) {
    authorSelect.remove(1);
  }

  const authors = [...new Set(linksToUse.map(l => l.author).filter(a => a))].sort();

  console.log("Authors in selected website: " + authors.length);

  authors.forEach(author => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    authorSelect.appendChild(option);
  });

  // Restore previous selection if it still exists
  if ([...authorSelect.options].map(o => o.value).includes(currentValue)) {
    authorSelect.value = currentValue;
  } else {
    authorSelect.value = "";
  }
}

function populateYearFilter(linksToUse) {
  const yearSelect = document.getElementById("yearFilter");
  const currentValue = yearSelect.value;
  
  // Clear existing options except the first one
  while (yearSelect.options.length > 1) {
    yearSelect.remove(1);
  }

  const years = [...new Set(linksToUse.map(l => l.year).filter(y => y))].sort((a, b) => b - a);

  console.log("Years in selected website: " + years.length);

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  // Restore previous selection if it still exists
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

  console.log("Filtering - Website: '" + selectedWebsite + "' Author: '" + selectedAuthor + "' Year: '" + selectedYear + "'");

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
    alert("Reference copied to clipboard!");
  }).catch(err => {
    console.error("Copy failed:", err);
  });
}
