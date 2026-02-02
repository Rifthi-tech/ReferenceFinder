let allLinks = [];

window.addEventListener("load", () => {
  console.log("Popup loaded, starting to load references...");
  setTimeout(() => {
    loadReferences();
    setupEventListeners();
  }, 100);
});

function loadReferences() {
  console.log("loadReferences called");
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Tabs query result:", tabs);
    
    if (!tabs || tabs.length === 0) {
      console.error("No active tab found");
      document.getElementById("results").innerHTML = "<li>No active tab</li>";
      return;
    }

    const tabId = tabs[0].id;
    console.log("Sending message to tab:", tabId);

    chrome.tabs.sendMessage(
      tabId,
      { action: "getLinks" },
      (response) => {
        console.log("Response from content script:", response);
        
        if (chrome.runtime.lastError) {
          console.error("Chrome error:", chrome.runtime.lastError);
          document.getElementById("results").innerHTML = "<li>Error: " + chrome.runtime.lastError.message + "</li>";
          return;
        }

        allLinks = response || [];
        console.log("Links received:", allLinks.length);
        
        displayResults(allLinks);
        populateFilters();
      }
    );
  });
}

function setupEventListeners() {
  console.log("Setting up event listeners");
  
  const filterBtn = document.getElementById("filterBtn");
  const filterInput = document.getElementById("filterInput");
  const authorFilter = document.getElementById("authorFilter");
  const yearFilter = document.getElementById("yearFilter");
  const siteFilter = document.getElementById("siteFilter");

  if (filterBtn) filterBtn.addEventListener("click", applyFilters);
  if (filterInput) filterInput.addEventListener("keyup", applyFilters);
  if (authorFilter) authorFilter.addEventListener("change", applyFilters);
  if (yearFilter) yearFilter.addEventListener("change", applyFilters);
  if (siteFilter) siteFilter.addEventListener("change", applyFilters);
}

function applyFilters() {
  const keyword = document.getElementById("filterInput").value.toLowerCase();
  const author = document.getElementById("authorFilter").value;
  const year = document.getElementById("yearFilter").value;
  const site = document.getElementById("siteFilter").value;

  let filtered = allLinks.filter(link => {
    const matchKeyword = keyword === "" || 
      link.text.toLowerCase().includes(keyword) ||
      link.url.toLowerCase().includes(keyword);
    
    const matchAuthor = author === "" || link.author === author;
    const matchYear = year === "" || link.year === year;
    const matchSite = site === "" || link.site === site;

    return matchKeyword && matchAuthor && matchYear && matchSite;
  });

  displayResults(filtered);
}

function populateFilters() {
  console.log("Populating filters with", allLinks.length, "links");
  
  const authors = [...new Set(allLinks.map(l => l.author).filter(a => a))];
  const years = [...new Set(allLinks.map(l => l.year).filter(y => y))].sort((a, b) => b - a);
  const sites = [...new Set(allLinks.map(l => l.site))];

  const authorSelect = document.getElementById("authorFilter");
  const yearSelect = document.getElementById("yearFilter");
  const siteSelect = document.getElementById("siteFilter");

  if (!authorSelect || !yearSelect || !siteSelect) {
    console.error("Filter elements not found");
    return;
  }

  authors.forEach(author => {
    if (![...authorSelect.options].map(o => o.value).includes(author)) {
      const option = document.createElement("option");
      option.value = author;
      option.textContent = author;
      authorSelect.appendChild(option);
    }
  });

  years.forEach(year => {
    if (![...yearSelect.options].map(o => o.value).includes(year)) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  });

  sites.forEach(site => {
    if (![...siteSelect.options].map(o => o.value).includes(site)) {
      const option = document.createElement("option");
      option.value = site;
      option.textContent = site;
      siteSelect.appendChild(option);
    }
  });
}

function displayResults(links) {
  console.log("Displaying", links.length, "results");
  
  const list = document.getElementById("results");
  if (!list) {
    console.error("Results list not found");
    return;
  }
  
  list.innerHTML = "";

  if (links.length === 0) {
    list.innerHTML = "<li>No references found</li>";
    return;
  }

  links.slice(0, 50).forEach(link => {
    const li = document.createElement("li");
    const div = document.createElement("div");
    div.className = "reference-item";
    
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.text;
    a.target = "_blank";
    a.className = "ref-link";

    const meta = document.createElement("div");
    meta.className = "ref-meta";
    if (link.author) meta.innerHTML += `<span>Author: ${link.author}</span>`;
    if (link.year) meta.innerHTML += `<span>Year: ${link.year}</span>`;
    if (link.site) meta.innerHTML += `<span>Site: ${link.site}</span>`;

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.className = "copy-btn";
    copyBtn.addEventListener("click", () => copyToClipboard(link));

    div.appendChild(a);
    if (meta.innerHTML) div.appendChild(meta);
    div.appendChild(copyBtn);
    li.appendChild(div);
    list.appendChild(li);
  });
}

function copyToClipboard(link) {
  const text = `${link.text}\n${link.url}`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Reference copied!");
  }).catch(err => {
    console.error("Copy failed:", err);
  });
}
