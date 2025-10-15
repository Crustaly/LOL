// Chart.js initialization
const ctx = document.getElementById('lineChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sample Data',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  }
});

// Utility function: fetch weather for Troy, NY (latitude, longitude)
function fetchTroyWeather() {
  // Coordinates for Troy, NY (approx)
  const latitude = 42.7284;
  const longitude = -73.6918;

  // Build the Open-Meteo API URL shold lwk wrk with any api.
  // im finna request current + hourly temperature and wind speed for the next day.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
              `&hourly=temperature_2m,wind_speed_10m&current_weather=true`;

  // returns api response
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Weather API returned status ${response.status}`);
      }
      return response.json();
    });
}

// Handler for tab clicks
$('.tab').on('click', function() {
  $('.tab').removeClass('active');
  $(this).addClass('active');
  const tabId = $(this).data('tab');

  // Special handling - this is jsut to show how to call API and process results
  if (tabId === 9) {
    // fetch weather and show inside dynamic content
    $('#dynamicContent').html('Loading weather data...');

    fetchTroyWeather()
      .then(data => {
        // console.log("Weather API data:", data);
        let html = `<h3>Weather for Troy, NY</h3>`;

        if (data.current_weather) {
          html += `<p><strong>Current Temperature:</strong> ${data.current_weather.temperature_2m} °C</p>`;
          html += `<p><strong>Wind Speed:</strong> ${data.current_weather.wind_speed_10m} m/s</p>`;
        }

        if (data.hourly) {
          html += `<h4>Hourly Forecast (next few hours)</h4>`;
          html += `<table border="1" cellpadding="4" cellspacing="0">
                    <thead><tr><th>Time</th><th>Temp (°C)</th><th>Wind (m/s)</th></tr></thead>
                    <tbody>`;
          // show, say, first 6 hours
          const times = data.hourly.time;
          const temps = data.hourly.temperature_2m;
          const winds = data.hourly.wind_speed_10m;
          const count = Math.min(times.length, 6);
          for (let i = 0; i < count; i++) {
            html += `<tr>
                      <td>${times[i]}</td>
                      <td>${temps[i]}</td>
                      <td>${winds[i]}</td>
                     </tr>`;
          }
          html += `</tbody></table>`;
        }

        $('#dynamicContent').html(html);
      })
      .catch(err => {
        console.error('Error fetching weather:', err);
        $('#dynamicContent').html(`<p>Error fetching weather data: ${err.message}</p>`);
      });

  } else {
    // do something else
    $('#dynamicContent').html('<b> Information on Tab ' + tabId + ' ... </b>');
  }
});

// On document ready, load default tab content (Tab 1)
$(document).ready(function() {
  console.log("On Load");
  $('#dynamicContent').html('<b> Information Tab 1 ... </b>');
});


