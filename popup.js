document.getElementById("filterBtn").addEventListener("click", () => {
  const keyword = document.getElementById("filterInput").value.toLowerCase();

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getLinks" },
      links => {
        const filtered = links.filter(link =>
          link.text.toLowerCase().includes(keyword) ||
          link.url.toLowerCase().includes(keyword)
        );

        displayResults(filtered);
      }
    );
  });
});

function displayResults(links) {
  const list = document.getElementById("results");
  list.innerHTML = "";

  links.slice(0, 10).forEach(link => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = link.url;
    a.textContent = link.text;
    a.target = "_blank";

    li.appendChild(a);
    list.appendChild(li);
  });
}
