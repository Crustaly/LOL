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
  quests: [],  // Generated quests based on rank
  matches: []  // Match history with champ/role data
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
  
  // Initialize match data (mock for now)
  initializeMatchData();
  
  return Promise.resolve(); // Return resolved promise for consistency with future API calls
}

// Initialize match data with champ/role information
// TODO: Replace with API call when backend is ready
function initializeMatchData() {
  // TODO: Replace with API call: fetch('/api/matches').then(data => leagueData.matches = data)
  leagueData.matches = [
    {
      matchId: 'match_1',
      date: '2024-01-15',
      champion: 'Jhin',
      role: 'Bot',
      win: true,
      kda: '12/4/8',
      score: 93,  // Final score
      scoreHistory: [85, 90, 92, 88, 93],
      position: 3,  // Out of 10 players
      playerRoster: [
        { player: 'Summoner1', champion: 'Yasuo', role: 'Top', score: 98, position: 1, isYou: false, kills: 18, deaths: 3, assists: 5, csPerMin: 9.2, goldEarned: 12450, damageTaken: 15200, items: ['Mythic', 'Boots', 'Blade', 'Defense'] },
        { player: 'Summoner2', champion: 'Lee Sin', role: 'Jungle', score: 95, position: 2, isYou: false, kills: 15, deaths: 4, assists: 12, csPerMin: 6.8, goldEarned: 11980, damageTaken: 18100, items: ['Mythic', 'Boots', 'Damage', 'Tank'] },
        { player: 'You', champion: 'Jhin', role: 'Bot', score: 93, position: 3, isYou: true, kills: 12, deaths: 4, assists: 8, csPerMin: 8.5, goldEarned: 12350, damageTaken: 8900, items: ['Mythic', 'Boots', 'Crit1', 'Crit2'] },
        { player: 'Summoner4', champion: 'Zed', role: 'Mid', score: 89, position: 4, isYou: false, kills: 14, deaths: 7, assists: 3, csPerMin: 8.9, goldEarned: 11800, damageTaken: 12300, items: ['Mythic', 'Boots', 'Lethality', 'Damage'] },
        { player: 'Summoner5', champion: 'Thresh', role: 'Support', score: 87, position: 5, isYou: false, kills: 2, deaths: 5, assists: 18, csPerMin: 1.2, goldEarned: 8100, damageTaken: 22300, items: ['Support', 'Boots', 'Tank1', 'Tank2'] },
        { player: 'Summoner6', champion: 'Darius', role: 'Top', score: 82, position: 6, isYou: false, kills: 8, deaths: 6, assists: 4, csPerMin: 7.8, goldEarned: 10200, damageTaken: 19800, items: ['Mythic', 'Boots', 'Damage', 'Tank'] },
        { player: 'Summoner7', champion: 'Jhin', role: 'Bot', score: 78, position: 7, isYou: false, kills: 9, deaths: 9, assists: 2, csPerMin: 7.2, goldEarned: 9600, damageTaken: 9100, items: ['Mythic', 'Boots', 'Crit1', 'Mobility'] },
        { player: 'Summoner8', champion: 'Lux', role: 'Mid', score: 75, position: 8, isYou: false, kills: 6, deaths: 11, assists: 6, csPerMin: 7.1, goldEarned: 9200, damageTaken: 11200, items: ['Mythic', 'Boots', 'AP', 'Utility'] },
        { player: 'Summoner9', champion: 'Nautilus', role: 'Support', score: 72, position: 9, isYou: false, kills: 1, deaths: 12, assists: 9, csPerMin: 0.9, goldEarned: 6800, damageTaken: 25100, items: ['Support', 'Boots', 'Tank', 'Resist'] },
        { player: 'Summoner10', champion: 'Master Yi', role: 'Jungle', score: 68, position: 10, isYou: false, kills: 7, deaths: 13, assists: 1, csPerMin: 5.4, goldEarned: 8450, damageTaken: 16900, items: ['Mythic', 'Boots', 'AS', 'Damage'] }
      ]
    },
    {
      matchId: 'match_2',
      date: '2024-01-14',
      champion: 'Ashe',
      role: 'Support',
      win: true,
      kda: '4/2/14',
      score: 82,
      scoreHistory: [78, 82, 80, 85, 82],
      position: 5,
      playerRoster: [
        { player: 'Summoner1', champion: 'Katarina', role: 'Mid', score: 96, position: 1, isYou: false, kills: 22, deaths: 2, assists: 8, csPerMin: 8.5, goldEarned: 13800, damageTaken: 7200, items: ['Mythic', 'Boots', 'AP', 'Pen'] },
        { player: 'Summoner2', champion: 'Vayne', role: 'Bot', score: 94, position: 2, isYou: false, kills: 19, deaths: 3, assists: 6, csPerMin: 9.8, goldEarned: 13100, damageTaken: 9800, items: ['Mythic', 'Boots', 'AS', 'Crit'] },
        { player: 'Summoner3', champion: 'Garen', role: 'Top', score: 88, position: 3, isYou: false, kills: 14, deaths: 4, assists: 9, csPerMin: 9.1, goldEarned: 11600, damageTaken: 21800, items: ['Mythic', 'Boots', 'Tank', 'Health'] },
        { player: 'Summoner4', champion: 'Graves', role: 'Jungle', score: 84, position: 4, isYou: false, kills: 13, deaths: 5, assists: 11, csPerMin: 7.3, goldEarned: 11300, damageTaken: 14200, items: ['Mythic', 'Boots', 'AD', 'Tank'] },
        { player: 'You', champion: 'Ashe', role: 'Support', score: 82, position: 5, isYou: true, kills: 4, deaths: 2, assists: 14, csPerMin: 2.1, goldEarned: 7900, damageTaken: 19500, items: ['Support', 'Boots', 'Tank1', 'Tank2'] },
        { player: 'Summoner6', champion: 'Yasuo', role: 'Mid', score: 79, position: 6, isYou: false, kills: 10, deaths: 8, assists: 7, csPerMin: 8.1, goldEarned: 10700, damageTaken: 13800, items: ['Mythic', 'Boots', 'Crit', 'LS'] },
        { player: 'Summoner7', champion: 'Blitzcrank', role: 'Support', score: 76, position: 7, isYou: false, kills: 3, deaths: 9, assists: 12, csPerMin: 1.5, goldEarned: 7400, damageTaken: 24100, items: ['Support', 'Boots', 'Tank', 'Resist'] },
        { player: 'Summoner8', champion: 'Jinx', role: 'Bot', score: 73, position: 8, isYou: false, kills: 8, deaths: 10, assists: 3, csPerMin: 6.9, goldEarned: 9400, damageTaken: 10400, items: ['Mythic', 'Boots', 'AS', 'Crit'] },
        { player: 'Summoner9', champion: 'Renekton', role: 'Top', score: 70, position: 9, isYou: false, kills: 7, deaths: 11, assists: 5, csPerMin: 6.3, goldEarned: 8600, damageTaken: 18900, items: ['Mythic', 'Boots', 'Damage', 'Health'] },
        { player: 'Summoner10', champion: 'Shaco', role: 'Jungle', score: 65, position: 10, isYou: false, kills: 6, deaths: 14, assists: 4, csPerMin: 4.8, goldEarned: 7200, damageTaken: 12200, items: ['Mythic', 'Boots', 'AP', 'CDR'] }
      ]
    },
    {
      matchId: 'match_3',
      date: '2024-01-13',
      champion: 'Vayne',
      role: 'Bot',
      win: false,
      kda: '8/7/3',
      score: 71,
      scoreHistory: [72, 70, 68, 73, 71],
      position: 8,
      playerRoster: [
        { player: 'Summoner1', champion: 'Draven', role: 'Bot', score: 96, position: 1, isYou: false, kills: 20, deaths: 1, assists: 7, csPerMin: 10.1, goldEarned: 14500, damageTaken: 5600, items: ['Mythic', 'Boots', 'Crit1', 'Crit2'] },
        { player: 'Summoner2', champion: 'Aurelion Sol', role: 'Mid', score: 93, position: 2, isYou: false, kills: 17, deaths: 2, assists: 10, csPerMin: 9.4, goldEarned: 13200, damageTaken: 8400, items: ['Mythic', 'Boots', 'AP', 'CDR'] },
        { player: 'Summoner3', champion: 'Sett', role: 'Top', score: 91, position: 3, isYou: false, kills: 16, deaths: 3, assists: 8, csPerMin: 8.8, goldEarned: 12900, damageTaken: 19300, items: ['Mythic', 'Boots', 'AD', 'Tank'] },
        { player: 'Summoner4', champion: 'Leona', role: 'Support', score: 89, position: 4, isYou: false, kills: 3, deaths: 3, assists: 17, csPerMin: 1.8, goldEarned: 8900, damageTaken: 20900, items: ['Support', 'Boots', 'Tank1', 'Tank2'] },
        { player: 'Summoner5', champion: 'Kayn', role: 'Jungle', score: 84, position: 5, isYou: false, kills: 12, deaths: 6, assists: 9, csPerMin: 7.7, goldEarned: 11200, damageTaken: 15100, items: ['Mythic', 'Boots', 'Lethal', 'AD'] },
        { player: 'Summoner6', champion: 'Jhin', role: 'Bot', score: 80, position: 6, isYou: false, kills: 11, deaths: 8, assists: 5, csPerMin: 8.3, goldEarned: 10900, damageTaken: 9600, items: ['Mythic', 'Boots', 'Crit', 'AD'] },
        { player: 'Summoner7', champion: 'Fiora', role: 'Top', score: 76, position: 7, isYou: false, kills: 9, deaths: 9, assists: 4, csPerMin: 8.0, goldEarned: 9900, damageTaken: 17700, items: ['Mythic', 'Boots', 'Damage', 'LS'] },
        { player: 'You', champion: 'Vayne', role: 'Bot', score: 71, position: 8, isYou: true, kills: 8, deaths: 7, assists: 3, csPerMin: 6.7, goldEarned: 8900, damageTaken: 9100, items: ['Mythic', 'Boots', 'AS', 'Crit'] },
        { player: 'Summoner9', champion: 'Nidalee', role: 'Jungle', score: 69, position: 9, isYou: false, kills: 6, deaths: 12, assists: 7, csPerMin: 5.9, goldEarned: 8100, damageTaken: 14800, items: ['Mythic', 'Boots', 'AP', 'Pen'] },
        { player: 'Summoner10', champion: 'Soraka', role: 'Support', score: 64, position: 10, isYou: false, kills: 0, deaths: 15, assists: 11, csPerMin: 1.0, goldEarned: 6100, damageTaken: 22900, items: ['Support', 'Boots', 'Heal', 'Resist'] }
      ]
    },
    {
      matchId: 'match_4',
      date: '2024-01-12',
      champion: 'Caitlyn',
      role: 'Top',
      win: true,
      kda: '10/2/5',
      score: 92,
      scoreHistory: [88, 91, 89, 94, 92],
      position: 2,
      playerRoster: [
        { player: 'Summoner1', champion: 'Gangplank', role: 'Top', score: 98, position: 1, isYou: false, kills: 21, deaths: 1, assists: 6, csPerMin: 9.5, goldEarned: 14100, damageTaken: 11200, items: ['Mythic', 'Boots', 'Crit', 'CDR'] },
        { player: 'You', champion: 'Caitlyn', role: 'Top', score: 92, position: 2, isYou: true, kills: 10, deaths: 2, assists: 5, csPerMin: 8.2, goldEarned: 12200, damageTaken: 7800, items: ['Mythic', 'Boots', 'Crit1', 'Crit2'] },
        { player: 'Summoner3', champion: 'Kha\'Zix', role: 'Jungle', score: 89, position: 3, isYou: false, kills: 16, deaths: 4, assists: 10, csPerMin: 7.1, goldEarned: 12100, damageTaken: 13200, items: ['Mythic', 'Boots', 'Lethal', 'Pen'] },
        { player: 'Summoner4', champion: 'Syndra', role: 'Mid', score: 86, position: 4, isYou: false, kills: 15, deaths: 5, assists: 8, csPerMin: 8.6, goldEarned: 11800, damageTaken: 10700, items: ['Mythic', 'Boots', 'AP', 'Pen'] },
        { player: 'Summoner5', champion: 'Lucian', role: 'Bot', score: 83, position: 5, isYou: false, kills: 14, deaths: 6, assists: 7, csPerMin: 8.7, goldEarned: 11400, damageTaken: 10300, items: ['Mythic', 'Boots', 'AD', 'Crit'] },
        { player: 'Summoner6', champion: 'Braum', role: 'Support', score: 79, position: 6, isYou: false, kills: 2, deaths: 7, assists: 15, csPerMin: 1.4, goldEarned: 8300, damageTaken: 22400, items: ['Support', 'Boots', 'Tank1', 'Tank2'] },
        { player: 'Summoner7', champion: 'Akali', role: 'Mid', score: 76, position: 7, isYou: false, kills: 10, deaths: 10, assists: 6, csPerMin: 7.8, goldEarned: 10000, damageTaken: 12100, items: ['Mythic', 'Boots', 'AP', 'Pen'] },
        { player: 'Summoner8', champion: 'Tristana', role: 'Bot', score: 74, position: 8, isYou: false, kills: 9, deaths: 11, assists: 4, csPerMin: 6.8, goldEarned: 9100, damageTaken: 10900, items: ['Mythic', 'Boots', 'AS', 'Crit'] },
        { player: 'Summoner9', champion: 'Janna', role: 'Support', score: 70, position: 9, isYou: false, kills: 1, deaths: 13, assists: 12, csPerMin: 0.8, goldEarned: 6700, damageTaken: 23800, items: ['Support', 'Boots', 'Heal', 'Shield'] },
        { player: 'Summoner10', champion: 'Jax', role: 'Jungle', score: 68, position: 10, isYou: false, kills: 7, deaths: 15, assists: 5, csPerMin: 5.6, goldEarned: 7800, damageTaken: 16400, items: ['Mythic', 'Boots', 'AS', 'Tank'] }
      ]
    },
    {
      matchId: 'match_5',
      date: '2024-01-11',
      champion: 'Ezreal',
      role: 'Mid',
      win: true,
      kda: '9/3/11',
      score: 84,
      scoreHistory: [82, 85, 88, 86, 84],
      position: 4,
      playerRoster: [
        { player: 'Summoner1', champion: 'Riven', role: 'Top', score: 94, position: 1, isYou: false, kills: 19, deaths: 2, assists: 8, csPerMin: 9.0, goldEarned: 13500, damageTaken: 14000, items: ['Mythic', 'Boots', 'Damage', 'LS'] },
        { player: 'Summoner2', champion: 'Tristana', role: 'Bot', score: 91, position: 2, isYou: false, kills: 17, deaths: 3, assists: 9, csPerMin: 9.6, goldEarned: 13200, damageTaken: 9200, items: ['Mythic', 'Boots', 'Crit1', 'Crit2'] },
        { player: 'Summoner3', champion: 'Rengar', role: 'Jungle', score: 87, position: 3, isYou: false, kills: 15, deaths: 4, assists: 11, csPerMin: 7.5, goldEarned: 12500, damageTaken: 14900, items: ['Mythic', 'Boots', 'Lethal', 'Pen'] },
        { player: 'You', champion: 'Ezreal', role: 'Mid', score: 84, position: 4, isYou: true, kills: 9, deaths: 3, assists: 11, csPerMin: 8.9, goldEarned: 11900, damageTaken: 9800, items: ['Mythic', 'Boots', 'Manamune', 'Pen'] },
        { player: 'Summoner5', champion: 'Alistar', role: 'Support', score: 81, position: 5, isYou: false, kills: 3, deaths: 6, assists: 16, csPerMin: 1.6, goldEarned: 8800, damageTaken: 23100, items: ['Support', 'Boots', 'Tank1', 'Tank2'] },
        { player: 'Summoner6', champion: 'Cassiopeia', role: 'Mid', score: 78, position: 6, isYou: false, kills: 12, deaths: 7, assists: 7, csPerMin: 8.4, goldEarned: 10500, damageTaken: 11800, items: ['Mythic', 'Boots', 'AP', 'Pen'] },
        { player: 'Summoner7', champion: 'Varus', role: 'Bot', score: 75, position: 7, isYou: false, kills: 10, deaths: 9, assists: 5, csPerMin: 7.9, goldEarned: 9700, damageTaken: 10100, items: ['Mythic', 'Boots', 'AD', 'Crit'] },
        { player: 'Summoner8', champion: 'Malphite', role: 'Top', score: 72, position: 8, isYou: false, kills: 6, deaths: 10, assists: 8, csPerMin: 6.5, goldEarned: 8200, damageTaken: 20100, items: ['Tank', 'Boots', 'HP', 'Resist'] },
        { player: 'Summoner9', champion: 'Morgana', role: 'Support', score: 69, position: 9, isYou: false, kills: 2, deaths: 12, assists: 10, csPerMin: 1.3, goldEarned: 7000, damageTaken: 24900, items: ['Support', 'Boots', 'AP', 'Utility'] },
        { player: 'Summoner10', champion: 'Xin Zhao', role: 'Jungle', score: 65, position: 10, isYou: false, kills: 5, deaths: 13, assists: 6, csPerMin: 5.1, goldEarned: 7300, damageTaken: 17400, items: ['Mythic', 'Boots', 'AD', 'Tank'] }
      ]
    }
  ];
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

// Function to display champ/role overview with matches
function displayChampRoleOverview() {
  if (!leagueData.matches || leagueData.matches.length === 0) {
    $('#dynamicContent').html('<p>No match data available. Please check API connection.</p>');
    return;
  }
  
  let html = '<div class="match-overview-container">';
  html += '<h2>Match History by Champion & Role</h2>';
  html += '<div class="match-list">';
  
  leagueData.matches.forEach((match, index) => {
    const winClass = match.win ? 'victory' : 'defeat';
    const winText = match.win ? 'Victory' : 'Defeat';
    
    html += `<div class="match-card ${winClass}" data-match-id="${match.matchId}">`;
    html += '<div class="match-card-header">';
    html += `<div class="match-result ${winClass}">${winText}</div>`;
    html += `<div class="match-info">`;
    html += `<div class="match-date">${match.date}</div>`;
    html += `<div class="match-champion">${match.champion}</div>`;
    html += `<div class="match-role">${match.role}</div>`;
    html += `</div>`;
    html += `<div class="match-kda">${match.kda}</div>`;
    html += `<div class="match-position">#${match.position}/10</div>`;
    html += `<div class="expand-icon">▼</div>`;
    html += '</div>';
    html += '</div>'; // match-card-header
    
    // Expanded content (hidden by default)
    html += `<div class="match-expanded" id="expanded-${match.matchId}" style="display: none;">`;
    html += '<div class="match-detailed-stats">';
    
    // Score graph placeholder
    html += '<div class="score-graph-container">';
    html += '<h4>Score Over Time</h4>';
    html += `<canvas id="scoreChart-${index}" width="400" height="150"></canvas>`;
    html += '</div>';
    
    // Match Leaderboard
    html += '<div class="match-leaderboard">';
    html += '<h4>Match Leaderboard</h4>';
    html += '<div class="leaderboard-list">';
    
    match.playerRoster.forEach((player, idx) => {
      const rowClass = player.isYou ? 'leaderboard-row you' : 'leaderboard-row expandable-player';
      const playerId = player.player.replace(/\s+/g, '_') + '_' + idx;
      
      // Main row
      html += `<div class="${rowClass}" data-player-id="${playerId}" data-player-index="${idx}">`;
      html += `<div class="leaderboard-position">#${player.position}</div>`;
      html += `<div class="leaderboard-player">${player.player}</div>`;
      html += `<div class="leaderboard-champion">${player.champion}</div>`;
      html += `<div class="leaderboard-role">${player.role}</div>`;
      html += `<div class="leaderboard-score">${player.score}</div>`;
      html += `<div class="leaderboard-stats-icon">📊</div>`;
      html += '</div>';
      
      // Expanded details (hidden by default)
      html += `<div class="player-details ${playerId}" style="display: none;">`;
      html += '<div class="player-stats-grid">';
      html += `<div class="stat-box"><span class="stat-label">Kills:</span><span class="stat-value">${player.kills}</span></div>`;
      html += `<div class="stat-box"><span class="stat-label">Deaths:</span><span class="stat-value">${player.deaths}</span></div>`;
      html += `<div class="stat-box"><span class="stat-label">Assists:</span><span class="stat-value">${player.assists}</span></div>`;
      html += `<div class="stat-box"><span class="stat-label">KDA:</span><span class="stat-value">${((player.kills + player.assists) / player.deaths).toFixed(2)}</span></div>`;
      html += `<div class="stat-box"><span class="stat-label">CS/min:</span><span class="stat-value">${player.csPerMin}</span></div>`;
      html += `<div class="stat-box"><span class="stat-label">Gold:</span><span class="stat-value">${player.goldEarned.toLocaleString()}</span></div>`;
      html += `<div class="stat-box"><span class="stat-label">DMG Taken:</span><span class="stat-value">${player.damageTaken.toLocaleString()}</span></div>`;
      html += `<div class="stat-box items-box"><span class="stat-label">Items:</span><span class="stat-value">${player.items.join(', ')}</span></div>`;
      html += '</div>';
      html += '</div>'; // player-details
    });
    
    html += '</div></div>'; // leaderboard-list and match-leaderboard
    
    html += '</div>'; // match-detailed-stats
    html += '</div>'; // match-expanded
    html += '</div>'; // match-card
  });
  
  html += '</div>'; // match-list
  html += '</div>'; // match-overview-container
  
  $('#dynamicContent').html(html);
  
  // Setup click handlers for expanding/collapsing
  $('.match-card-header').off('click').on('click', function() {
    const matchId = $(this).parent().data('match-id');
    const expanded = $(`#expanded-${matchId}`);
    const icon = $(this).find('.expand-icon');
    
    if (expanded.is(':visible')) {
      expanded.slideUp();
      icon.text('▼');
    } else {
      expanded.slideDown();
      icon.text('▲');
      
      // Create score graph if not already created
      const canvas = expanded.find('canvas')[0];
      if (canvas) {
        const match = leagueData.matches.find(m => m.matchId === matchId);
        createScoreChart(canvas, match.scoreHistory);
      }
    }
  });
  
  // Setup click handlers for player details
  $('.leaderboard-row.expandable-player').off('click').on('click', function() {
    const playerId = $(this).data('player-id');
    const details = $(`.player-details.${playerId}`);
    
    // Close all other details
    $('.player-details').not(`.${playerId}`).slideUp();
    
    if (details.is(':visible')) {
      details.slideUp();
    } else {
      details.slideDown();
    }
  });
  
  // You row is always expanded
  $('.leaderboard-row.you').off('click').on('click', function() {
    const playerId = $(this).data('player-id');
    const details = $(`.player-details.${playerId}`);
    
    if (details.is(':visible')) {
      details.slideUp();
    } else {
      details.slideDown();
    }
  });
}

// Create a small line chart for score over time
function createScoreChart(canvas, scoreData) {
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (canvas.chartInstance) {
    canvas.chartInstance.destroy();
  }
  
  canvas.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: scoreData.map((_, i) => `T${i + 1}`),
      datasets: [{
        label: 'Score',
        data: scoreData,
        borderColor: '#C9AA71',
        backgroundColor: 'rgba(201, 170, 113, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#CDBE91'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#CDBE91'
          }
        }
      }
    }
  });
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

  // Handle different tabs
  if (tabId === 1) {
    // Overview tab
    fetchLeagueData().then(() => {
      displayOverview();
    });
  } else if (tabId === 3) {
    // Champ/Role Overview tab
    fetchLeagueData().then(() => {
      displayChampRoleOverview();
    });
  } else if (tabId === 5) {
    // Quests tab
    fetchLeagueData().then(() => {
      displayQuests();
    });
  } else {
    // Other tabs (Score, Champions)
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


