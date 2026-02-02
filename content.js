console.log("Content script loaded on page:", window.location.href);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  
  if (request.action === "getLinks") {
    try {
      console.log("Getting all links from page...");
      
      const allElements = document.querySelectorAll("a");
      console.log("Total <a> elements found:", allElements.length);
      
      const links = Array.from(allElements)
        .map((link, index) => {
          try {
            const url = link.href || "";
            const text = link.innerText ? link.innerText.trim() : link.textContent.trim();
            
            if (!url || !text) {
              return null;
            }
            
            if (!url.startsWith('http')) {
              return null;
            }
            
            if (text.length < 5) {
              return null;
            }
            
            let domain = "unknown";
            try {
              domain = new URL(url).hostname.replace('www.', '');
            } catch (e) {
              console.log("Could not parse URL:", url);
              return null;
            }
            
            const author = extractAuthor(text);
            const year = extractYear(text);
            
            if (!author || !year) {
              return null;
            }
            
            console.log("Valid link " + index + ":", author, year, domain, text.substring(0, 50));
            
            return {
              text: text,
              url: url,
              domain: domain,
              author: author,
              year: year
            };
          } catch (e) {
            console.error("Error processing link:", e);
            return null;
          }
        })
        .filter(link => link !== null);

      console.log("Final valid links found:", links.length);
      console.log("Sending response with links:", links);
      sendResponse(links);
    } catch (e) {
      console.error("Error in getLinks handler:", e);
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
    // First try to extract from "Author - Year" or "Author (Year)" format
    const parts = text.split(/[|–\-\n]/)[0].trim();
    const authorMatch = parts.match(/^([A-Za-z\s&,\.]+?)(?:\s+\d{4}|,|\s+\(|$)/);
    
    if (authorMatch) {
      const author = authorMatch[1].trim();
      if (author.length > 2 && author.length < 150) {
        return author;
      }
    }
    
    if (parts.length > 2 && parts.length < 150) {
      return parts;
    }
    
    return '';
  } catch (e) {
    return '';
  }
}
