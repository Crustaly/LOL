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

// Data objects for League data (mutable, ready for API integration)
let leagueData = {
  currentRank: null,  // Will hold current rank from API
  pastSeasonRanks: [],
  mostPlayedChampions: [],
  quests: []  // Generated quests based on rank
};

// Placeholder function for future League API integration
// This will fetch data from League API endpoints when implemented
function fetchLeagueData() {
  // TODO: Replace with actual League API calls when backend is ready
  // Example structure for future implementation:
  // return Promise.all([
  //   fetch('/api/player/seasons'),
  //   fetch('/api/player/most-played')
  // ]).then(responses => Promise.all(responses.map(r => r.json())))
  //   .then(([seasons, champions]) => {
  //     leagueData.pastSeasonRanks = seasons;
  //     leagueData.mostPlayedChampions = champions;
  //   });
  
  // For now, initialize with mock data
  return initializeMockData();
}

// Initialize with mock data (frontend-only for now)
function initializeMockData() {
  // Mock current rank - will come from API
  leagueData.currentRank = { tier: 'Diamond', division: 'III', lp: 67 };
  
  leagueData.pastSeasonRanks = [
    { season: 'Season 14', rank: 'Diamond II' },
    { season: 'Season 13', rank: 'Platinum I' },
    { season: 'Season 12', rank: 'Gold III' },
    { season: 'Season 11', rank: 'Gold IV' }
  ];

  leagueData.mostPlayedChampions = [
    { name: 'Jhin', games: 156, winRate: '58%' },
    { name: 'Ashe', games: 134, winRate: '54%' },
    { name: 'Caitlyn', games: 98, winRate: '61%' },
    { name: 'Ezreal', games: 87, winRate: '52%' },
    { name: 'Vayne', games: 72, winRate: '56%' }
  ];
  
  // Generate quests based on current rank
  generateQuests();
  
  return Promise.resolve(); // Return resolved promise for consistency with future API calls
}

// Function to generate quests based on current rank
// TODO: In future implementation, this will use data from League API
// to generate personalized quests based on player's actual performance
function generateQuests() {
  if (!leagueData.currentRank) {
    leagueData.quests = [];
    return;
  }
  
  const tier = leagueData.currentRank.tier;
  const division = leagueData.currentRank.division;
  const lp = leagueData.currentRank.lp;
  
  let quests = [];
  
  // Rank-specific quests based on tier
  switch(tier) {
    case 'Iron':
    case 'Bronze':
      quests.push({
        title: 'Foundation Builder',
        description: 'Win 10 ranked games to build a strong foundation',
        progress: '0/10',
        difficulty: 'Easy'
      });
      quests.push({
        title: 'Consistency Master',
        description: 'Play 5 ranked games in a week without tilting',
        progress: '0/5',
        difficulty: 'Medium'
      });
      break;
      
    case 'Silver':
    case 'Gold':
      quests.push({
        title: 'Gold Tier Climb',
        description: 'Reach 100 LP in your current division',
        progress: `${lp}/100`,
        difficulty: 'Medium'
      });
      quests.push({
        title: 'Win Streak',
        description: 'Achieve a 3-game win streak in ranked',
        progress: '0/3',
        difficulty: 'Hard'
      });
      break;
      
    case 'Platinum':
      quests.push({
        title: 'Plat Dominance',
        description: 'Win 15 ranked games while maintaining 55%+ win rate',
        progress: '0/15',
        difficulty: 'Hard'
      });
      quests.push({
        title: 'Division Climb',
        description: 'Promote to the next division',
        progress: 'In Progress',
        difficulty: 'Very Hard'
      });
      break;
      
    case 'Diamond':
    case 'Master':
      quests.push({
        title: 'Diamond Mastery',
        description: 'Maintain Diamond rank for 20 games',
        progress: '0/20',
        difficulty: 'Very Hard'
      });
      quests.push({
        title: 'LP Collector',
        description: 'Gain 200 LP in ranked matches',
        progress: 'In Progress',
        difficulty: 'Extreme'
      });
      break;
      
    default:
      quests.push({
        title: 'Elite Challenge',
        description: 'Win 5 ranked games while maintaining top-tier performance',
        progress: '0/5',
        difficulty: 'Extreme'
      });
  }
  
  // Universal quests for all ranks
  quests.push({
    title: 'Daily Grind',
    description: 'Complete 3 ranked games today',
    progress: '0/3',
    difficulty: 'Easy'
  });
  
  leagueData.quests = quests;
}

// Function to display quests
function displayQuests() {
  if (!leagueData.currentRank) {
    $('#dynamicContent').html('<p>No rank data available. Please check API connection.</p>');
    return;
  }
  
  let html = '<div class="quest-container">';
  html += `<h2>Your Current Rank: ${leagueData.currentRank.tier} ${leagueData.currentRank.division}</h2>`;
  html += `<p class="rank-lp">LP: ${leagueData.currentRank.lp}</p>`;
  
  html += '<h3>Active Quests</h3>';
  html += '<div class="quest-list">';
  
  if (leagueData.quests.length === 0) {
    html += '<p>No quests available at the moment.</p>';
  } else {
    leagueData.quests.forEach((quest, index) => {
      html += `<div class="quest-card">`;
      html += `<h4>${quest.title}</h4>`;
      html += `<p>${quest.description}</p>`;
      html += `<div class="quest-info">`;
      html += `<span class="quest-progress">Progress: ${quest.progress}</span>`;
      html += `<span class="quest-difficulty difficulty-${quest.difficulty.toLowerCase().replace(' ', '-')}">${quest.difficulty}</span>`;
      html += `</div>`;
      html += `</div>`;
    });
  }
  
  html += '</div></div>';
  $('#dynamicContent').html(html);
}

// Function to display overview information
function displayOverview() {
  let html = '<div class="overview-container">';
  
  // Past Season Ranks Section
  html += '<div class="overview-section"><h3>Past Season Ranks</h3>';
  html += '<table border="1" cellpadding="8" cellspacing="0">';
  html += '<thead><tr><th>Season</th><th>Rank</th></tr></thead>';
  html += '<tbody>';
  leagueData.pastSeasonRanks.forEach(s => {
    html += `<tr><td>${s.season}</td><td>${s.rank}</td></tr>`;
  });
  html += '</tbody></table></div>';
  
  // Most Played Champions Section
  html += '<div class="overview-section"><h3>Most Played Champions</h3>';
  html += '<table border="1" cellpadding="8" cellspacing="0">';
  html += '<thead><tr><th>Champion</th><th>Games</th><th>Win Rate</th></tr></thead>';
  html += '<tbody>';
  leagueData.mostPlayedChampions.forEach(champ => {
    html += `<tr><td>${champ.name}</td><td>${champ.games}</td><td>${champ.winRate}</td></tr>`;
  });
  html += '</tbody></table></div>';
  
  html += '</div>';
  $('#dynamicContent').html(html);
}

// Handler for tab clicks
$('.tab').on('click', function() {
  $('.tab').removeClass('active');
  $(this).addClass('active');
  const tabId = $(this).data('tab');

  // Quests tab - display rank-based quests
  if (tabId === 9) {
    // Refresh data to ensure quests are up to date
    fetchLeagueData().then(() => {
      displayQuests();
    });

  } else if (tabId === 1) {
    // Overview tab - refresh League data and show past season ranks and most played champions
    fetchLeagueData().then(() => {
      displayOverview();
    });
  } else {
    // do something else
    $('#dynamicContent').html('<b> Information on Tab ' + tabId + ' ... </b>');
  }
});

// On document ready, initialize League data and load default tab content
$(document).ready(function() {
  console.log("On Load");
  // Initialize League data (mock for now, ready for API integration)
  fetchLeagueData().then(() => {
    displayOverview();
  });
});


