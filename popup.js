let allLinks = [];

window.addEventListener("load", () => {
  console.log("Popup loaded");
  setTimeout(() => {
    loadReferences();
    setupEventListeners();
  }, 100);
});

function loadReferences() {
  console.log("Loading references...");
  
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
        console.log("Found " + allLinks.length + " links");
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
  const author = document.getElementById("authorFilter").value;
  const year = document.getElementById("yearFilter").value;

  console.log("Filtering - Author:", author, "Year:", year);

  let filtered = allLinks.filter(link => {
    const matchAuthor = author === "" || link.author === author;
    const matchYear = year === "" || link.year === year;
    return matchAuthor && matchYear;
  });

  console.log("Filtered to " + filtered.length + " results");
  displayResults(filtered);
}

function populateFilters() {
  const authors = [...new Set(allLinks.map(l => l.author).filter(a => a))].sort();
  const years = [...new Set(allLinks.map(l => l.year).filter(y => y))].sort((a, b) => b - a);

  const authorSelect = document.getElementById("authorFilter");
  const yearSelect = document.getElementById("yearFilter");

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
    if (link.author) meta.innerHTML += `<span class="tag">Author: ${link.author}</span>`;
    if (link.year) meta.innerHTML += `<span class="tag">Year: ${link.year}</span>`;

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
