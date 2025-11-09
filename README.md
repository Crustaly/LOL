# League of Legends Stats Dashboard

A comprehensive, interactive stats dashboard for League of Legends players that displays match history, performance metrics, quests, and fun mini-games. Built with modern web technologies and integrated with the Riot Games API via AWS Lambda.

## 🎮 Features

### Core Functionality
- **Player Login System**: Secure login with Riot ID (username, tagline, and region)
- **Real-time Data Fetching**: Connects to Riot Games API via AWS Lambda for live player statistics
- **Dynamic Backgrounds**: Smooth cycling background images on login and dashboard pages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Dashboard Tabs

#### 1. **Overview Tab**
- **Current Rank Display**: Shows your current tier, division, and LP with rank images
- **Past Season Ranks**: Grid view of your historical ranks across previous seasons
- **Most Played Champions**: Table showing your top champions with games played and win rates

#### 2. **Score Tab**
- **OP Score History**: Interactive Chart.js line graph showing your performance scores over the last 20 matches
- **Profile Statistics**: Comprehensive stats including average OP score, win rate, KDA, and more
- **Visual Analytics**: Futuristic neon-themed charts with gradient effects

#### 3. **Match History Tab**
- **Detailed Match List**: Complete match history organized by champion and role
- **Match Details**: Expandable match cards showing:
  - Victory/Defeat status with neon glow effects
  - KDA, champion, role, and date
  - OP Score bar charts per match
  - Match leaderboard with all 10 players
  - AI-generated feedback (roast and compliment) for each match
- **Share Functionality**: Copy match links to share with friends
- **Player Position Highlighting**: Shows your position ranking within each match

#### 4. **Quests Tab**
- **Player Level System**: Track your level and XP progression
- **Dynamic Quest Generation**: Quests automatically generated based on your current rank
- **Quest Progress Tracking**: Visual progress indicators for each quest
- **XP Rewards**: Earn XP by completing quests with difficulty-based rewards
- **Quest Statistics**: View completed quests and total XP earned

#### 5. **Mini Games Tab**
Interactive tools and games for League of Legends players:

- **Duo Draft**: Search for 2 players and simulate how well they'd work together based on match history
- **Champion Picker**: Get smart random champion recommendations based on your performance history and win rates
- **Match Predictor**: Enter team compositions and predict match outcomes based on champion strengths
- **Rank Calculator**: Calculate how many wins you need to rank up, estimate LP gains/losses, and plan your climb

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No Node.js or build tools required - runs directly in the browser
- Riot Games account with a valid Riot ID

### Installation

1. **Download or clone the project**
   ```bash
   cd LOL-main
   ```

2. **Open the project**
   - Simply open `index.html` in your web browser, or
   - Use a local web server for best results:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (if you have it)
     npx http-server
     ```

3. **Access the application**
   - Navigate to `http://localhost:8000` (or your server's port)
   - Or open `index.html` directly in your browser

### First Time Setup

1. **Enter Your Riot ID**
   - **Username**: Your in-game name (e.g., "Faker")
   - **Tagline**: Your tag (e.g., "KR1")
   - **Region**: Select your region (Americas, Europe, or Asia)

2. **Load Your Data**
   - Click "Load Player Data"
   - Wait for the API to fetch your stats (may take 10-30 seconds on first request)
   - Your dashboard will automatically populate with your data

## 🛠️ Technical Stack

### Frontend Technologies
- **HTML5**: Semantic markup structure
- **CSS3**: Custom styles with CSS variables and animations
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **jQuery**: DOM manipulation and event handling
- **Chart.js**: Interactive data visualizations

### Backend Integration
- **AWS Lambda**: Serverless API endpoints
- **Riot Games API**: Official League of Legends data API
- **Open-Meteo API**: Weather data (for additional features)

### Key Libraries
- **Chart.js**: For OP Score graphs and match statistics
- **Tailwind CSS**: For responsive, modern UI components
- **jQuery**: For simplified DOM operations

## 🎨 Design Features

### Color Scheme
- **Primary**: Sky blue (`#0ea5e9`) - Interactive elements and highlights
- **Background**: Dark slate (`#0f172a`, `#1e293b`) - Deep, immersive backgrounds
- **Success**: Emerald green (`#10b981`) - Victory states and positive feedback
- **Error**: Red (`#ef4444`) - Defeat states and errors
- **Text**: Gray scale (`#f1f5f9` to `#64748b`) - Readable text hierarchy

### Visual Effects
- **Neon Glow Effects**: Victory/Defeat text with animated glow
- **Gradient Backgrounds**: Smooth color transitions
- **Smooth Transitions**: CSS transitions for hover states and interactions
- **Background Cycling**: Automatic image transitions on login and dashboard
- **Glassmorphism**: Frosted glass effect on login card

### Responsive Breakpoints
- **Mobile**: Optimized for screens 320px and up
- **Tablet**: Enhanced layout for 768px and up
- **Desktop**: Full-featured layout for 1024px and up

## 📊 Data Structure

### Player Data
```javascript
{
  currentRank: { tier, division, lp },
  pastSeasonRanks: [{ season, rank }],
  mostPlayedChampions: [{ name, games, winRate }],
  matches: [{ matchId, champion, role, kda, win, date, opScore, ... }],
  quests: [{ title, description, progress, difficulty, xpReward, completed }],
  playerLevel: { level, totalXP, xpForNextLevel }
}
```

## 🔧 Configuration

### API Configuration
The application uses a hardcoded Riot Games API key. For production use, consider:
- Moving API keys to environment variables
- Implementing a secure backend proxy
- Using OAuth for user authentication

### Region Support
- **Americas**: NA, BR, LAN, LAS
- **Europe**: EUW, EUNE, TR, RU, ME
- **Asia**: KR, JP, TW, VN, PH, SG, TH, ID, OC

## 🎯 Usage Examples

### Viewing Match History
1. Navigate to the "Match History" tab
2. Browse your recent matches
3. Click on any match to expand and see:
   - Full match details
   - OP Score visualization
   - Complete player leaderboard
   - AI-generated feedback

### Tracking Your Progress
1. Go to the "Score" tab to see your OP Score trends
2. Check the "Quests" tab to view available quests
3. Monitor your player level and XP in the quests section

### Using Mini Games
1. Click the "Mini game" tab
2. Choose from:
   - **Duo Draft**: Compare two players' compatibility
   - **Champion Picker**: Get champion recommendations
   - **Match Predictor**: Predict match outcomes
   - **Rank Calculator**: Plan your ranked climb

## 🚀 Deployment

### Netlify Deployment
This project is configured for easy deployment to Netlify:

1. **Drag & Drop Method**
   - Go to [netlify.com](https://netlify.com)
   - Sign up for a free account
   - Drag your project folder to the deploy area
   - Get your live URL instantly

2. **GitHub Integration**
   - Push your code to GitHub
   - Connect your repository to Netlify
   - Automatic deployments on every push

See `NETLIFY-DEPLOYMENT.md` for detailed deployment instructions.

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

## 🔒 Privacy & Security

- API keys are currently hardcoded (consider securing for production)
- No user data is stored locally beyond session
- All API calls are made server-side via AWS Lambda
- HTTPS recommended for production deployment

## 🐛 Troubleshooting

### Common Issues

**"No match data available"**
- Verify your Riot ID is correct
- Check that your region matches your account
- Ensure you have recent match history

**API timeout errors**
- First request may take 30+ seconds (cold start)
- Subsequent requests should be faster
- Check your internet connection

**Charts not displaying**
- Ensure Chart.js CDN is loading
- Check browser console for errors
- Try refreshing the page

**Background images not cycling**
- Check that image files exist in `Images/` folder
- Verify image paths are correct
- Check browser console for 404 errors

## 🎮 Future Enhancements

- [ ] User authentication system
- [ ] Persistent data storage
- [ ] More mini-games and tools
- [ ] Champion mastery tracking
- [ ] Team composition analyzer
- [ ] Export match data to CSV/JSON
- [ ] Dark/Light theme toggle
- [ ] Sound effects and audio feedback
- [ ] Real-time match tracking
- [ ] Social features (share builds, compare stats)

## 📄 License

MIT License - Feel free to use this project for learning and development!

## 🙏 Acknowledgments

- **Riot Games** for the League of Legends API
- **Chart.js** for beautiful data visualizations
- **Tailwind CSS** for the utility-first CSS framework
- **AWS Lambda** for serverless API hosting

---

**Happy Climbing! 🎮✨**
