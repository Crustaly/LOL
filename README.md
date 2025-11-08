# League of Legends Stats Dashboard

A comprehensive, interactive web application for viewing and analyzing your League of Legends player statistics. Built with modern web technologies, this dashboard provides detailed insights into your gameplay, match history, rank progression, and more.

## 🎮 Features

### Core Functionality

- **Player Authentication**: Secure login using Riot API credentials
  - API Key authentication (expires every 24 hours)
  - Game name and tag line support
  - Multi-region support (Americas, Europe, Asia)

- **Five Main Tabs**:
  1. **Overview**: Complete player profile with rank, level, and key statistics
  2. **Score**: Detailed performance scoring and analytics
  3. **Match History**: Comprehensive match records with champion and role data
  4. **Quests**: Dynamic quest system with progress tracking
  5. **Mini Game**: Interactive mini-game feature

- **Real-Time Data**: Fetches live data from Riot Games API via AWS Lambda backend
- **Weather Integration**: Displays current weather for Troy, NY
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern glassmorphism design with smooth animations

## 🚀 Getting Started

### Prerequisites

Before you begin, you'll need:

1. **A Riot Games API Key** - [Get one here](https://developer.riotgames.com/)
   - ⚠️ **Important**: API keys expire every 24 hours, so you'll need to generate a new one daily
2. **A modern web browser** (Chrome, Firefox, Safari, or Edge)

### Quick Start (No Installation Required!)

**This is a pure static website** - all dependencies are loaded from CDNs. You can run it immediately:

1. **Simply open `index.html` in your browser**
   - Double-click the file, or
   - Right-click → "Open with" → Your browser
   - That's it! The app will work directly.

### Optional: Development Server

If you want auto-reload and a local server (recommended for development):

1. **Install Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
   - ⚠️ **Note**: Node.js is ONLY needed if you want to use the development server
   - The app itself doesn't require Node.js to run

2. **Install dependencies** (optional)
   ```bash
   npm install
   ```
   
   This installs `live-server`, a development tool that auto-reloads when you make changes.

3. **Start the development server**
   ```bash
   npm start
   ```
   
   Or use live-server directly:
   ```bash
   npx live-server
   ```

4. **The server will automatically open your browser**
   - If not, navigate to `http://localhost:8080` (or the port shown in terminal)

## 📖 How to Use

### Step 1: Get Your Riot API Key

1. Visit the [Riot Developer Portal](https://developer.riotgames.com/)
2. Log in with your Riot Games account
3. Navigate to the "API Keys" section
4. Click "Generate API Key" or "Regenerate" if you have one
5. Copy the key (it starts with `RGAPI-`)

### Step 2: Enter Your Account Information

On the login page, you'll need to provide:

- **Riot API Key**: Paste your API key from Step 1
- **Game Name**: Your in-game summoner name (e.g., "Faker")
- **Tag Line**: Your Riot ID tag (e.g., "KR1", "NA1", "EUW1")
- **Region**: Select your routing region
  - 🌎 **Americas**: For NA, BR, LAN, LAS servers
  - 🇪🇺 **Europe**: For EUW, EUNE, TR, RU, ME servers
  - 🌏 **Asia**: For KR, JP, TW, VN, PH, SG, TH, ID, OCE servers

### Step 3: Explore Your Stats

Once logged in, you can navigate between different tabs:

- **Overview**: See your current rank, level, and summary statistics
- **Score**: Analyze your performance scores and metrics
- **Match History**: Browse through your recent matches with detailed information
- **Quests**: View and track your quest progress
- **Mini Game**: Enjoy the interactive mini-game

## 🛠️ Technical Stack

**Important**: This is a **pure client-side application**. All dependencies are loaded from CDNs - no build step or Node.js required to run the app.

### Frontend Technologies (All via CDN)

- **HTML5**: Semantic markup structure
- **CSS3**: Custom styling with modern features
- **Tailwind CSS**: Utility-first CSS framework (loaded from CDN)
- **JavaScript (ES6+)**: Modern JavaScript for interactivity (vanilla JS, no frameworks)
- **jQuery**: DOM manipulation and event handling (loaded from CDN)
- **Chart.js**: Data visualization and charting (loaded from CDN)

### External APIs

- **AWS Lambda**: Serverless backend endpoint for Riot API requests
- **Riot Games API**: Official League of Legends data API
- **Open-Meteo API**: Weather data for Troy, NY

### Development Tools (Optional)

- **live-server**: Local development server with auto-reload (only needed for development)
- **npm**: Package management (only needed if using live-server)

## 📁 Project Structure

```
LOL-main/
├── index.html          # Main HTML file with login and dashboard structure
├── script.js           # Core JavaScript logic (4700+ lines) - pure client-side
├── styles.css          # Custom CSS styles
├── README.md           # This file
├── package-lock.json   # Dependency lock file (for live-server only)
├── netlify.toml        # Netlify deployment configuration
├── _redirects          # Netlify redirect rules
├── Images/             # Image assets (rank icons, splash arts, etc.)
└── node_modules/       # Optional: Only needed if using live-server dev tool
```

## 🎨 Key Features Explained

### 1. Login System

The login page uses a beautiful glassmorphism design with:
- **Form validation**: Ensures all fields are filled correctly
- **Error handling**: Clear error messages for API failures
- **Loading states**: Visual feedback during data fetching
- **Background cycling**: Rotating splash art images

### 2. Data Fetching

The application fetches data from multiple sources:

- **Player Stats**: Via AWS Lambda function that interfaces with Riot API
- **Match History**: Recent games with champion and role information
- **Rank Information**: Current and historical rank data
- **Weather Data**: Current conditions for Troy, NY

### 3. Tab Navigation

Each tab provides different insights:

- **Overview Tab**: High-level player statistics and rank display
- **Score Tab**: Performance metrics and scoring system
- **Match History Tab**: Detailed match records with filtering
- **Quests Tab**: Dynamic quest system with progress tracking
- **Mini Game Tab**: Interactive gaming experience

### 4. Responsive Design

The dashboard adapts to different screen sizes:
- **Desktop**: Full layout with all features visible
- **Tablet**: Optimized spacing and layout
- **Mobile**: Stacked layout with touch-friendly controls

## 🔧 Configuration

### API Endpoint

The application uses an AWS Lambda endpoint for fetching player data. The endpoint is configured in `script.js`:

```javascript
const ENDPOINT = "https://q9nbniuo24.execute-api.us-east-2.amazonaws.com/default/CrystalJSScore1-1";
```

### Region Mapping

The app automatically maps game regions to routing regions:
- `na1`, `br1`, `la1`, `la2` → `americas`
- `euw1`, `eun1`, `tr1`, `ru`, `me1` → `europe`
- `kr`, `jp1`, `tw2`, `vn2`, `ph2`, `sg2`, `th2`, `id1`, `oc1` → `asia`

## 🚀 Deployment

### Netlify Deployment

This project is configured for easy deployment to Netlify. See `NETLIFY-DEPLOYMENT.md` for detailed instructions.

Quick deploy steps:
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Deploy automatically on every push

### Manual Deployment

You can also deploy to any static hosting service:
- GitHub Pages
- Vercel
- AWS S3 + CloudFront
- Any web server

## 🐛 Troubleshooting

### Common Issues

**API Key Errors (403 Forbidden)**
- ⚠️ Most common cause: API key expired (they expire every 24 hours)
- Solution: Generate a new key from [Riot Developer Portal](https://developer.riotgames.com/)
- Check that your API key starts with `RGAPI-` and is at least 20 characters

**Account Not Found (404)**
- Verify your game name and tag line are correct
- Check that you selected the correct routing region
- Ensure the account exists in the specified region

**Network Errors**
- Check your internet connection
- Verify the AWS Lambda endpoint is accessible
- Check browser console for detailed error messages

**Data Not Loading**
- Open browser DevTools (F12) and check the Console tab
- Look for error messages that can help diagnose the issue
- Try refreshing the page or logging out and back in

## 📚 Learning Resources

### Understanding the Code

This project is a great learning resource for:

1. **API Integration**: Learn how to fetch data from external APIs
2. **Async JavaScript**: See promises and async/await in action
3. **DOM Manipulation**: jQuery and vanilla JavaScript examples
4. **CSS Styling**: Modern CSS with Tailwind and custom styles
5. **Error Handling**: Comprehensive error handling patterns
6. **State Management**: How to manage application state

### Key Concepts Used

- **Promises and Async/Await**: For handling API calls
- **Event Listeners**: For user interactions
- **DOM Manipulation**: Dynamic content updates
- **Form Validation**: Input validation and error display
- **Data Caching**: Storing fetched data to reduce API calls
- **Responsive Design**: Mobile-first approach

## 🎯 Future Enhancements

Potential improvements and features:

- [ ] Persistent login (localStorage/sessionStorage)
- [ ] More detailed statistics and analytics
- [ ] Champion mastery tracking
- [ ] Comparison with other players
- [ ] Export data to CSV/JSON
- [ ] Dark/light theme toggle
- [ ] Sound effects and animations
- [ ] Real-time match updates

## 📄 License

MIT License - Feel free to use this project for learning and development!

## 🙏 Acknowledgments

- **Riot Games**: For providing the League of Legends API
- **Open-Meteo**: For weather data API
- **Tailwind CSS**: For the utility-first CSS framework
- **Chart.js**: For data visualization
- **jQuery**: For DOM manipulation

## 🆘 Support

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Verify your API key is valid and not expired
3. Ensure all form fields are filled correctly
4. Check that you're using the correct region

---

**Happy Gaming! 🎮✨**
