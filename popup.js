let allLinks = [];

document.addEventListener("DOMContentLoaded", () => {
  loadReferences();
  setupEventListeners();
});

function loadReferences() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getLinks" },
      links => {
        if (chrome.runtime.lastError) {
          document.getElementById("results").innerHTML = "<li>Unable to load references</li>";
          return;
        }
        allLinks = links || [];
        displayResults(allLinks);
        populateFilters();
      }
    );
  });
}

function setupEventListeners() {
  document.getElementById("filterBtn").addEventListener("click", applyFilters);
  document.getElementById("filterInput").addEventListener("keyup", applyFilters);
  document.getElementById("authorFilter").addEventListener("change", applyFilters);
  document.getElementById("yearFilter").addEventListener("change", applyFilters);
  document.getElementById("siteFilter").addEventListener("change", applyFilters);
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
  const authors = [...new Set(allLinks.map(l => l.author).filter(a => a))];
  const years = [...new Set(allLinks.map(l => l.year).filter(y => y))].sort((a, b) => b - a);
  const sites = [...new Set(allLinks.map(l => l.site))];

  const authorSelect = document.getElementById("authorFilter");
  const yearSelect = document.getElementById("yearFilter");
  const siteSelect = document.getElementById("siteFilter");

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
  });
}
