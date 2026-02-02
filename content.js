chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getLinks") {
    const links = Array.from(document.querySelectorAll("a"))
      .map(link => ({
        text: link.innerText.trim(),
        url: link.href
      }))
      .filter(link => link.text.length > 5);

    sendResponse(links);
  }
});
