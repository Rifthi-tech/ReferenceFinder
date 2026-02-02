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
            if (!url.startsWith('http')) return null;
            if (text.length < 5) return null;
            
            let domain = "";
            try {
              domain = new URL(url).hostname.replace('www.', '');
            } catch (e) {
              return null;
            }
            
            return {
              text: text,
              url: url,
              domain: domain,
              author: extractAuthor(text),
              year: extractYear(text)
            };
          } catch (e) {
            return null;
          }
        })
        .filter(link => link !== null && link.author && link.year);

      console.log("Found " + links.length + " valid references");
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
    const parts = text.split(/[|–\-\n]/)[0].trim();
    const authorMatch = parts.match(/^([A-Za-z\s&,]+?)(?:\s+\d{4}|,|\s+\()/);
    
    if (authorMatch) {
      const author = authorMatch[1].trim();
      if (author.length > 3 && author.length < 100) {
        return author;
      }
    }
    
    if (parts.length > 3 && parts.length < 100) {
      return parts;
    }
    
    return '';
  } catch (e) {
    return '';
  }
}
