let activeTabId = null;
let activeStartTime = null;

chrome.tabs.onActivated.addListener(activeInfo => {
  logTime(activeTabId);
  activeTabId = activeInfo.tabId;
  activeStartTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    activeStartTime = Date.now();
  }
});

chrome.windows.onFocusChanged.addListener(windowId => {
  logTime(activeTabId);
  activeTabId = null;
  activeStartTime = null;
});

function logTime(tabId) {
  if (tabId !== null && activeStartTime !== null) {
    const timeSpent = Math.floor((Date.now() - activeStartTime) / 1000);
    chrome.tabs.get(tabId, tab => {
      if (tab && tab.url.startsWith('http')) {
        const domain = new URL(tab.url).hostname;
        saveTime(domain, timeSpent);
      }
    });
  }
}

function saveTime(domain, seconds) {
  chrome.storage.local.get([domain], result => {
    const previous = result[domain] || 0;
    const updated = previous + seconds;
    chrome.storage.local.set({ [domain]: updated }, () => {
      console.log(`[Time Logged] ${domain}: +${seconds}s (Total: ${updated}s)`);

      // 🚀 Send data to backend
      fetch("http://localhost:5000/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain, seconds })
      })
        .then(res => res.json())
        .then(data => console.log("✅ Sent to backend:", data))
        .catch(err => console.error("❌ Backend error", err));
    });
  });
}

