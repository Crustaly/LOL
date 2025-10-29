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
  matches: [],  // Match history with champ/role data
  playerLevel: {
    level: 1,  // Current player level
    totalXP: 0,  // Total XP earned
    xpForNextLevel: 100  // XP needed to reach next level
  }
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
  
  // Initialize player level with some base XP
  leagueData.playerLevel = {
    level: 1,
    totalXP: 45,  // Starting with 45 XP (45% to level 2)
    xpForNextLevel: 100,
    xpIntoCurrentLevel: 45,
    xpNeededToLevel: 55
  };
  
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
      opScore: 87.5,  // OP Score (calculated by backend)
      scoreHistory: [85, 90, 92, 88, 93],
      position: 3,  // Out of 10 players
      pros: [
        'Strong late game scaling with 4th shot',
        'Excellent positioning throughout teamfights',
        'Good map awareness and objective control',
        'Consistent CS and gold income'
      ],
      cons: [
        'Missed several skill shots early game',
        'Could have avoided a few unnecessary deaths',
        'Vision control needs improvement'
      ],
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
      opScore: 76.3,
      scoreHistory: [78, 82, 80, 85, 82],
      position: 5,
      pros: [
        'Excellent support positioning',
        'Successfully peeled for ADC multiple times',
        'Good use of ultimate in teamfights'
      ],
      cons: [
        'Could have improved warding coverage',
        'Missed a few easy Q pulls',
        'Need better roam timings'
      ],
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
      opScore: 62.8,
      scoreHistory: [72, 70, 68, 73, 71],
      position: 8,
      pros: [
        'Decent farming throughout the game',
        'Good use of tumble for outplays'
      ],
      cons: [
        'Poor positioning in teamfights',
        'Too aggressive early game',
        'Failed to capitalize on lead',
        'Needed better itemization'
      ],
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
      opScore: 84.2,
      scoreHistory: [88, 91, 89, 94, 92],
      position: 2,
      pros: [
        'Dominant early game presence',
        'Excellent wave management',
        'Strong split-push pressure',
        'Great objective control'
      ],
      cons: [
        'Could have rotated faster to teamfights',
        'Missed one crucial trap placement'
      ],
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
      opScore: 79.5,
      scoreHistory: [82, 85, 88, 86, 84],
      position: 4,
      pros: [
        'Good roaming and map pressure',
        'Strong ultimate usage',
        'Well-timed teleports',
        'Consistent CS'
      ],
      cons: [
        'Could improve trading in lane',
        'Missed a few Q skill shots',
        'Need better vision placement'
      ],
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
    },
    // Additional matches for score history (matches 6-20)
    { matchId: 'match_6', date: '2024-01-10', champion: 'Jinx', role: 'Bot', win: false, kda: '7/8/4', opScore: 61.5 },
    { matchId: 'match_7', date: '2024-01-09', champion: 'Yasuo', role: 'Mid', win: true, kda: '15/5/7', opScore: 82.3 },
    { matchId: 'match_8', date: '2024-01-08', champion: 'Thresh', role: 'Support', win: true, kda: '2/3/18', opScore: 74.8 },
    { matchId: 'match_9', date: '2024-01-07', champion: 'Vi', role: 'Jungle', win: false, kda: '6/11/9', opScore: 58.2 },
    { matchId: 'match_10', date: '2024-01-06', champion: 'Corki', role: 'Mid', win: true, kda: '11/4/10', opScore: 81.6 },
    { matchId: 'match_11', date: '2024-01-05', champion: 'Braum', role: 'Support', win: true, kda: '1/5/16', opScore: 71.9 },
    { matchId: 'match_12', date: '2024-01-04', champion: 'Leona', role: 'Support', win: false, kda: '4/9/12', opScore: 65.4 },
    { matchId: 'match_13', date: '2024-01-03', champion: 'Darius', role: 'Top', win: true, kda: '13/3/5', opScore: 83.1 },
    { matchId: 'match_14', date: '2024-01-02', champion: 'Aatrox', role: 'Top', win: false, kda: '8/9/4', opScore: 64.7 },
    { matchId: 'match_15', date: '2024-01-01', champion: 'Zed', role: 'Mid', win: true, kda: '16/4/3', opScore: 85.9 },
    { matchId: 'match_16', date: '2023-12-31', champion: 'Katarina', role: 'Mid', win: false, kda: '9/10/6', opScore: 63.2 },
    { matchId: 'match_17', date: '2023-12-30', champion: 'Draven', role: 'Bot', win: true, kda: '18/3/5', opScore: 89.2 },
    { matchId: 'match_18', date: '2023-12-29', champion: 'Tristana', role: 'Bot', win: true, kda: '14/4/8', opScore: 80.5 },
    { matchId: 'match_19', date: '2023-12-28', champion: 'Garen', role: 'Top', win: false, kda: '7/8/6', opScore: 61.8 },
    { matchId: 'match_20', date: '2023-12-27', champion: 'Amumu', role: 'Jungle', win: true, kda: '8/6/17', opScore: 77.3 }
  ];
}

// Function to get XP value for quest difficulty
function getXPForDifficulty(difficulty) {
  const xpMap = {
    'Easy': 10,
    'Medium': 25,
    'Hard': 50,
    'Very Hard': 100,
    'Extreme': 200
  };
  return xpMap[difficulty] || 10;
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
        difficulty: 'Easy',
        xpReward: getXPForDifficulty('Easy'),
        completed: false
      });
      quests.push({
        title: 'Consistency Master',
        description: 'Play 5 ranked games in a week without tilting',
        progress: '0/5',
        difficulty: 'Medium',
        xpReward: getXPForDifficulty('Medium'),
        completed: false
      });
      break;
      
    case 'Silver':
    case 'Gold':
      quests.push({
        title: 'Gold Tier Climb',
        description: 'Reach 100 LP in your current division',
        progress: `${lp}/100`,
        difficulty: 'Medium',
        xpReward: getXPForDifficulty('Medium'),
        completed: false
      });
      quests.push({
        title: 'Win Streak',
        description: 'Achieve a 3-game win streak in ranked',
        progress: '0/3',
        difficulty: 'Hard',
        xpReward: getXPForDifficulty('Hard'),
        completed: false
      });
      break;
      
    case 'Platinum':
      quests.push({
        title: 'Plat Dominance',
        description: 'Win 15 ranked games while maintaining 55%+ win rate',
        progress: '0/15',
        difficulty: 'Hard',
        xpReward: getXPForDifficulty('Hard'),
        completed: false
      });
      quests.push({
        title: 'Division Climb',
        description: 'Promote to the next division',
        progress: 'In Progress',
        difficulty: 'Very Hard',
        xpReward: getXPForDifficulty('Very Hard'),
        completed: false
      });
      break;
      
    case 'Diamond':
    case 'Master':
      quests.push({
        title: 'Diamond Mastery',
        description: 'Maintain Diamond rank for 20 games',
        progress: '0/20',
        difficulty: 'Very Hard',
        xpReward: getXPForDifficulty('Very Hard'),
        completed: false
      });
      quests.push({
        title: 'LP Collector',
        description: 'Gain 200 LP in ranked matches',
        progress: 'In Progress',
        difficulty: 'Extreme',
        xpReward: getXPForDifficulty('Extreme'),
        completed: false
      });
      break;
      
    default:
      quests.push({
        title: 'Elite Challenge',
        description: 'Win 5 ranked games while maintaining top-tier performance',
        progress: '0/5',
        difficulty: 'Extreme',
        xpReward: getXPForDifficulty('Extreme'),
        completed: false
      });
  }
  
  // Universal quests for all ranks
  quests.push({
    title: 'Daily Grind',
    description: 'Complete 3 ranked games today',
    progress: '0/3',
    difficulty: 'Easy',
    xpReward: getXPForDifficulty('Easy'),
    completed: false
  });
  
  leagueData.quests = quests;
}

// Function to calculate and update level based on XP
function updatePlayerLevel() {
  if (!leagueData.playerLevel) return;
  
  const totalXP = leagueData.playerLevel.totalXP;
  let currentLevel = leagueData.playerLevel.level;
  let xpForNextLevel = leagueData.playerLevel.xpForNextLevel;
  
  // Calculate level based on total XP (simple progression: 100 XP per level)
  currentLevel = Math.floor(totalXP / 100) + 1;
  xpForNextLevel = currentLevel * 100;
  const xpIntoCurrentLevel = totalXP % 100;
  const xpNeededToLevel = xpForNextLevel - totalXP;
  
  leagueData.playerLevel.level = currentLevel;
  leagueData.playerLevel.xpForNextLevel = xpForNextLevel;
  leagueData.playerLevel.xpIntoCurrentLevel = xpIntoCurrentLevel;
  leagueData.playerLevel.xpNeededToLevel = xpNeededToLevel;
}

// Function to display quests
function displayQuests() {
  if (!leagueData.currentRank) {
    $('#dynamicContent').html('<p class="text-gray-400">No rank data available. Please check API connection.</p>');
    return;
  }
  
  // Update level calculations
  updatePlayerLevel();
  
  let html = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">';
  
  // Level Display
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
  html += `<h2 class="text-xl font-bold text-gray-100 mb-2">Player Level</h2>`;
  html += `<p class="text-sky-400 text-3xl font-bold">Level ${leagueData.playerLevel.level}</p>`;
  html += `<p class="text-gray-400 text-sm mt-2">${leagueData.playerLevel.totalXP} Total XP</p>`;
  
  // XP Progress Bar
  const progressPercentage = (leagueData.playerLevel.xpIntoCurrentLevel / 100) * 100;
  html += '<div class="mt-3 bg-slate-700 rounded-full h-3 overflow-hidden">';
  html += `<div class="bg-gradient-to-r from-sky-500 to-sky-400 h-full transition-all duration-300" style="width: ${progressPercentage}%"></div>`;
  html += '</div>';
  html += `<p class="text-gray-400 text-xs mt-1">${leagueData.playerLevel.xpNeededToLevel} XP to next level</p>`;
  html += '</div>';
  
  // Total XP & Level Info
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
  html += `<h2 class="text-xl font-bold text-gray-100 mb-2">Statistics</h2>`;
  html += `<p class="text-emerald-400 text-lg font-semibold">${leagueData.playerLevel.totalXP} Total XP</p>`;
  html += `<p class="text-gray-400 text-sm mt-2">Completed Quests: ${leagueData.quests.filter(q => q.completed).length}/${leagueData.quests.length}</p>`;
  html += '</div>';
  
  html += '</div>';
  
  html += '<h3 class="text-lg font-semibold text-gray-200 uppercase tracking-wide mb-4">Active Quests</h3>';
  html += '<div class="space-y-3">';
  
  if (leagueData.quests.length === 0) {
    html += '<p class="text-gray-400">No quests available at the moment.</p>';
  } else {
    leagueData.quests.forEach((quest) => {
      const difficultyColors = {
        'Easy': 'bg-emerald-500/10 text-emerald-400 border-emerald-400',
        'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-400',
        'Hard': 'bg-orange-500/10 text-orange-400 border-orange-400',
        'Very Hard': 'bg-red-500/10 text-red-400 border-red-400',
        'Extreme': 'bg-purple-500/10 text-purple-400 border-purple-400'
      };
      const colorClass = difficultyColors[quest.difficulty] || difficultyColors['Medium'];
      
      html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-sky-500 transition-all duration-200">';
      html += `<h4 class="text-lg font-semibold text-gray-100 mb-2">${quest.title}</h4>`;
      html += `<p class="text-gray-400 text-sm mb-3">${quest.description}</p>`;
      html += '<div class="flex justify-between items-center flex-wrap gap-2">';
      html += `<span class="text-gray-400 text-sm font-medium">Progress: ${quest.progress}</span>`;
      html += '<div class="flex items-center gap-3">';
      html += `<span class="px-3 py-1 text-xs font-bold uppercase rounded-full border ${colorClass}">${quest.difficulty}</span>`;
      html += `<span class="text-sky-400 text-sm font-bold">+${quest.xpReward} XP</span>`;
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
  }
  
  html += '</div>';
  $('#dynamicContent').html(html);
}

// Function to display champ/role overview with matches
function displayChampRoleOverview() {
  console.log('displayChampRoleOverview called');
  console.log('leagueData.matches:', leagueData.matches);
  
  if (!leagueData.matches || leagueData.matches.length === 0) {
    $('#dynamicContent').html('<p class="text-gray-400">No match data available. Please check API connection.</p>');
    return;
  }
  
  console.log('Rendering match history with', leagueData.matches.length, 'matches');
  
  let html = '<h2 class="text-2xl font-bold text-gray-100 mb-6">Match History by Champion & Role</h2>';
  html += '<div class="space-y-3">';
  
  leagueData.matches.forEach((match, index) => {
    const winClass = match.win ? 'victory' : 'defeat';
    const winText = match.win ? 'Victory' : 'Defeat';
    const winImage = match.win ? 'Images/Victory.png' : 'Images/Defeat.png';
    
    const borderColor = match.win ? 'border-emerald-500' : 'border-red-500';
    const resultBg = match.win ? 'bg-emerald-500/10 border-emerald-500' : 'bg-red-500/10 border-red-500';
    
    html += `<div class="bg-slate-800 border ${borderColor} rounded-lg overflow-hidden" data-match-id="${match.matchId}" style="border-left-width: 3px;">`;
    html += '<div class="match-header flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors cursor-pointer" style="border-bottom: 1px solid #334155;">';
    html += `<div class="w-16 px-3 py-1 flex items-center justify-center"><img src="${winImage}" alt="${winText}" class="h-12 w-auto"></div>`;
    html += '<div class="flex-1">';
    html += `<div class="text-xs text-gray-500">${match.date}</div>`;
    html += `<div class="text-base font-semibold text-gray-100">${match.champion}</div>`;
    html += `<div class="text-xs text-gray-400">${match.role}</div>`;
    html += '</div>';
    html += `<div class="text-sm text-gray-400 font-medium px-4">${match.kda}</div>`;
    
    // Only show position if it exists (detailed matches)
    if (match.position) {
      html += `<div class="text-sky-400 font-bold">#${match.position}/10</div>`;
    } else {
      html += `<div class="text-sky-400 font-bold">-</div>`;
    }
    
    html += '<div class="text-gray-500">▼</div>';
    html += '</div>';
    
    // Only render detailed sections if match has detailed data
    const hasDetailedData = match.playerRoster && match.scoreHistory && match.pros && match.cons;
    
    html += `<div id="expanded-${match.matchId}" style="display: none;" class="bg-slate-900 p-6">`;
    
    if (hasDetailedData) {
      html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">';
      
      // OP Score bar graph
      html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-5">';
      html += '<h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">OP Score</h4>';
      html += `<canvas id="opScoreChart-${index}" width="250" height="150"></canvas>`;
      html += '</div>';
      html += '</div>'; // grid
      
      // Match Leaderboard
      html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-5">';
      html += '<h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Match Leaderboard</h4>';
      html += '<div class="space-y-2">';
      
      match.playerRoster.forEach((player, idx) => {
      const playerId = player.player.replace(/\s+/g, '_') + '_' + idx;
      const youClass = player.isYou ? 'bg-sky-500/10 border-sky-500' : 'bg-slate-700 border-slate-700';
      const topThreeBgs = {
        1: 'bg-yellow-500/10 border-yellow-500',
        2: 'bg-gray-400/10 border-gray-400',
        3: 'bg-orange-500/10 border-orange-500'
      };
      const topClass = topThreeBgs[player.position] || youClass;
      
      html += '<div class="grid grid-cols-6 gap-3 items-center p-3 rounded-lg border hover:bg-slate-700/50 transition-colors cursor-pointer ' + topClass + '" data-player-id="' + playerId + '">';
      html += `<div class="text-sky-400 font-bold text-sm">#${player.position}</div>`;
      html += `<div class="font-semibold text-sm">${player.player}</div>`;
      html += `<div class="text-gray-400 text-sm">${player.champion}</div>`;
      html += `<div class="text-gray-500 text-xs">${player.role}</div>`;
      html += `<div class="text-sky-400 font-bold text-sm text-right">${player.score}</div>`;
      html += '<div class="text-center">📊</div>';
      html += '</div>';
      
      html += `<div class="${playerId} bg-slate-800 border border-slate-700 rounded-lg p-5 mt-2" style="display: none;">`;
      html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Kills</div><div class="text-lg font-bold text-gray-200">${player.kills}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Deaths</div><div class="text-lg font-bold text-gray-200">${player.deaths}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Assists</div><div class="text-lg font-bold text-gray-200">${player.assists}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">KDA</div><div class="text-lg font-bold text-gray-200">${((player.kills + player.assists) / player.deaths).toFixed(2)}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">CS/min</div><div class="text-lg font-bold text-gray-200">${player.csPerMin}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Gold</div><div class="text-lg font-bold text-gray-200">${player.goldEarned.toLocaleString()}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">DMG Taken</div><div class="text-lg font-bold text-gray-200">${player.damageTaken.toLocaleString()}</div></div>`;
      html += `<div class="bg-slate-900 rounded p-3 col-span-2 md:col-span-4"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Items</div><div class="text-sm font-semibold text-gray-200">${player.items.join(', ')}</div></div>`;
      html += '</div></div>';
    });
    
      html += '</div></div>'; // leaderboard close, space-y-2 close
      
      // Pros and Cons Section
      html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-5 mt-4">';
      html += '<div class="flex items-center justify-between cursor-pointer hover:text-sky-400 transition-colors match-analysis-toggle">';
      html += '<h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Match Analysis</h4>';
      html += '<div class="match-analysis-arrow">▼</div>';
      html += '</div>';
      html += '<div class="match-analysis-content grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" style="display: none;">';
      
      // Pros
      html += '<div>';
      html += '<h5 class="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">';
      html += '<span>✅</span> Pros';
      html += '</h5>';
      html += '<ul class="space-y-1">';
      match.pros.forEach(pro => {
        html += `<li class="text-sm text-gray-300 flex items-start gap-2"><span class="text-emerald-400">•</span><span>${pro}</span></li>`;
      });
      html += '</ul>';
      html += '</div>';
      
      // Cons
      html += '<div>';
      html += '<h5 class="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">';
      html += '<span>❌</span> Cons';
      html += '</h5>';
      html += '<ul class="space-y-1">';
      match.cons.forEach(con => {
        html += `<li class="text-sm text-gray-300 flex items-start gap-2"><span class="text-red-400">•</span><span>${con}</span></li>`;
      });
      html += '</ul>';
      html += '</div>';
      
      html += '</div></div>'; // grid and section
    } else {
      // Show message for matches without detailed data
      html += '<div class="text-gray-400 text-center py-8">Detailed match data not available for this match.</div>';
    }
    
    html += '</div>'; // expanded
    html += '</div>'; // match-card
  });
  
  html += '</div>'; // space-y-3
  
  $('#dynamicContent').html(html);
  
  // Setup click handlers for expanding/collapsing matches
  $('.match-header').off('click').on('click', function() {
    const matchId = $(this).parent().data('match-id');
    const expanded = $(`#expanded-${matchId}`);
    const icon = $(this).find('div').last();
    
    if (expanded.is(':visible')) {
      expanded.slideUp();
      icon.text('▼');
    } else {
      expanded.slideDown();
      icon.text('▲');
      
      // Create OP Score bar graph if not already created and match has opScore
      const canvas = expanded.find('canvas')[0];
      if (canvas) {
        const match = leagueData.matches.find(m => m.matchId === matchId);
        if (match && match.opScore !== undefined) {
          createOpScoreBarChart(canvas, match.opScore);
        }
      }
    }
  });
  
  // Setup click handlers for player details
  $('[data-player-id]').off('click').on('click', function(event) {
    event.stopPropagation(); // Prevent event from bubbling to match header
    const playerId = $(this).data('player-id');
    const details = $(`.${playerId}`);
    
    // Close all other details
    $('[data-player-id]').next().not(`.${playerId}`).slideUp();
    
    if (details.is(':visible')) {
      details.slideUp();
    } else {
      details.slideDown();
    }
  });
  
  // Setup click handlers for pros/cons toggle
  $('.match-analysis-toggle').off('click').on('click', function(event) {
    event.stopPropagation(); // Prevent event from bubbling to match header
    const content = $(this).next('.match-analysis-content');
    const arrow = $(this).find('.match-analysis-arrow');
    
    if (content.is(':visible')) {
      content.slideUp();
      arrow.text('▼');
    } else {
      content.slideDown();
      arrow.text('▲');
    }
  });
}

// Create a bar chart for OP Score
// TODO: When League API is integrated, this will display additional OP Score data
function createOpScoreBarChart(canvas, opScore) {
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (canvas.chartInstance) {
    canvas.chartInstance.destroy();
  }
  
  // For now, display a single bar with the OP Score
  // Later with League API integration, this can show multiple bars (e.g., by match, by champion, etc.)
  canvas.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['OP Score'],
      datasets: [{
        label: 'OP Score',
        data: [opScore],
        backgroundColor: '#0EA5E9',
        borderColor: '#0EA5E9',
        borderWidth: 2,
        barThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `OP Score: ${context.parsed.y.toFixed(1)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: '#334155'
          },
          ticks: {
            color: '#94A3B8',
            stepSize: 20
          },
          title: {
            display: true,
            text: 'OP Score',
            color: '#94A3B8'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#94A3B8'
          }
        }
      }
    }
  });
}

// Function to display OP Score history
function displayScore() {
  if (!leagueData.matches || leagueData.matches.length === 0) {
    $('#dynamicContent').html('<p class="text-gray-400">No match data available. Please check API connection.</p>');
    return;
  }
  
  // Get last 20 matches
  const recentMatches = leagueData.matches
    .filter(m => m.opScore) // Only matches with OP scores
    .slice(0, 20)
    .reverse(); // Most recent first
  
  if (recentMatches.length === 0) {
    $('#dynamicContent').html('<p class="text-gray-400">No OP score data available.</p>');
    return;
  }
  
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-8">';
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-6">OP Score History (Last 20 Matches)</h2>';
  html += '<div class="bg-slate-900 rounded-lg p-6" style="height: 500px; position: relative;">';
  html += '<canvas id="opScoreChart" style="max-height: 100%;"></canvas>';
  html += '</div>';
  html += '</div>';

        $('#dynamicContent').html(html);
  
  // Create Chart.js graph
  setTimeout(() => {
    const canvas = document.getElementById('opScoreChart');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    console.log('Canvas found, creating chart with', recentMatches.length, 'matches');
    
    const ctx = canvas.getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (window.opScoreChartInstance) {
      window.opScoreChartInstance.destroy();
    }
    
    window.opScoreChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: recentMatches.map((m, i) => `Match ${recentMatches.length - i}`),
        datasets: [{
          label: 'OP Score',
          data: recentMatches.map(m => m.opScore),
          borderColor: '#0EA5E9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#0EA5E9',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover: function(event, elements) {
          event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        },
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            enabled: true,
            intersect: false,
            external: false,
            animation: {
              duration: 200
            },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            titleColor: '#E2E4E9',
            bodyColor: '#E2E4E9',
            displayColors: false,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              title: function(context) {
                if (!context || !context[0]) return '';
                const index = context[0].dataIndex;
                const match = recentMatches[index];
                if (!match) return 'Match Data';
                const winText = match.win ? 'Victory' : 'Defeat';
                return `${match.date} - ${winText}`;
              },
              label: function(context) {
                if (!context || !context[0]) return [];
                const index = context[0].dataIndex;
                const match = recentMatches[index];
                if (!match) return ['No data'];
                const prefix = match.win ? '✓' : '✗';
                return [
                  `${prefix} ${match.champion} (${match.role})`,
                  `OP Score: ${match.opScore}`,
                  `KDA: ${match.kda}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: '#334155'
            },
            ticks: {
              color: '#94A3B8'
            },
            title: {
              display: true,
              text: 'OP Score',
              color: '#94A3B8',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          x: {
            grid: {
              color: '#334155'
            },
            ticks: {
              color: '#94A3B8',
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
    
    console.log('Chart created with', recentMatches.length, 'matches');
    console.log('Tooltip enabled:', window.opScoreChartInstance.options.plugins.tooltip.enabled);
    console.log('First match data:', recentMatches[0]);
    
    // Test tooltip manually
    setTimeout(() => {
      const event = new MouseEvent('mousemove', {
        clientX: canvas.offsetLeft + 50,
        clientY: canvas.offsetTop + 50
      });
      canvas.dispatchEvent(event);
      console.log('Test event dispatched - should trigger tooltip if working');
    }, 500);
  }, 100);
}

// Function to get rank image path based on tier
// This function maps rank tiers to their corresponding image files
function getRankImagePath(tier) {
  // Normalize tier name to lowercase for consistent mapping
  const tierLower = tier.toLowerCase();
  
  // Map each tier to its image filename
  // Uses the actual filenames in the Images directory
  const rankImageMap = {
    'iron': 'Images/iron.png',
    'bronze': 'Images/bronze.png',
    'silver': 'Images/silver.png',
    'gold': 'Images/gold.png',
    'platinum': 'Images/platnum.png',  // Note: filename is spelled "platnum"
    'platnum': 'Images/platnum.png',   // Also handle the misspelling
    'emerald': 'Images/emerald.png',
    'diamond': 'Images/diamond.png',
    'master': 'Images/master.png',
    'grandmaster': 'Images/Grandmaster.png',  // Capitalized in filename
    'challenger': 'Images/Challenger.png'      // Capitalized in filename
  };
  
  // Return the image path, or null if tier not found
  return rankImageMap[tierLower] || null;
}

// Helper function to extract tier from a rank string (e.g., "Diamond II" -> "Diamond")
function extractTierFromRank(rankString) {
  if (!rankString) return null;
  // Split by space and take the first part (the tier)
  const parts = rankString.trim().split(' ');
  return parts[0] || null;
}

// Function to display overview information
function displayOverview() {
  let html = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">';
  
  // Current Rank Section (if available)
  if (leagueData.currentRank) {
    html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
    html += '<h3 class="text-lg font-semibold text-gray-200 uppercase tracking-wide mb-4">Current Rank</h3>';
    html += '<div class="flex items-center gap-4">';
    // Rank image
    const currentTier = leagueData.currentRank.tier;
    const rankImagePath = getRankImagePath(currentTier);
    if (rankImagePath) {
      html += `<img src="${rankImagePath}" alt="${currentTier} rank" class="w-16 h-16 object-contain" onerror="this.style.display='none';">`;
    }
    // Rank text
    html += '<div>';
    html += `<p class="text-sky-400 text-2xl font-semibold">${leagueData.currentRank.tier} ${leagueData.currentRank.division}</p>`;
    html += `<p class="text-gray-400 text-sm mt-1">LP: ${leagueData.currentRank.lp}</p>`;
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }
  
  // Past Season Ranks Section
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
  html += '<h3 class="text-lg font-semibold text-gray-200 uppercase tracking-wide mb-4">Past Season Ranks</h3>';
  html += '<div class="overflow-x-auto">';
  html += '<table class="w-full border-separate border-spacing-0">';
  html += '<thead><tr>';
  html += '<th class="bg-slate-900 text-gray-400 p-3 text-left text-xs font-semibold uppercase tracking-wide border-b border-slate-700">Season</th>';
  html += '<th class="bg-slate-900 text-gray-400 p-3 text-left text-xs font-semibold uppercase tracking-wide border-b border-slate-700">Rank</th>';
  html += '</tr></thead><tbody>';
  leagueData.pastSeasonRanks.forEach(s => {
    const pastTier = extractTierFromRank(s.rank);
    const pastRankImagePath = pastTier ? getRankImagePath(pastTier) : null;
    html += '<tr class="hover:bg-slate-800/50 transition-colors">';
    html += `<td class="p-3 text-gray-300 border-b border-slate-700">${s.season}</td>`;
    html += '<td class="p-3 text-gray-300 border-b border-slate-700">';
    html += '<div class="flex items-center gap-2">';
    if (pastRankImagePath) {
      html += `<img src="${pastRankImagePath}" alt="${s.rank} rank" class="w-8 h-8 object-contain" onerror="this.style.display='none';">`;
    }
    html += `<span>${s.rank}</span>`;
    html += '</div>';
    html += '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';
  
  // Most Played Champions Section
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
  html += '<h3 class="text-lg font-semibold text-gray-200 uppercase tracking-wide mb-4">Most Played Champions</h3>';
  html += '<div class="overflow-x-auto">';
  html += '<table class="w-full border-separate border-spacing-0">';
  html += '<thead><tr>';
  html += '<th class="bg-slate-900 text-gray-400 p-3 text-left text-xs font-semibold uppercase tracking-wide border-b border-slate-700">Champion</th>';
  html += '<th class="bg-slate-900 text-gray-400 p-3 text-left text-xs font-semibold uppercase tracking-wide border-b border-slate-700">Games</th>';
  html += '<th class="bg-slate-900 text-gray-400 p-3 text-left text-xs font-semibold uppercase tracking-wide border-b border-slate-700">Win Rate</th>';
  html += '</tr></thead><tbody>';
  leagueData.mostPlayedChampions.forEach(champ => {
    html += `<tr class="hover:bg-slate-800/50 transition-colors"><td class="p-3 text-gray-300 border-b border-slate-700">${champ.name}</td><td class="p-3 text-gray-300 border-b border-slate-700">${champ.games}</td><td class="p-3 text-gray-300 border-b border-slate-700">${champ.winRate}</td></tr>`;
  });
  html += '</tbody></table></div></div>';
  
  html += '</div>';
  $('#dynamicContent').html(html);
}

// Handler for tab clicks - moved inside document ready to ensure proper initialization
function setupTabHandlers() {
  // Remove any existing handlers to prevent duplicates
  $('.tab').off('click');
  
  $('.tab').on('click', function() {
    $('.tab').removeClass('border-sky-500 text-sky-400').addClass('border-transparent text-gray-500');
    $(this).addClass('border-sky-500 text-sky-400').removeClass('border-transparent text-gray-500');
    const tabId = parseInt($(this).data('tab'));
    
    console.log('Tab clicked, tabId:', tabId);

    // Handle different tabs
    if (tabId === 1) {
      // Overview tab
      fetchLeagueData().then(() => {
        displayOverview();
      });
    } else if (tabId === 2) {
      // Score tab
      fetchLeagueData().then(() => {
        displayScore();
      });
    } else if (tabId === 3) {
      // Match History tab
      console.log('Match History tab clicked, loading data...');
      fetchLeagueData().then(() => {
        console.log('Data fetched, displaying match history');
        displayChampRoleOverview();
      });
    } else if (tabId === 4) {
      // Quests tab
      fetchLeagueData().then(() => {
        displayQuests();
      });
    } else {
      // Other tabs
      $('#dynamicContent').html('<b> Information on Tab ' + tabId + ' ... </b>');
    }
  });
}

// Banner cycling functionality
// This function automatically cycles through different banner images with smooth crossfade
function initBannerCycling() {
  // Array of banner image paths to cycle through
  // These include the original banner and the 4 new splash art images
  const bannerImages = [
    'Images/banner.jpg',      // Current banner (fox-like character)
    'Images/splashart1.jpg',  // Splash art 1
    'Images/splashart2.jpg',  // Splash art 2
    'Images/splashart3.jpg',  // Splash art 3
    'Images/splashart4.jpg'   // Splash art 4
  ];
  
  let currentBannerIndex = 0;
  const bannerElement1 = document.getElementById('bannerImage1');
  const bannerElement2 = document.getElementById('bannerImage2');
  
  // Check if banner elements exist
  if (!bannerElement1 || !bannerElement2) {
    console.warn('Banner elements not found');
    return;
  }
  
  // Track which image is currently visible (1 or 2)
  let currentVisible = 1;
  
  // Set initial state: image 1 visible, image 2 hidden
  bannerElement1.style.opacity = '1';
  bannerElement1.style.zIndex = '2';
  bannerElement2.style.opacity = '0';
  bannerElement2.style.zIndex = '1';
  
  // Function to change to the next banner with crossfade
  function changeBanner() {
    // Get the next image index
    currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
    const nextImageSrc = bannerImages[currentBannerIndex];
    
    // Determine which image to update (the one that's currently hidden)
    let imageToUpdate, imageToShow, imageToHide;
    
    if (currentVisible === 1) {
      // Image 1 is visible, so update image 2 and fade it in
      imageToUpdate = bannerElement2;
      imageToShow = bannerElement2;
      imageToHide = bannerElement1;
      currentVisible = 2;
      // Bring image 2 to front
      bannerElement2.style.zIndex = '2';
      bannerElement1.style.zIndex = '1';
    } else {
      // Image 2 is visible, so update image 1 and fade it in
      imageToUpdate = bannerElement1;
      imageToShow = bannerElement1;
      imageToHide = bannerElement2;
      currentVisible = 1;
      // Bring image 1 to front
      bannerElement1.style.zIndex = '2';
      bannerElement2.style.zIndex = '1';
    }
    
    // Set the new image source (this happens instantly while opacity is 0)
    imageToUpdate.src = nextImageSrc;
    
    // Crossfade: fade out the visible image while fading in the new one
    // This creates a smooth transition where one image fades into the next
    imageToHide.style.opacity = '0';
    imageToShow.style.opacity = '1';
  }
  
  // Start cycling: change banner every 10 seconds (10000 milliseconds)
  // You can adjust this interval by changing the number below
  const cycleInterval = setInterval(changeBanner, 10000);
  
  // Preload all banner images for smoother transitions
  bannerImages.forEach(imagePath => {
    const img = new Image();
    img.src = imagePath;
  });
  
  console.log('Banner cycling initialized with', bannerImages.length, 'images (crossfade enabled)');
}

// On document ready, initialize League data and load default tab content
$(document).ready(function() {
  console.log("On Load");
  
  // Initialize banner cycling
  initBannerCycling();
  
  // Setup tab click handlers
  setupTabHandlers();
  
  // Set first tab as active
  $('.tab').first().addClass('border-sky-500 text-sky-400').removeClass('border-transparent text-gray-500');
  
  // Initialize League data (mock for now, ready for API integration)
  fetchLeagueData().then(() => {
    displayOverview();
  });
});


