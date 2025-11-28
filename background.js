// Background script for handling keyboard shortcuts

chrome.commands.onCommand.addListener((command) => {
  if (command === "stop-scraper") {
    // Send message to active tab to stop scraper
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "stop-scraper" });
      }
    });
  }
});
