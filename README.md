# League of Legends Quests Interface

A beautiful, interactive quests interface inspired by League of Legends, built with Anime.js for smooth animations and modern web technologies.

## 🎮 Features

- **League of Legends Aesthetic**: Authentic LoL color scheme, typography, and visual design
- **Smooth Animations**: Powered by Anime.js for fluid transitions and interactions
- **Interactive Quest System**: Claim quests, track progress, and receive notifications
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Category System**: Daily, Weekly, and Event quests with smooth category switching
- **Progress Tracking**: Animated progress bars with real-time updates
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites

- Node.js (for development server)
- Modern web browser

### Installation

1. **Clone or download the project**
   ```bash
   cd /Users/tyler/LOL-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or use the simple HTTP server:
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Design Features

### Color Scheme
- **Primary Gold**: `#C9AA71` - League's signature gold color
- **Dark Blue**: `#0F1419` - Deep background color
- **Accent Blue**: `#1E2328` - Card backgrounds
- **Success Green**: `#00D4AA` - Completed quests and notifications
- **Text Colors**: `#F0E6D2` (primary), `#A09B8C` (secondary)

### Typography
- **Font**: Beaufort for LoL (League's official font)
- **Fallback**: Arial for broader compatibility

### Animations
- **Entrance**: Staggered fade-in animations for quest items
- **Hover**: Scale and glow effects on interactive elements
- **Progress**: Smooth progress bar animations
- **Claims**: Elastic button animations with color transitions
- **Notifications**: Slide-in toast notifications

## 🛠️ Technical Implementation

### HTML Structure
```html
<div class="app-container">
  <header class="header">...</header>
  <main class="main-content">
    <div class="quest-categories">...</div>
    <div class="quest-list">...</div>
  </main>
  <div class="notification-toast">...</div>
</div>
```

### CSS Architecture
- **CSS Variables**: Centralized color and spacing management
- **Flexbox Layout**: Responsive and flexible component arrangement
- **CSS Animations**: Keyframe animations for loading states
- **Hover Effects**: Transform and color transitions
- **Mobile Responsive**: Breakpoints for different screen sizes

### JavaScript Classes
```javascript
class QuestsInterface {
  constructor()           // Initialize the interface
  init()                  // Set up event listeners and animations
  switchCategory()        // Handle category switching
  claimQuest()           // Process quest claiming
  animateProgressUpdate() // Update progress with animations
  showNotification()      // Display toast notifications
}
```

## 🎯 Quest System

### Quest Types
1. **Daily Quests**: Reset every 24 hours
   - Victory Seeker (Win 3 games)
   - Champion Explorer (Play 5 champions)
   - Minion Slayer (Kill 100 minions)

2. **Weekly Quests**: Reset every 7 days
   - Weekly Champion (Win 10 games)
   - Time Warrior (Play 5 hours)

3. **Event Quests**: Special limited-time quests
   - Arcane Explorer (Complete event storyline)

### Progress Tracking
- **Visual Progress Bars**: Animated fill animations
- **Text Progress**: Current/Total format
- **Completion States**: Visual feedback for completed quests
- **Claimable States**: Interactive buttons for ready-to-claim quests

## 🎨 Animation Details

### Anime.js Implementation
```javascript
// Entrance animations
anime({
  targets: '.quest-item',
  translateY: [50, 0],
  opacity: [0, 1],
  duration: 600,
  delay: anime.stagger(150),
  easing: 'easeOutQuart'
});

// Hover animations
anime({
  targets: element,
  scale: [1, 1.02],
  duration: 200,
  easing: 'easeOutQuart'
});
```

### CSS Animations
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: Full layout with side-by-side elements
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Stacked layout with centered content

### Mobile Optimizations
- Touch-friendly button sizes
- Optimized spacing for thumb navigation
- Readable font sizes on small screens
- Simplified animations for better performance

## 🔧 Customization

### Adding New Quests
```javascript
// In script.js, add to the quests object
quests: {
  daily: [
    {
      id: 'new-quest',
      title: 'New Quest Title',
      description: 'Quest description',
      progress: { current: 0, total: 10 },
      reward: { type: 'blue-essence', amount: 500 },
      completed: false,
      claimable: false
    }
  ]
}
```

### Styling Customization
```css
:root {
  --lol-gold: #C9AA71;        /* Change primary color */
  --lol-blue: #0F1419;        /* Change background */
  --lol-success: #00D4AA;     /* Change success color */
}
```

## 🎮 Usage Examples

### Switching Categories
```javascript
// Programmatically switch to weekly quests
questsInterface.switchCategory('weekly');
```

### Updating Progress
```javascript
// Simulate progress update
questsInterface.animateProgressUpdate('win-games', 1);
```

### Adding Notifications
```javascript
// Show custom notification
questsInterface.showNotification('Custom message!');
```

## 🚀 Performance Features

- **Optimized Animations**: Hardware-accelerated transforms
- **Efficient DOM Updates**: Minimal reflows and repaints
- **Lazy Loading**: Animations only when needed
- **Memory Management**: Proper cleanup of event listeners

## 🎯 Future Enhancements

- **Sound Effects**: Audio feedback for interactions
- **Particle Effects**: Visual flair for quest completion
- **Drag & Drop**: Reorder quests by priority
- **Filters**: Search and filter quests
- **Statistics**: Quest completion analytics
- **Themes**: Multiple color schemes

## 📄 License

MIT License - Feel free to use this project for learning and development!

---

**Happy Questing! 🎮✨**
