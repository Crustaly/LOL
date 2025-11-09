# AI Feedback Integration Guide

## Overview

The Lambda function integration has been implemented to automatically generate AI-powered roast and compliment feedback for each game in the match history. When you expand a match, the system will automatically call your Lambda function to generate personalized feedback.

## What Was Implemented

### 1. **Lambda API Function** (`getAIFeedback`)
   - Located in `script.js` around line 405
   - Calls your Lambda endpoint with match data
   - Handles the request/response format you specified
   - Includes error handling and timeout protection

### 2. **Match Data Converter** (`convertMatchToSummary`)
   - Converts your existing match format to the Lambda's expected format
   - Extracts: champion, role, kills, deaths, assists, win/loss, CS, gold, damage, vision, game duration
   - Handles different data structures from your API

### 3. **Updated AI Message Generator** (`generateAIMessage`)
   - Now uses the Lambda API instead of local generation
   - Automatically generates both roast AND compliment when called
   - Stores both in data attributes for quick switching
   - Falls back to local generation if Lambda fails

### 4. **Auto-Generation on Match Expand**
   - When you expand a match, feedback is automatically generated
   - Shows loading spinner while generating
   - Only generates once per match (cached)

### 5. **Mode Toggle Enhancement**
   - Can switch between roast and compliment without regenerating
   - Both types are generated in one API call
   - Smooth switching between modes

## Configuration

### Update the Lambda Endpoint

**Important**: You need to update the Lambda endpoint URL in `script.js`:

```javascript
// Line ~410 in script.js
const ENDPOINT = "https://xewn6ahmh9.execute-api.us-east-1.amazonaws.com/default/quests";
```

**Replace with your actual feedback Lambda endpoint**, for example:
```javascript
const ENDPOINT = "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/default/feedback";
```

### Expected Lambda Response Format

Your Lambda function should return JSON in this format:

```json
{
  "player": { ... },
  "matchSummaries": [ ... ],
  "feedback": {
    "roast": "AI-generated roast feedback text here...",
    "compliment": "AI-generated compliment feedback text here..."
  }
}
```

Or alternatively:

```json
{
  "roast": "AI-generated roast feedback text here...",
  "compliment": "AI-generated compliment feedback text here..."
}
```

## How It Works

### User Flow

1. **User expands a match** → Match details slide down
2. **Auto-generation triggers** → After 500ms delay, Lambda API is called
3. **Loading state shown** → Spinner appears in feedback area
4. **Feedback received** → Both roast and compliment are displayed
5. **User can toggle** → Switch between roast/compliment without regenerating

### Data Flow

```
Match Expanded
    ↓
convertMatchToSummary() → Converts match to Lambda format
    ↓
getAIFeedback() → Calls Lambda API
    ↓
Lambda processes with AI → Returns feedback
    ↓
generateAIMessage() → Displays feedback
    ↓
Stores in data attributes → For quick switching
```

## Request Format Sent to Lambda

```json
{
  "player": {
    "puuid": "player-puuid-here",
    "gameName": "Faker",
    "tagLine": "KR1"
  },
  "matchSummaries": [
    {
      "champion": "Ahri",
      "role": "MIDDLE",
      "kills": 1,
      "deaths": 7,
      "assists": 9,
      "win": true,
      "cs": 48,
      "gold": 10269,
      "damage": 15338,
      "vision": 13,
      "gameDuration": "18 min"
    }
  ],
  "feedback": {
    "roast": "",
    "compliment": ""
  }
}
```

## Error Handling

- **Timeout**: 30 seconds max wait time
- **Network errors**: Shows error message
- **Fallback**: If Lambda fails, uses local `generateFeedback()` function
- **User notification**: Shows toast notification on errors

## Testing

1. **Open match history tab**
2. **Expand any match**
3. **Wait for auto-generation** (should see loading spinner)
4. **Check feedback appears** (roast by default)
5. **Toggle to compliment mode** (should switch instantly)
6. **Toggle back to roast** (should switch instantly)

## Troubleshooting

### Feedback Not Generating

1. **Check browser console** (F12) for errors
2. **Verify endpoint URL** is correct in `script.js`
3. **Check Lambda logs** in AWS CloudWatch
4. **Verify CORS** is enabled on your API Gateway
5. **Check network tab** to see the actual request/response

### Common Issues

**"Failed to fetch"**
- CORS issue or endpoint unavailable
- Check API Gateway CORS settings

**"Timeout"**
- Lambda taking too long (>30 seconds)
- Consider increasing timeout or optimizing Lambda

**"Parse Error"**
- Lambda response format doesn't match expected structure
- Check Lambda response matches the format above

**Feedback shows but is generic**
- Lambda might be returning fallback/error responses
- Check Lambda function logs

## Performance Notes

- **Caching**: Feedback is generated once per match and cached
- **Lazy Loading**: Only generates when match is expanded
- **Parallel Requests**: Each match generates independently
- **Timeout**: 30 seconds per request (AI can be slow)

## Future Enhancements

Potential improvements you could add:

1. **Batch generation**: Generate feedback for all matches at once
2. **Caching in localStorage**: Persist feedback across page reloads
3. **Retry logic**: Automatically retry failed requests
4. **Progress indicator**: Show progress when generating multiple matches
5. **Rate limiting**: Prevent too many simultaneous requests

## Code Locations

- **Lambda API function**: `script.js` line ~405 (`getAIFeedback`)
- **Match converter**: `script.js` line ~1965 (`convertMatchToSummary`)
- **AI generator**: `script.js` line ~1994 (`generateAIMessage`)
- **Auto-generation trigger**: `script.js` line ~2420 (in match expand handler)
- **Mode toggle**: `script.js` line ~2440 (enhanced toggle handler)

## Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify your Lambda endpoint is accessible
3. Test the endpoint directly with a tool like Postman
4. Check AWS CloudWatch logs for Lambda errors

