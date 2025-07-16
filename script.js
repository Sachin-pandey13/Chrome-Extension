const productiveSites = ['leetcode.com', 'github.com', 'stackoverflow.com'];
const filterSelect = document.getElementById("filter");
const logList = document.getElementById("log-list");
const summaryDiv = document.getElementById("summary");

let allLogs = [];

filterSelect.addEventListener("change", render);

function fetchLogs() {
  fetch("http://localhost:5000/api/logs")
    .then(res => res.json())
    .then(data => {
      allLogs = data;
      render();
    })
    .catch(err => console.error("Error loading logs", err));
}

function render() {
  const filter = filterSelect.value;
  const now = new Date();
  const todayLogs = allLogs.filter(log => {
    const logDate = new Date(log.date);
    return (
      logDate.getDate() === now.getDate() &&
      logDate.getMonth() === now.getMonth() &&
      logDate.getFullYear() === now.getFullYear()
    );
  });

  const logsToUse = filter === "today" ? todayLogs : allLogs;

  const usageMap = {};
  let productiveTime = 0;
  let unproductiveTime = 0;

  logsToUse.forEach(log => {
    const domain = log.domain;
    const seconds = log.seconds;

    usageMap[domain] = (usageMap[domain] || 0) + seconds;

    if (productiveSites.includes(domain)) {
      productiveTime += seconds;
    } else {
      unproductiveTime += seconds;
    }
  });

  logList.innerHTML = "";
  let i = 0;
  Object.entries(usageMap).forEach(([domain, seconds]) => {
    const li = document.createElement("li");
    const minutes = (seconds / 60).toFixed(1);
    li.textContent = `${domain} - ${minutes} min (${seconds} sec)`;
    li.style.animationDelay = `${i * 0.1}s`;
    logList.appendChild(li);
    i++;
  });

  const totalTime = productiveTime + unproductiveTime;
  const productivePercent = totalTime ? ((productiveTime / totalTime) * 100).toFixed(1) : 0;
  const unproductivePercent = totalTime ? ((unproductiveTime / totalTime) * 100).toFixed(1) : 0;

  summaryDiv.innerHTML = `
    <h3>Productivity Summary</h3>
    <p>✅ Productive Time: ${productivePercent}%</p>
    <p>❌ Unproductive Time: ${unproductivePercent}%</p>
  `;

  renderChart(usageMap);
}

let chart;
function renderChart(dataMap) {
  const ctx = document.getElementById('usageChart').getContext('2d');
  const labels = Object.keys(dataMap);
  const data = Object.values(dataMap).map(seconds => (seconds / 60).toFixed(2));

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Time Spent (minutes)',
        data: data,
        backgroundColor: 'rgba(78, 121, 167, 0.8)',
        borderRadius: 6,
        barThickness: 28, // Make bars thinner
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Time Spent Per Domain',
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        tooltip: {
          backgroundColor: '#333',
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#333',
            font: { weight: '600' }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#333',
            callback: value => `${value} min`
          },
          title: {
            display: true,
            text: 'Minutes',
            color: '#333'
          }
        }
      }
    }
  });
}


fetchLogs();
