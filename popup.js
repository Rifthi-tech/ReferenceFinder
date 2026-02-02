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
        populateFilters();
      }
    );
  });
}

function setupEventListeners() {
  const filterBtn = document.getElementById("filterBtn");
  const authorFilter = document.getElementById("authorFilter");
  const yearFilter = document.getElementById("yearFilter");

  if (filterBtn) filterBtn.addEventListener("click", applyFilters);
  if (authorFilter) authorFilter.addEventListener("change", applyFilters);
  if (yearFilter) yearFilter.addEventListener("change", applyFilters);
}

function applyFilters() {
  const selectedAuthor = document.getElementById("authorFilter").value;
  const selectedYear = document.getElementById("yearFilter").value;

  console.log("Filtering - Author: '" + selectedAuthor + "' Year: '" + selectedYear + "'");

  let filtered = allLinks.filter(link => {
    const authorMatch = selectedAuthor === "" || link.author === selectedAuthor;
    const yearMatch = selectedYear === "" || link.year === selectedYear;
    
    console.log("Link: " + link.author + " (" + link.year + ") - Author match: " + authorMatch + " Year match: " + yearMatch);
    
    return authorMatch && yearMatch;
  });

  console.log("Filtered results: " + filtered.length);
  displayResults(filtered);
}

function populateFilters() {
  const authors = [...new Set(allLinks.map(l => l.author).filter(a => a))].sort();
  const years = [...new Set(allLinks.map(l => l.year).filter(y => y))].sort((a, b) => b - a);

  const authorSelect = document.getElementById("authorFilter");
  const yearSelect = document.getElementById("yearFilter");

  console.log("Unique authors: " + authors.length);
  console.log("Unique years: " + years.length);

  authors.forEach(author => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    authorSelect.appendChild(option);
  });

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
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
    authorSpan.textContent = "Author: " + link.author;
    metaDiv.appendChild(authorSpan);
    
    const yearSpan = document.createElement("span");
    yearSpan.className = "tag year-tag";
    yearSpan.textContent = "Year: " + link.year;
    metaDiv.appendChild(yearSpan);
    
    const domainSpan = document.createElement("span");
    domainSpan.className = "tag domain-tag";
    domainSpan.textContent = "Website: " + link.domain;
    metaDiv.appendChild(domainSpan);

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy Link";
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
