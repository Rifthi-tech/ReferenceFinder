chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getLinks") {
    const links = Array.from(document.querySelectorAll("a"))
      .map(link => {
        const url = link.href;
        const text = link.innerText.trim();
        const domain = new URL(url).hostname.replace('www.', '');
        
        return {
          text: text,
          url: url,
          domain: domain,
          author: extractAuthor(text),
          year: extractYear(text),
          site: domain
        };
      })
      .filter(link => link.text.length > 5 && link.url.startsWith('http'));

    sendResponse(links);
  }
});

function extractYear(text) {
  const yearMatch = text.match(/(19|20)\d{2}/);
  return yearMatch ? yearMatch[0] : '';
}

function extractAuthor(text) {
  const parts = text.split(/[|\-\–]/)[0].trim();
  return parts.length > 50 ? '' : parts;
}
