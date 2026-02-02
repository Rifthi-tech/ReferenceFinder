console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  
  if (request.action === "getLinks") {
    try {
      const links = Array.from(document.querySelectorAll("a"))
        .map(link => {
          try {
            const url = link.href;
            const text = link.innerText.trim();
            
            if (!url || !text) return null;
            
            let domain = "";
            try {
              domain = new URL(url).hostname.replace('www.', '');
            } catch (e) {
              domain = url;
            }
            
            return {
              text: text,
              url: url,
              domain: domain,
              author: extractAuthor(text),
              year: extractYear(text),
              site: domain
            };
          } catch (e) {
            console.error("Error mapping link:", e);
            return null;
          }
        })
        .filter(link => link && link.text.length > 5 && link.url.startsWith('http'));

      console.log("Found links:", links.length);
      sendResponse(links);
    } catch (e) {
      console.error("Error in getLinks:", e);
      sendResponse([]);
    }
  }
  return true;
});

function extractYear(text) {
  try {
    const yearMatch = text.match(/(19|20)\d{2}/);
    return yearMatch ? yearMatch[0] : '';
  } catch (e) {
    return '';
  }
}

function extractAuthor(text) {
  try {
    const parts = text.split(/[|\-\–]/)[0].trim();
    return parts.length > 50 ? '' : parts;
  } catch (e) {
    return '';
  }
}
