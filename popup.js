chrome.storage.local.get(null, data => {
  const list = document.getElementById('usage-list');
  list.innerHTML = "";

  const entries = Object.entries(data);
  if (entries.length === 0) {
    list.innerHTML = "<li>No data tracked yet.</li>";
    return;
  }

  for (const [domain, seconds] of entries) {
    const li = document.createElement('li');
    const minutes = (seconds / 60).toFixed(1); // shows decimals like "0.7 min"
    li.textContent = `${domain} - ${minutes} min (${seconds} sec)`;
    list.appendChild(li);
  }
});
