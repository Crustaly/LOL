// Utility function: Format date to readable format (e.g., "Jan 15, 2024")
function formatDate(dateString) {
  if (!dateString) return 'Unknown Date';
  
  try {
    // Handle ISO format (YYYY-MM-DD) or timestamp
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    // Format as "Month Day, Year" (e.g., "Jan 15, 2024")
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    // If parsing fails, return original string
    return dateString;
  }
}

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

// User credentials storage
let userCredentials = {
  apiKey: 'RGAPI-47148504-2d76-4d11-93aa-2e7db404f98f', // Default API key (Lambda requires it in request body)
  gameName: null,
  tagLine: null,
  region: null
};

// Data loading state - track if data has been loaded and when
let dataLoadState = {
  isLoaded: false,
  isLoading: false,
  lastLoadTime: null,
  loadPromise: null
};

// Map region codes to routing regions (for APIs that need routing regions)
function getRoutingRegion(regionCode) {
  const routingMap = {
    // Americas
    'na1': 'americas',
    'br1': 'americas',
    'la1': 'americas',
    'la2': 'americas',
    // Europe & Middle East
    'euw1': 'europe',
    'eun1': 'europe',
    'tr1': 'europe',
    'ru': 'europe',
    'me1': 'europe',
    // Asia Pacific
    'kr': 'asia',
    'jp1': 'asia',
    'tw2': 'asia',
    'vn2': 'asia',
    'ph2': 'asia',
    'sg2': 'asia',
    'th2': 'asia',
    'id1': 'asia',
    // Oceania
    'oc1': 'asia' // Oceania typically uses Asia routing
  };
  
  // If it's already a routing region, return as-is
  if (['americas', 'europe', 'asia'].includes(regionCode.toLowerCase())) {
    return regionCode.toLowerCase();
  }
  
  return routingMap[regionCode] || 'americas'; // Default fallback
}

// ✅ Fetch player stats from AWS API Gateway (CrystalJSScore Lambda)
// Matches your exact API structure
async function getPlayerStats(apiKey, name, tag, region) {
  const ENDPOINT = "https://q9nbniuo24.execute-api.us-east-2.amazonaws.com/default/CrystalJSScore1-1";
  
  // Add timeout (30 seconds)
  const timeout = 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log("🔄 Fetching player stats from Lambda...");
    console.log("🔍 ========== DIAGNOSTIC VALIDATION ==========");
    
    // Process and validate each parameter
    const processedApiKey = (apiKey && apiKey.trim()) ? apiKey.trim() : '';
    const processedName = (name && name.trim()) ? name.trim() : '';
    const processedTag = (tag && tag.trim()) ? tag.trim() : '';
    const processedRegion = (region && region.trim()) ? region.trim() : '';
    
    // 1. API KEY VALIDATION
    console.log("🔑 API KEY DIAGNOSTICS:");
    console.log("  - Raw value:", apiKey ? `"${apiKey.substring(0, 10)}..." (${apiKey.length} chars)` : '(empty)');
    console.log("  - Processed value:", processedApiKey ? `"${processedApiKey.substring(0, 10)}..." (${processedApiKey.length} chars)` : '(empty)');
    console.log("  - Format check:", processedApiKey.startsWith('RGAPI-') ? '✅ Starts with RGAPI-' : '❌ Does NOT start with RGAPI-');
    console.log("  - Length check:", processedApiKey.length >= 20 ? `✅ Length OK (${processedApiKey.length})` : `❌ Too short (${processedApiKey.length}, expected ≥20)`);
    
    // 2. GAME NAME VALIDATION
    console.log("👤 GAME NAME DIAGNOSTICS:");
    console.log("  - Raw value:", name ? `"${name}" (${name.length} chars)` : '(empty)');
    console.log("  - Processed value:", processedName ? `"${processedName}" (${processedName.length} chars)` : '(empty)');
    console.log("  - Has spaces:", processedName.includes(' ') ? `✅ Contains spaces: "${processedName}"` : 'No spaces');
    console.log("  - Length check:", processedName.length >= 3 && processedName.length <= 16 ? `✅ Length OK (${processedName.length})` : `⚠️ Length: ${processedName.length} (expected 3-16)`);
    console.log("  - Special chars:", /[^a-zA-Z0-9\s]/.test(processedName) ? `⚠️ Contains special chars` : '✅ No special chars');
    
    // 3. TAG LINE VALIDATION
    console.log("🏷️ TAG LINE DIAGNOSTICS:");
    console.log("  - Raw value:", tag ? `"${tag}" (${tag.length} chars)` : '(empty)');
    console.log("  - Processed value:", processedTag ? `"${processedTag}" (${processedTag.length} chars)` : '(empty)');
    console.log("  - Length check:", processedTag.length >= 2 && processedTag.length <= 5 ? `✅ Length OK (${processedTag.length})` : `⚠️ Length: ${processedTag.length} (expected 2-5)`);
    console.log("  - Format check:", /^[A-Z0-9]+$/.test(processedTag.toUpperCase()) ? '✅ Valid format (alphanumeric)' : '⚠️ May contain invalid characters');
    
    // 4. REGION VALIDATION
    console.log("🌍 REGION DIAGNOSTICS:");
    console.log("  - Raw value:", region ? `"${region}"` : '(empty)');
    console.log("  - Processed value:", processedRegion ? `"${processedRegion}"` : '(empty)');
    // Define valid routing regions (accessible throughout function)
    const validRegions = ['americas', 'europe', 'asia'];
    const processedRegionLower = processedRegion.toLowerCase();
    console.log("  - Valid region check:", validRegions.includes(processedRegionLower) ? `✅ Valid routing region: "${processedRegion}"` : `❌ INVALID routing region: "${processedRegion}" (expected one of: ${validRegions.join(', ')})`);
    if (!validRegions.includes(processedRegionLower) && processedRegion) {
      console.error("  ❌ REGION MISMATCH! The region you entered doesn't match any valid routing region.");
      console.error("     Please select: Americas, Europe, or Asia from the dropdown.");
    }
    
    console.log("🔍 ==========================================");
    
    // Build request payload - Lambda requires all fields including api_key
    // Use routing region directly (americas, europe, asia)
    const routingRegion = getRoutingRegion(processedRegion.toLowerCase());
    const requestPayload = {
      api_key: processedApiKey,
      game_name: processedName,
      tag_line: processedTag,
      region: routingRegion, // Use routing region (americas, europe, asia)
    };
    
    // Validate all required fields are present (non-empty)
    const validationErrors = [];
    if (!requestPayload.api_key) {
      validationErrors.push('API key is empty');
    } else if (!requestPayload.api_key.startsWith('RGAPI-')) {
      validationErrors.push('API key format invalid (should start with RGAPI-)');
    }
    if (!requestPayload.game_name) {
      validationErrors.push('game_name is empty');
    }
    if (!requestPayload.tag_line) {
      validationErrors.push('tag_line is empty');
    }
    if (!requestPayload.region) {
      validationErrors.push('region is empty');
    } else if (!validRegions.includes(requestPayload.region)) {
      validationErrors.push(`region "${requestPayload.region}" is not a valid Riot API region code`);
    }
    
    if (validationErrors.length > 0) {
      console.error("❌ VALIDATION ERRORS:", validationErrors);
      throw new Error(`Validation failed:\n${validationErrors.map(e => `  • ${e}`).join('\n')}`);
    }
    
    // Log what we're sending (mask API key for security)
    console.log("📤 Request payload:", { 
      api_key: requestPayload.api_key ? '***' : '(empty string)', 
      game_name: requestPayload.game_name, 
      tag_line: requestPayload.tag_line, 
      region: requestPayload.region 
    });
    
    // Log the actual JSON to verify structure
    const jsonPayload = JSON.stringify(requestPayload);
    console.log("📤 JSON payload being sent:", jsonPayload);
    console.log("📤 Payload length:", jsonPayload.length, "bytes");
    
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonPayload, // Use the pre-stringified JSON
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ API Error Response:", errText);
      console.error("❌ Request payload that failed:", {
        api_key: requestPayload.api_key ? '***' : '(empty)',
        game_name: requestPayload.game_name,
        tag_line: requestPayload.tag_line,
        region: requestPayload.region
      });
      console.error("❌ Full JSON payload that was sent:", jsonPayload);
      console.error("❌ Response status:", response.status);
      
      // Parse error for better user messaging
      let errorMessage = `HTTP ${response.status}: ${errText}`;
      let diagnosticInfo = '';
      
      try {
        const errorObj = JSON.parse(errText);
        if (errorObj.error) {
          errorMessage = errorObj.error;
          
          // Check if it's a 403 error (API key issue)
          if (response.status === 403 || errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
            console.error("🔍 ========== 403 ERROR DIAGNOSTICS ==========");
            console.error("  A 403 Forbidden error from Riot API typically means:");
            console.error("  1. API KEY ISSUE (most common):");
            console.error("     - API key is invalid or expired");
            console.error("     - API key doesn't have required permissions");
            console.error("     - API key format is incorrect");
            console.error("  📋 Current API key check:");
            console.error("     - Format:", requestPayload.api_key.startsWith('RGAPI-') ? '✅ Correct' : '❌ Wrong format');
            console.error("     - Length:", requestPayload.api_key.length >= 20 ? `✅ OK (${requestPayload.api_key.length})` : `❌ Too short (${requestPayload.api_key.length})`);
            console.error("  2. ACCOUNT ISSUE:");
            console.error("     - Game name + tag line don't match any account");
            console.error("     - Account doesn't exist in the specified region");
            console.error("     - Account is private or banned");
            console.error("  📋 Current account check:");
            console.error("     - Game Name:", `"${requestPayload.game_name}"`);
            console.error("     - Tag Line:", `"${requestPayload.tag_line}"`);
            console.error("     - Combined:", `"${requestPayload.game_name}#${requestPayload.tag_line}"`);
            console.error("  3. REGION MISMATCH:");
            console.error("     - Account exists but in a different routing region");
            console.error("     - Routing region is incorrect (should be: americas, europe, or asia)");
            console.error("  📋 Current region check:");
            console.error("     - Region:", `"${requestPayload.region}"`);
            console.error("     - Valid:", validRegions.includes(requestPayload.region.toLowerCase()) ? '✅ Yes' : '❌ No');
            console.error("🔍 ==========================================");
            
            diagnosticInfo = '\n\n🔍 DIAGNOSTIC SUMMARY:\n';
            diagnosticInfo += `API Key: ${requestPayload.api_key.startsWith('RGAPI-') && requestPayload.api_key.length >= 20 ? '✅ Format looks OK' : '❌ Format or length issue'}\n`;
            diagnosticInfo += `Game Name: "${requestPayload.game_name}" (${requestPayload.game_name.length} chars)\n`;
            diagnosticInfo += `Tag Line: "${requestPayload.tag_line}" (${requestPayload.tag_line.length} chars)\n`;
            diagnosticInfo += `Region: "${requestPayload.region}" ${validRegions.includes(requestPayload.region.toLowerCase()) ? '✅' : '❌ INVALID (must be: americas, europe, or asia)'}\n`;
            diagnosticInfo += `\n⚠️ MOST COMMON CAUSE: API KEY EXPIRED\n`;
            diagnosticInfo += `Riot API keys expire after 24 hours. If this worked before, your key likely expired.\n\n`;
            diagnosticInfo += `💡 TROUBLESHOOTING (in order of likelihood):\n`;
            diagnosticInfo += `1. 🔑 API KEY EXPIRED (most common) - Get a new key from https://developer.riotgames.com/\n`;
            diagnosticInfo += `   • Log in to Riot Developer Portal\n`;
            diagnosticInfo += `   • Go to "API Keys" section\n`;
            diagnosticInfo += `   • Generate a new key (starts with RGAPI-)\n`;
            diagnosticInfo += `   • Copy and paste it into the API Key field above\n`;
            diagnosticInfo += `2. Check if "${requestPayload.game_name}#${requestPayload.tag_line}" exists in routing region "${requestPayload.region}"\n`;
            diagnosticInfo += `3. Try a different routing region (americas, europe, or asia) if the account might be in another region\n`;
            diagnosticInfo += `4. Verify the account is not private or banned`;
            
            errorMessage = 'Riot API returned 403 Forbidden.' + diagnosticInfo;
          } else if (response.status === 400) {
            console.error("🔍 400 Bad Request - Likely a parameter format issue");
            diagnosticInfo = '\n\n🔍 This usually means:\n';
            diagnosticInfo += '• One or more parameters are in the wrong format\n';
            diagnosticInfo += '• Missing required fields\n';
            diagnosticInfo += '• Invalid region code\n';
            errorMessage += diagnosticInfo;
          } else if (response.status === 404 || response.status === 500) {
            // Check if it's a 404 account not found error
            if (errorMessage.includes('404') || errorMessage.includes('Account lookup failed')) {
              console.error("🔍 ========== 404 ACCOUNT NOT FOUND DIAGNOSTICS ==========");
              console.error("  The account could not be found. This usually means:");
              console.error("  1. ACCOUNT NAME/TAG MISMATCH:");
              console.error("     - The game name and tag line don't match any account");
              console.error("     - Account name is case-sensitive (check capitalization)");
              console.error("     - Account might have been renamed or deleted");
              console.error("  📋 Current account check:");
              console.error("     - Game Name:", `"${requestPayload.game_name}"`);
              console.error("     - Tag Line:", `"${requestPayload.tag_line}"`);
              console.error("     - Combined:", `"${requestPayload.game_name}#${requestPayload.tag_line}"`);
              console.error("  2. REGION MISMATCH:");
              console.error("     - Account exists but in a different region");
              console.error("     - Try: americas, europe, or asia");
              console.error("  📋 Current region check:");
              console.error("     - Region:", `"${requestPayload.region}"`);
              console.error("🔍 ==========================================");
              
              diagnosticInfo = '\n\n🔍 ACCOUNT NOT FOUND - Troubleshooting:\n';
              diagnosticInfo += `1. Verify the account "${requestPayload.game_name}#${requestPayload.tag_line}" exists\n`;
              diagnosticInfo += `   • Check the exact spelling and capitalization\n`;
              diagnosticInfo += `   • Riot account names are case-sensitive\n`;
              diagnosticInfo += `   • Make sure there are no extra spaces before/after the name\n`;
              diagnosticInfo += `2. Try a different region:\n`;
              diagnosticInfo += `   • Current region: "${requestPayload.region}"\n`;
              diagnosticInfo += `   • Try: americas, europe, or asia\n`;
              diagnosticInfo += `3. Verify the account is active and not banned\n`;
              diagnosticInfo += `4. Check if the account name has special characters that need to be entered exactly\n`;
              
              errorMessage = `Account not found: "${requestPayload.game_name}#${requestPayload.tag_line}"` + diagnosticInfo;
            }
          }
        }
      } catch (e) {
        // If error text isn't JSON, use it as-is
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ API Response received:", data);
    console.log("📊 Full API Response structure:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The Lambda function may be experiencing cold start delays. Please try again.');
    }
    console.error("❌ Error fetching player stats:", err);
    throw err;
  }
}

// ✅ Fetch quests from AWS Lambda
// Matches your exact API structure - no api_key needed
async function getQuests(gameName, tagLine, region) {
  const ENDPOINT = "https://03femdw9g5.execute-api.us-east-1.amazonaws.com/default/quests";
  
  // Convert region code to routing region if needed
  const routingRegion = getRoutingRegion(region);
  
  // Add timeout (30 seconds)
  const timeout = 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log("🔄 Fetching quests from Lambda...");
    console.log("📤 Request payload:", { game_name: gameName, tag_line: tagLine, region: routingRegion });
    
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        game_name: gameName,
        tag_line: tagLine,
        region: routingRegion, // Use routing region for quests API
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Quests API Error Response:", errText);
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log("✅ Quests API Response received:", data);
    console.log("📊 Full Quests Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Quest request timed out. Please try again.');
    }
    console.error("❌ Error fetching quests:", err);
    throw err;
  }
}

// ✅ Fetch AI-generated feedback from AWS Lambda
// Generates roast and compliment feedback for matches using AI
async function getAIFeedback(player, matchSummaries) {
  // TODO: Replace this URL with your actual Lambda feedback endpoint after deployment
  // The endpoint should be your API Gateway URL for the feedback Lambda function
  const ENDPOINT = "https://xewn6ahmh9.execute-api.us-east-1.amazonaws.com/default/quests";
  
  // Add timeout (30 seconds - AI calls can take time)
  const timeout = 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log("🤖 Fetching AI feedback from Lambda...");
    console.log("📊 Matches to analyze:", matchSummaries.length);
    
    // Log champion info for each match being sent
    matchSummaries.forEach((match, index) => {
      console.log(`  Match ${index + 1}: Champion: ${match.champion}, Role: ${match.role}, KDA: ${match.kills}/${match.deaths}/${match.assists}`);
    });
    
    // Get region from user credentials
    const region = userCredentials.region || 'americas';
    const routingRegion = getRoutingRegion(region);
    
    // Prepare the request payload matching the Lambda function's expected input
    // The Lambda expects game_name, tag_line, and region at the top level
    const gameName = player.gameName || player.game_name || userCredentials.gameName || '';
    const tagLine = player.tagLine || player.tag_line || userCredentials.tagLine || '';
    
    // CRITICAL: Ensure we're only analyzing ONE match at a time
    // If multiple matches are sent, the Lambda might get confused
    const singleMatch = matchSummaries.length === 1 ? matchSummaries[0] : null;
    
    if (!singleMatch) {
      throw new Error(`Expected exactly 1 match, but received ${matchSummaries.length} matches`);
    }
    
    // Extract champion and role from the SINGLE match being analyzed
    const targetChampion = singleMatch.champion;
    const targetRole = singleMatch.role;
    const targetKDA = `${singleMatch.kills}/${singleMatch.deaths}/${singleMatch.assists}`;
    
    console.log(`🎯 TARGET MATCH FOR FEEDBACK:`);
    console.log(`   Champion: ${targetChampion}`);
    console.log(`   Role: ${targetRole}`);
    console.log(`   KDA: ${targetKDA}`);
    console.log(`   CS: ${singleMatch.cs}`);
    console.log(`   Damage: ${singleMatch.damage}`);
    console.log(`   Gold: ${singleMatch.gold}`);
    
    // Build request payload with explicit single match focus
    // CRITICAL: Add explicit instruction to ONLY analyze the match we send
    const requestPayload = {
      game_name: gameName,
      tag_line: tagLine,
      region: routingRegion,
      // Explicitly mark this as a single match analysis
      singleMatch: true,
      targetChampion: targetChampion,
      targetRole: targetRole,
      // CRITICAL INSTRUCTION: Only analyze the matchSummaries we send, ignore any other data
      instruction: `IMPORTANT: Analyze ONLY the single match in matchSummaries array. The champion is ${targetChampion} playing ${targetRole}. Ignore any other match data. Generate feedback specifically for this ${targetChampion} ${targetRole} game only.`,
      player: {
        puuid: player.puuid || '',
        gameName: gameName,
        tagLine: tagLine
      },
      // Send ONLY the single match being analyzed - Lambda MUST use this, not quests data
      matchSummaries: [singleMatch],
      // Add a flag to tell Lambda to ignore quests data
      ignoreQuestsData: true,
      useOnlyProvidedMatches: true,
      feedback: {
        roast: "",
        compliment: ""
      }
    };
    
    console.log("📤 Sending request to Lambda:", {
      game_name: gameName,
      tag_line: tagLine,
      region: routingRegion,
      matchCount: 1, // Always 1 for single match analysis
      targetChampion: targetChampion,
      targetRole: targetRole,
      singleMatch: true
    });
    
    // Log the exact payload being sent
    console.log("📋 Full payload being sent:", JSON.stringify(requestPayload, null, 2));
    
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Lambda Error Response:", errorText);
      
      let errorMessage = `HTTP ${response.status}: ${errorText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        // Not JSON, use text as-is
      }
      
      throw new Error(errorMessage);
    }

    // Try to parse JSON response
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Try to parse as JSON even if content-type is wrong
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
      }
    }
    
    console.log("✅ AI Feedback received:", data);
    console.log("📋 Response structure:", {
      hasFeedback: !!data.feedback,
      hasRoast: !!data.roast,
      hasCompliment: !!data.compliment,
      hasContent: !!data.content,
      contentType: data.content ? typeof data.content : 'none',
      matchSummariesInResponse: data.matchSummaries ? data.matchSummaries.length : 0
    });
    
    // WARNING: If Lambda returns multiple matches, it's ignoring our single match request
    if (data.matchSummaries && data.matchSummaries.length > 1) {
      console.error("⚠️ WARNING: Lambda returned", data.matchSummaries.length, "matches but we only sent 1!");
      console.error("   This means Lambda is using quests data instead of our single match.");
      console.error("   Champions in response:", data.matchSummaries.map(m => m.champion).join(", "));
      console.error("   We requested feedback for:", targetChampion);
    }
    
    // Extract feedback from response
    // Handle different possible response structures
    
    // Case 1: Direct feedback object
    if (data.feedback && typeof data.feedback === 'object') {
      // Check if both roast and compliment are already parsed
      if (data.feedback.roast && data.feedback.compliment && 
          typeof data.feedback.roast === 'string' && 
          typeof data.feedback.compliment === 'string' &&
          !data.feedback.compliment.includes('"content"')) {
        console.log("✅ Found feedback in data.feedback (already parsed)");
        return data.feedback; // { roast: "...", compliment: "..." }
      }
      
      // If compliment is a Claude API response string, parse it
      if (data.feedback.compliment && typeof data.feedback.compliment === 'string' && 
          data.feedback.compliment.includes('"content"')) {
        console.log("✅ Found feedback object with Claude API response in compliment, parsing...");
        try {
          // Try to parse the compliment string - it might be truncated or malformed
          let parsedCompliment;
          try {
            parsedCompliment = JSON.parse(data.feedback.compliment);
          } catch (parseError) {
            console.warn("⚠️ First parse attempt failed, trying to fix JSON...");
            // Try to extract just the text content if JSON is malformed
            const textMatch = data.feedback.compliment.match(/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            if (textMatch && textMatch[1]) {
              // Unescape the JSON string
              const unescapedText = textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
              try {
                const innerParsed = JSON.parse(unescapedText);
                return {
                  roast: data.feedback.roast || innerParsed.roast || "Parse Error",
                  compliment: innerParsed.compliment || "Parse Error"
                };
              } catch (innerError) {
                console.error("❌ Error parsing inner JSON:", innerError);
                throw parseError; // Re-throw original error
              }
            }
            throw parseError; // Re-throw if we can't fix it
          }
          
          if (parsedCompliment.content && Array.isArray(parsedCompliment.content)) {
            const textContent = parsedCompliment.content.find(c => c.type === 'text' && c.text);
            if (textContent && textContent.text) {
              try {
                const innerParsed = JSON.parse(textContent.text);
                return {
                  roast: data.feedback.roast || innerParsed.roast || "Parse Error",
                  compliment: innerParsed.compliment || "Parse Error"
                };
              } catch (innerError) {
                console.error("❌ Error parsing inner text JSON:", innerError);
                // If inner JSON is malformed, try to extract roast/compliment directly from text
                const text = textContent.text;
                const roastMatch = text.match(/"roast"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
                const complimentMatch = text.match(/"compliment"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
                
                if (roastMatch || complimentMatch) {
                  return {
                    roast: roastMatch ? roastMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : (data.feedback.roast || "Parse Error"),
                    compliment: complimentMatch ? complimentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : "Parse Error"
                  };
                }
              }
            }
          }
        } catch (e) {
          console.error("❌ Error parsing feedback.compliment:", e);
          console.error("   Compliment string length:", data.feedback.compliment?.length);
          console.error("   First 500 chars:", data.feedback.compliment?.substring(0, 500));
        }
      }
      
      // If roast is "Parse Error" or similar, try to get it from elsewhere
      if (data.feedback.roast === "Parse Error" || !data.feedback.roast) {
        console.log("⚠️ Roast is missing or 'Parse Error', checking other sources...");
      }
    }
    
    // Case 2: Direct roast/compliment at top level
    if (data.roast && data.compliment) {
      console.log("✅ Found roast/compliment at top level");
      return { roast: data.roast, compliment: data.compliment };
    }
    
    // Case 3: Claude API response structure (content array with text)
    if (data.content && Array.isArray(data.content)) {
      console.log("✅ Found Claude API response structure");
      try {
        // Find the text content
        const textContent = data.content.find(c => c.type === 'text' && c.text);
        if (textContent && textContent.text) {
          console.log("📝 Found text content, parsing JSON...");
          // The text is a JSON string, parse it
          const parsedText = JSON.parse(textContent.text);
          
          if (parsedText.roast && parsedText.compliment) {
            console.log("✅ Successfully extracted roast and compliment from Claude response");
            return {
              roast: parsedText.roast,
              compliment: parsedText.compliment
            };
          } else if (parsedText.feedback) {
            // Sometimes it's nested in feedback
            return parsedText.feedback;
          }
        }
      } catch (e) {
        console.error("❌ Error parsing Claude API response:", e);
        console.error("   Text content:", textContent?.text?.substring(0, 200));
      }
    }
    
    // Case 4: Feedback is a string that needs parsing
    if (typeof data.feedback === 'string') {
      console.log("✅ Found feedback as string, parsing...");
      try {
        const parsed = JSON.parse(data.feedback);
        if (parsed.roast && parsed.compliment) {
          return parsed;
        } else if (parsed.feedback) {
          return parsed.feedback;
        }
      } catch (e) {
        console.error("❌ Error parsing feedback string:", e);
      }
    }
    
    // Case 5: Compliment is a string (like in the user's example)
    if (data.compliment && typeof data.compliment === 'string' && data.compliment.includes('"content"')) {
      console.log("✅ Found compliment as Claude API response string, parsing...");
      try {
        const parsedCompliment = JSON.parse(data.compliment);
        if (parsedCompliment.content && Array.isArray(parsedCompliment.content)) {
          const textContent = parsedCompliment.content.find(c => c.type === 'text' && c.text);
          if (textContent && textContent.text) {
            const innerParsed = JSON.parse(textContent.text);
            return {
              roast: innerParsed.roast || data.roast || "Parse Error",
              compliment: innerParsed.compliment || "Parse Error"
            };
          }
        }
      } catch (e) {
        console.error("❌ Error parsing compliment string:", e);
      }
    }
    
    // Fallback: Return what we can find or error messages
    console.warn("⚠️ Could not parse feedback from response, using fallback");
    return {
      roast: data.roast || data.feedback?.roast || "Failed to generate roast - response format not recognized",
      compliment: data.compliment || data.feedback?.compliment || "Failed to generate compliment - response format not recognized"
    };
    
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      throw new Error('AI feedback request timed out. The AI is taking longer than expected.');
    }
    
    console.error("❌ Error fetching AI feedback:", err);
    throw err;
  }
}

// Fetch League data from AWS Lambda APIs
async function fetchLeagueData(showLoading = true, forceRefresh = false) {
  // Check if we have user credentials
  if (!userCredentials.gameName || !userCredentials.tagLine || !userCredentials.region) {
    console.warn("No user credentials found");
    throw new Error("Please enter your account information to load data");
  }
  
  // If data is already loaded and not forcing refresh, return immediately
  if (!forceRefresh && dataLoadState.isLoaded && leagueData.matches.length > 0) {
    console.log("✅ Using cached data - instant load");
    return Promise.resolve();
  }
  
  // If already loading, return the existing promise
  if (dataLoadState.isLoading && dataLoadState.loadPromise) {
    console.log("⏳ Data already loading, waiting for existing request...");
    return dataLoadState.loadPromise;
  }
  
  // Mark as loading and create promise
  dataLoadState.isLoading = true;
  const loadPromise = (async () => {
    try {
      if (showLoading) {
        $('#dynamicContent').html(`
          <div class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
            <p class="text-gray-400">Loading player data from API...</p>
            <p class="text-gray-500 text-sm mt-2">This may take 10-30 seconds on first request (cold start)</p>
          </div>
        `);
      }

        console.log("🚀 Starting data fetch...");
        const startTime = Date.now();
        
        // Fetch player stats (match data, rank, champions, etc.)
        // Lambda requires api_key field in request body
        const defaultApiKey = 'RGAPI-47148504-2d76-4d11-93aa-2e7db404f98f';
        const apiKeyToUse = userCredentials.apiKey || defaultApiKey;
        
        console.log("📤 Calling getPlayerStats with:", {
          apiKey: '***',
          gameName: userCredentials.gameName,
          tagLine: userCredentials.tagLine,
          region: userCredentials.region
        });
        
        // Ensure we have all required fields
        if (!userCredentials.gameName || !userCredentials.tagLine || !userCredentials.region) {
          throw new Error("Missing required fields: game_name, tag_line, or region");
        }
        
        const playerStats = await getPlayerStats(
          apiKeyToUse,
          userCredentials.gameName,
          userCredentials.tagLine,
          userCredentials.region
        );

        const statsTime = Date.now() - startTime;
        console.log(`⏱️ Player stats fetched in ${statsTime}ms`);

        // Fetch quests
        let questsData = null;
        try {
          questsData = await getQuests(
            userCredentials.gameName,
            userCredentials.tagLine,
            userCredentials.region
          );
          const questsTime = Date.now() - startTime - statsTime;
          console.log(`⏱️ Quests fetched in ${questsTime}ms`);
        } catch (questErr) {
          console.warn("Failed to fetch quests, will generate locally:", questErr);
        }

        // Map API response to leagueData structure
        console.log("🔄 Starting data mapping...");
        mapAPIDataToLeagueData(playerStats, questsData);
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ All data loaded in ${totalTime}ms`);
        console.log("📋 Final leagueData structure after mapping:", {
          hasRank: !!leagueData.currentRank,
          rank: leagueData.currentRank,
          matchesCount: leagueData.matches.length,
          championsCount: leagueData.mostPlayedChampions.length,
          questsCount: leagueData.quests.length,
          pastSeasonsCount: leagueData.pastSeasonRanks.length
        });
        console.log("📋 Full leagueData object:", JSON.stringify(leagueData, null, 2));
        
        // Ensure data is available even if API structure is different
        if (!leagueData.currentRank) {
          console.warn("⚠️ No rank data found, setting default");
          leagueData.currentRank = { tier: 'Unranked', division: 'IV', lp: 0 };
        }
        
        if (leagueData.matches.length === 0) {
          console.warn("⚠️ No matches found in API response");
        }
        
        // Verify data was actually set
        if (leagueData.matches.length === 0 && leagueData.mostPlayedChampions.length === 0 && !leagueData.currentRank) {
          console.error("❌ CRITICAL: No data was mapped from API! Check the mapping function.");
        }
        
        // Mark data as loaded
        dataLoadState.isLoaded = true;
        dataLoadState.isLoading = false;
        dataLoadState.lastLoadTime = Date.now();
        dataLoadState.loadPromise = null;
        
        return Promise.resolve();
      } catch (error) {
        console.error("❌ Error fetching League data:", error);
        console.error("❌ Error details:", error.stack);
        
        // Mark as not loading anymore
        dataLoadState.isLoading = false;
        dataLoadState.loadPromise = null;
        
        if (showLoading) {
          // Format error message - check if it's a 403/API key issue
          let errorMsg = error.message;
          let errorDetails = '';
          
          if (error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('Account lookup failed')) {
            errorDetails = `
              <div class="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
                <h4 class="text-yellow-400 font-semibold mb-2">⚠️ 403 Forbidden Error</h4>
                <p class="text-yellow-300 text-sm mb-2">The Riot API returned a 403 error. This usually means:</p>
                <ul class="text-yellow-300 text-sm list-disc list-inside space-y-1">
                  <li>The API key may be invalid or expired</li>
                  <li>The API key may not have the required permissions</li>
                  <li>The player account may not exist or may be private</li>
                  <li>The region code might be incorrect</li>
                </ul>
                <p class="text-yellow-300 text-sm mt-3"><strong>Note:</strong> Riot API keys expire after 24 hours. You may need to generate a new key.</p>
              </div>
            `;
            errorMsg = 'Riot API returned 403 Forbidden. Please check the API key and account information.';
          }
          
          $('#dynamicContent').html(`
            <div class="bg-red-900/20 border border-red-500 rounded-lg p-6">
              <h3 class="text-red-400 font-semibold mb-2">Error Loading Data</h3>
              <p class="text-gray-300 mb-4">${errorMsg}</p>
              ${errorDetails}
              <p class="text-gray-400 text-sm mt-4 mb-4">Check browser console (F12) for technical details.</p>
              <div class="mt-4 space-x-2">
                <button onclick="fetchLeagueData(true, true)" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded">
                  Retry
                </button>
                <button onclick="handleLogout()" class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded">
                  Try Different Account
                </button>
              </div>
            </div>
          `);
        }
        
        // Don't fall back to mock data automatically - let user decide
        throw error; // Re-throw so caller can handle it
      }
    })();
  
  // Store promise for reuse
  dataLoadState.loadPromise = loadPromise;
  return loadPromise;
}

// Calculate OP Score based on role-specific formulas
function calculateOpScore(player, role, matchData) {
  // Normalize role to match formula names
  const normalizedRole = (role || '').toLowerCase();
  const isJungle = normalizedRole.includes('jungle') || normalizedRole === 'jg';
  const isMid = normalizedRole.includes('mid') || normalizedRole.includes('middle') || normalizedRole === 'mid';
  const isADC = normalizedRole.includes('adc') || normalizedRole.includes('bot') || normalizedRole === 'adc';
  const isSupport = normalizedRole.includes('support') || normalizedRole.includes('sup') || normalizedRole === 'support';
  
  // Extract player stats
  const kills = player.kills || player.k || 0;
  const deaths = player.deaths || player.d || 0;
  const assists = player.assists || player.a || 0;
  const kda = deaths > 0 ? (kills + assists) / deaths : (kills + assists);
  
  // Get match duration in minutes (default to 25 if not provided)
  const dur = matchData.duration || matchData.gameDuration || matchData.gameLength || 25;
  const durMinutes = typeof dur === 'number' ? (dur > 100 ? dur / 60 : dur) : 25; // Convert seconds to minutes if needed
  
  // Calculate team totals
  const teamKills = matchData.teamKills || matchData.totalKills || (kills + assists + 10); // Fallback estimate
  const teamDmg = matchData.teamDamage || matchData.totalDamageDealtToChampions || 100000; // Fallback estimate
  
  // Extract additional stats
  const totalDamageDealtToChampions = player.totalDamageDealtToChampions || player.damageDealt || player.damage || 0;
  const totalDamageTaken = player.totalDamageTaken || player.damageTaken || 0;
  const visionScore = player.visionScore || player.vision || 0;
  const cs = player.cs || player.creepScore || player.totalMinionsKilled || (player.csPerMin ? player.csPerMin * durMinutes : 0);
  const goldEarned = player.goldEarned || player.gold || player.goldEarned || 0;
  const goldRate = goldEarned / Math.max(durMinutes, 1);
  const turretTakedowns = player.turretTakedowns || player.turretKills || 0;
  const dragonKills = player.dragonKills || player.dragonKills || 0;
  const baronKills = player.baronKills || player.baronKills || 0;
  
  // Calculate damage ratio
  const dmgRatio = teamDmg > 0 ? (totalDamageDealtToChampions / teamDmg) : 0;
  
  let opScore = 0;
  
  if (isJungle) {
    // Jungle: 0.35 * kda + 0.25 * (((dragonKills || 0) + (baronKills || 0)) / dur) + 0.15 * ((visionScore || 0) / dur) + 0.15 * (goldRate / 500) + 0.1 * ((totalDamageDealtToChampions || 0) / teamDmg)
    const objectiveScore = ((dragonKills || 0) + (baronKills || 0)) / Math.max(durMinutes, 1);
    const visionScorePerMin = (visionScore || 0) / Math.max(durMinutes, 1);
    const goldRateScore = goldRate / 500;
    const dmgContribution = (totalDamageDealtToChampions || 0) / Math.max(teamDmg, 1);
    
    opScore = 0.35 * kda + 
              0.25 * objectiveScore + 
              0.15 * visionScorePerMin + 
              0.15 * goldRateScore + 
              0.1 * dmgContribution;
  } else if (isMid) {
    // Middle: 0.3 * kda + 0.25 * ((kills + assists) / teamKills) + 0.25 * dmgRatio + 0.1 * (cs / dur) + 0.1 * (goldRate / 500)
    const killParticipation = (kills + assists) / Math.max(teamKills, 1);
    const csPerMin = cs / Math.max(durMinutes, 1);
    const goldRateScore = goldRate / 500;
    
    opScore = 0.3 * kda + 
              0.25 * killParticipation + 
              0.25 * dmgRatio + 
              0.1 * csPerMin + 
              0.1 * goldRateScore;
  } else if (isADC) {
    // ADC: 0.4 * ((totalDamageDealtToChampions || 0) / teamDmg) + 0.25 * kda + 0.15 * (cs / dur) + 0.1 * (goldRate / 500) + 0.1 * (1 - deaths / Math.max(1, dur))
    const dmgContribution = (totalDamageDealtToChampions || 0) / Math.max(teamDmg, 1);
    const csPerMin = cs / Math.max(durMinutes, 1);
    const goldRateScore = goldRate / 500;
    const survivalRate = 1 - (deaths / Math.max(durMinutes, 1));
    
    opScore = 0.4 * dmgContribution + 
              0.25 * kda + 
              0.15 * csPerMin + 
              0.1 * goldRateScore + 
              0.1 * survivalRate;
  } else if (isSupport) {
    // Support: 0.35 * kda + 0.3 * ((visionScore || 0) / dur) + 0.15 * (assists / teamKills) + 0.1 * (((totalDamageTaken || 0) / dur) / Math.max(1, (totalDamageDealtToChampions || 0) / dur)) + 0.1 * (((turretTakedowns || 0) + (dragonKills || 0) + (baronKills || 0)) / 5)
    const visionScorePerMin = (visionScore || 0) / Math.max(durMinutes, 1);
    const assistParticipation = assists / Math.max(teamKills, 1);
    const damageTakenPerMin = (totalDamageTaken || 0) / Math.max(durMinutes, 1);
    const damageDealtPerMin = (totalDamageDealtToChampions || 0) / Math.max(durMinutes, 1);
    const tankRatio = damageTakenPerMin / Math.max(damageDealtPerMin, 1);
    const objectiveScore = ((turretTakedowns || 0) + (dragonKills || 0) + (baronKills || 0)) / 5;
    
    opScore = 0.35 * kda + 
              0.3 * visionScorePerMin + 
              0.15 * assistParticipation + 
              0.1 * tankRatio + 
              0.1 * objectiveScore;
  } else {
    // Default/OP (Top): 0.3 * kda + 0.25 * dmgRatio + 0.2 * (goldRate / 500) + 0.15 * ((turretTakedowns || 0) / 5) + 0.1 * (cs / dur)
    const goldRateScore = goldRate / 500;
    const turretScore = (turretTakedowns || 0) / 5;
    const csPerMin = cs / Math.max(durMinutes, 1);
    
    opScore = 0.3 * kda + 
              0.25 * dmgRatio + 
              0.2 * goldRateScore + 
              0.15 * turretScore + 
              0.1 * csPerMin;
  }
  
  // Scale to 0-100 range (multiply by appropriate factor)
  // Typical scores range from 0-10, so multiply by 10 to get 0-100
  return Math.max(0, Math.min(100, opScore * 10));
}

// Map API response data to the expected leagueData structure
function mapAPIDataToLeagueData(playerStats, questsData) {
  console.log("🔍 Mapping API data. PlayerStats keys:", Object.keys(playerStats || {}));
  console.log("🔍 PlayerStats structure:", playerStats);
  
  // Initialize player level
  leagueData.playerLevel = {
    level: 1,
    totalXP: 0,
    xpForNextLevel: 100,
    xpIntoCurrentLevel: 0,
    xpNeededToLevel: 100
  };

  // Map current rank - Lambda function now includes rank field
  // Try multiple possible field names and structures
  let rankData = null;
  
  // Check for rank in various locations
  if (playerStats.rank) {
    rankData = playerStats.rank;
  } else if (playerStats.currentRank) {
    rankData = playerStats.currentRank;
  } else if (playerStats.ranked) {
    rankData = playerStats.ranked;
  } else if (playerStats.rankInfo) {
    rankData = playerStats.rankInfo;
  }
  
  if (rankData) {
    console.log("📈 Rank data found:", rankData);
    
    // Handle different rank data structures
    let tier = 'Unranked';
    let division = 'IV';
    let lp = 0;
    
    // Case 1: Rank is an object with tier, division, lp fields
    if (typeof rankData === 'object' && !Array.isArray(rankData)) {
      tier = rankData.tier || rankData.rankTier || rankData.tierName || 
            (rankData.rank ? rankData.rank.split(' ')[0] : null) || 'Unranked';
      division = rankData.division || rankData.rankDivision || 
                (rankData.rank ? rankData.rank.split(' ')[1] : null) || 'IV';
      lp = rankData.lp || rankData.leaguePoints || rankData.league_points || 
           rankData.leaguepoints || 0;
    }
    // Case 2: Rank is a string like "Diamond III" or "Diamond III 67 LP"
    else if (typeof rankData === 'string') {
      const rankParts = rankData.trim().split(/\s+/);
      if (rankParts.length >= 2) {
        tier = rankParts[0];
        division = rankParts[1];
        // Check if LP is in the string (e.g., "Diamond III 67")
        if (rankParts.length >= 3 && !isNaN(parseInt(rankParts[2]))) {
          lp = parseInt(rankParts[2]);
        }
      } else if (rankParts.length === 1) {
        tier = rankParts[0];
      }
    }
    
    leagueData.currentRank = {
      tier: tier,
      division: division,
      lp: parseInt(lp) || 0
    };
    console.log("✅ Mapped current rank:", leagueData.currentRank);
  } else {
    console.warn("⚠️ No rank data found in API response. Available keys:", Object.keys(playerStats || {}));
    // Set default rank if none found
    leagueData.currentRank = { tier: 'Unranked', division: 'IV', lp: 0 };
  }

  // Map past season ranks (adjust based on actual API response)
  if (playerStats.pastSeasonRanks || playerStats.seasonHistory) {
    leagueData.pastSeasonRanks = (playerStats.pastSeasonRanks || playerStats.seasonHistory || []).map(season => ({
      season: season.season || season.name || `Season ${season.year}`,
      rank: season.rank || season.tier || 'Unranked'
    }));
  }

  // Map most played champions (adjust based on actual API response)
  const champions = playerStats.mostPlayedChampions || playerStats.champions || playerStats.championStats || 
                   playerStats.topChampions || playerStats.champion_stats || [];
  
  if (champions.length > 0) {
    console.log(`🏆 Found ${champions.length} champions in API response`);
    leagueData.mostPlayedChampions = champions.map(champ => ({
      name: champ.name || champ.championName || champ.champion || champ.champName || 'Unknown',
      games: champ.games || champ.gamesPlayed || champ.totalGames || champ.total_games || 0,
      winRate: champ.winRate ? `${champ.winRate}%` : 
               (champ.wins && champ.losses) ? `${Math.round((champ.wins / (champ.wins + champ.losses)) * 100)}%` :
               champ.winrate || champ.win_rate || '0%'
    })).sort((a, b) => b.games - a.games).slice(0, 5);
    console.log("✅ Mapped champions:", leagueData.mostPlayedChampions);
  } else {
    console.warn("⚠️ No champion data found in API response");
    leagueData.mostPlayedChampions = [];
  }

  // Map match history (adjust based on actual API response)
  // Try multiple possible field names for match history
  const matches = playerStats.matches || playerStats.matchHistory || playerStats.match_history || 
                  playerStats.games || playerStats.recentMatches || playerStats.recent_matches || 
                  playerStats.match_data || [];
  
  console.log(`🎮 Found ${matches.length} matches in API response`);
  if (matches.length > 0) {
    console.log("📋 Sample match structure:", JSON.stringify(matches[0], null, 2));
    console.log("📋 Sample match keys:", Object.keys(matches[0]));
    
    // Check for player roster in various places
    const sampleMatch = matches[0];
    if (sampleMatch.playerRoster) {
      console.log("✅ Found playerRoster field with", sampleMatch.playerRoster.length, "players");
    } else if (sampleMatch.participants) {
      console.log("✅ Found participants field with", sampleMatch.participants.length, "participants");
    } else if (sampleMatch.players) {
      console.log("✅ Found players field with", sampleMatch.players.length, "players");
    } else if (sampleMatch.teams) {
      console.log("✅ Found teams field with", sampleMatch.teams.length, "teams");
    } else {
      console.warn("⚠️ No player roster found in sample match. Available fields:", Object.keys(sampleMatch));
    }
  }
  
  if (matches.length > 0) {
    leagueData.matches = matches.map((match, index) => {
      // Find player data in roster - try multiple ways to identify the player
      let playerData = null;
      
      // Method 1: Look for isYou flag
      if (match.playerRoster && Array.isArray(match.playerRoster)) {
        playerData = match.playerRoster.find(p => p.isYou === true || p.isYou === 'true' || p.is_you === true);
      }
      
      // Method 2: Look in participants
      if (!playerData && match.participants && Array.isArray(match.participants)) {
        playerData = match.participants.find(p => p.isYou === true || p.isYou === 'true' || p.is_you === true);
      }
      
      // Method 3: Use playerData directly
      if (!playerData && match.playerData) {
        playerData = match.playerData;
      }
      
      // Method 4: If playerRoster exists but no isYou flag, use first entry or search by Riot ID (gameName#tagLine)
      if (!playerData && match.playerRoster && Array.isArray(match.playerRoster) && match.playerRoster.length > 0) {
        // Try to find by matching Riot ID (gameName#tagLine)
        if (userCredentials.gameName && userCredentials.tagLine) {
          const searchName = `${userCredentials.gameName}#${userCredentials.tagLine}`.toLowerCase();
          playerData = match.playerRoster.find(p => {
            const playerName = (p.player || p.riotId || p.gameName || p.name || '').toLowerCase();
            return playerName.includes(searchName) || playerName.includes(userCredentials.gameName.toLowerCase());
          });
        }
        // If still not found, use first player (assume it's the player)
        if (!playerData) {
          playerData = match.playerRoster[0];
        }
      }
      
      // Extract KDA - API format is "kills/deaths/assists"
      let kdaString = '0/0/0';
      let parsedKills = 0;
      let parsedAssists = 0;
      let parsedDeaths = 0;
      
      if (match.kda && typeof match.kda === 'string') {
        kdaString = match.kda;
        // Parse KDA string: format is "kills/deaths/assists"
        const kdaParts = kdaString.split('/');
        if (kdaParts.length === 3) {
          parsedKills = parseInt(kdaParts[0]) || 0;
          parsedDeaths = parseInt(kdaParts[1]) || 0;
          parsedAssists = parseInt(kdaParts[2]) || 0;
        }
      } else if (playerData) {
        parsedKills = playerData.kills || playerData.k || 0;
        parsedDeaths = playerData.deaths || playerData.d || 0;
        parsedAssists = playerData.assists || playerData.a || 0;
        // Format as "kills/deaths/assists" to match API format
        kdaString = `${parsedKills}/${parsedDeaths}/${parsedAssists}`;
      } else if (match.kills !== undefined || match.deaths !== undefined || match.assists !== undefined) {
        parsedKills = match.kills || 0;
        parsedDeaths = match.deaths || 0;
        parsedAssists = match.assists || 0;
        kdaString = `${parsedKills}/${parsedDeaths}/${parsedAssists}`;
      }
      
      // Extract win status - try multiple formats
      let winStatus = false;
      if (match.win !== undefined) {
        winStatus = match.win === true || match.win === 'true' || match.win === 1;
      } else if (match.gameResult) {
        winStatus = match.gameResult === 'Win' || match.gameResult === 'Victory' || match.gameResult === 'win';
      } else if (match.result) {
        winStatus = match.result === 'Win' || match.result === 'Victory' || match.result === 'win';
      } else if (match.victory !== undefined) {
        winStatus = match.victory === true || match.victory === 'true' || match.victory === 1;
      } else if (playerData && playerData.win !== undefined) {
        winStatus = playerData.win === true || playerData.win === 'true' || playerData.win === 1;
      }
      
      // Calculate OP Score for the player using role-specific formula
      let opScore = 75; // Default fallback
      if (playerData) {
        const matchDataForOpScore = {
          duration: match.duration || match.gameDuration || match.gameLength || 25,
          teamKills: match.teamKills || match.totalKills || 0,
          teamDamage: match.teamDamage || match.totalDamageDealtToChampions || 0
        };
        opScore = calculateOpScore(playerData, role, matchDataForOpScore);
      } else if (match.opScore || match.op_score || match.score || match.performanceScore) {
        // Fallback to API-provided score if playerData not available
        opScore = match.opScore || match.op_score || match.score || match.performanceScore || 75;
      }
      
      // Extract date - try multiple formats
      let dateString = new Date().toISOString().split('T')[0];
      if (match.date) {
        dateString = match.date;
      } else if (match.gameCreation) {
        // Convert timestamp to date string
        const date = new Date(match.gameCreation);
        dateString = date.toISOString().split('T')[0];
      } else if (match.timestamp) {
        const date = new Date(match.timestamp);
        dateString = date.toISOString().split('T')[0];
      } else if (match.gameEndTimestamp) {
        const date = new Date(match.gameEndTimestamp);
        dateString = date.toISOString().split('T')[0];
      }
      
      // Extract champion - try multiple field names
      const champion = match.champion || match.championName || match.champion_name || 
                      match.champ || playerData?.champion || playerData?.championName || 'Unknown';
      
      // Extract role - try multiple field names
      const role = match.role || match.lane || match.position || match.teamPosition || 
                  playerData?.role || playerData?.lane || playerData?.position || 'Unknown';
      
      // Extract position (rank in match)
      const position = match.position || match.rank || match.rankPosition || 
                      playerData?.position || playerData?.rank || 5;
      
      // Extract player roster - try all possible field names
      let playerRoster = match.playerRoster || match.participants || match.players || 
                        match.team1 || match.team2 || match.allPlayers || 
                        match.roster || match.player_list || [];
      
      // If still not found, check if it's nested
      if (!playerRoster || (Array.isArray(playerRoster) && playerRoster.length === 0)) {
        // Try nested structures
        if (match.teams && Array.isArray(match.teams)) {
          // Flatten teams array
          playerRoster = match.teams.flatMap(team => team.players || team.members || []);
        } else if (match.team1 && match.team2) {
          // Combine team1 and team2
          playerRoster = [...(match.team1.players || match.team1 || []), ...(match.team2.players || match.team2 || [])];
        }
      }
      
      if (!Array.isArray(playerRoster)) {
        console.warn(`⚠️ Match ${index + 1}: playerRoster is not an array. Type: ${typeof playerRoster}, Value:`, playerRoster);
        console.log(`   Available match keys:`, Object.keys(match));
        playerRoster = [];
      }
      
      if (playerRoster.length === 0) {
        console.warn(`⚠️ Match ${index + 1}: No player roster found. Available match fields:`, Object.keys(match));
        console.log(`   Full match object:`, JSON.stringify(match, null, 2));
      } else {
        console.log(`✅ Match ${index + 1}: Found ${playerRoster.length} players in roster`);
      }
      
      // Calculate team totals for OP Score calculation
      let teamKills = 0;
      let teamDamage = 0;
      playerRoster.forEach(p => {
        teamKills += (p.kills || p.k || 0) + (p.assists || p.a || 0);
        teamDamage += p.totalDamageDealtToChampions || p.damageDealt || p.damage || 0;
      });
      
      // Match data for OP Score calculation
      const matchDataForOpScore = {
        duration: match.duration || match.gameDuration || match.gameLength || 25,
        teamKills: match.teamKills || match.totalKills || teamKills,
        teamDamage: match.teamDamage || match.totalDamageDealtToChampions || teamDamage
      };
      
      // Ensure each player in roster has required fields and calculate OP Score
      playerRoster = playerRoster.map((p, idx) => {
        const playerRole = p.role || p.lane || p.position || role || 'Unknown';
        
        // Parse KDA from API - format is "kills/deaths/assists"
        let playerKills = 0;
        let playerAssists = 0;
        let playerDeaths = 0;
        
        if (p.kda && typeof p.kda === 'string') {
          // Parse KDA string: format is "kills/deaths/assists"
          const kdaParts = p.kda.split('/');
          if (kdaParts.length === 3) {
            playerKills = parseInt(kdaParts[0]) || 0;
            playerDeaths = parseInt(kdaParts[1]) || 0;
            playerAssists = parseInt(kdaParts[2]) || 0;
          }
        } else {
          // Fallback to individual fields
          playerKills = p.kills || p.k || 0;
          playerDeaths = p.deaths || p.d || 0;
          playerAssists = p.assists || p.a || 0;
        }
        
        // Calculate OP Score using role-specific formula
        const calculatedOpScore = calculateOpScore({
          ...p,
          kills: playerKills,
          deaths: playerDeaths,
          assists: playerAssists
        }, playerRole, matchDataForOpScore);
        
        return {
          player: p.player || p.riotId || p.gameName || p.name || `Player ${idx + 1}`,
          champion: p.champion || p.championName || 'Unknown',
          role: playerRole,
          kills: playerKills,
          deaths: playerDeaths,
          assists: playerAssists,
          kda: p.kda || `${playerKills}/${playerDeaths}/${playerAssists}`, // Store original KDA string
          score: calculatedOpScore, // Use calculated OP Score
          opScore: calculatedOpScore,
          position: p.position || p.rank || idx + 1,
          isYou: p.isYou === true || p.isYou === 'true' || p.is_you === true || 
                 (p.player && userCredentials.gameName && p.player.toLowerCase().includes(userCredentials.gameName.toLowerCase())),
          goldEarned: p.goldEarned || p.gold_earned || p.gold || 0,
          // Calculate CS/min as: creep score from API / 60
          csPerMin: ((p.cs || p.creepScore || p.totalMinionsKilled || 0) / 60),
          damageTaken: p.damageTaken || p.damage_taken || 0,
          totalDamageDealtToChampions: p.totalDamageDealtToChampions || p.damageDealt || p.damage || 0,
          visionScore: p.visionScore || p.vision || 0,
          turretTakedowns: p.turretTakedowns || p.turretKills || 0,
          dragonKills: p.dragonKills || 0,
          baronKills: p.baronKills || 0,
          items: p.items || p.itemsBought || []
        };
      });
      
      // Sort roster by OP Score (descending) and update positions
      playerRoster.sort((a, b) => b.opScore - a.opScore);
      playerRoster.forEach((p, idx) => {
        p.position = idx + 1;
      });
      
      console.log(`📊 Calculated OP Scores for ${playerRoster.length} players in match ${index + 1}`);
      if (playerRoster.length > 0) {
        console.log(`   Top player: ${playerRoster[0].player} (${playerRoster[0].role}) - OP Score: ${playerRoster[0].opScore.toFixed(2)}`);
      }

      return {
        matchId: match.matchId || match.gameId || match.match_id || match.id || `match_${index + 1}`,
        date: dateString,
        champion: champion,
        role: role,
        win: winStatus,
        kda: kdaString,
        score: opScore,
        opScore: opScore,
        scoreHistory: match.scoreHistory || match.score_history || [opScore],
        position: position,
        pros: match.pros || match.strengths || match.pros_list || [],
        cons: match.cons || match.weaknesses || match.cons_list || [],
        playerRoster: playerRoster
      };
    });
    console.log(`✅ Mapped ${leagueData.matches.length} matches`);
    console.log("📋 Sample mapped match:", JSON.stringify(leagueData.matches[0], null, 2));
  } else {
    console.warn("⚠️ No matches found in API response");
    // Keep existing matches or initialize empty
    if (!leagueData.matches || leagueData.matches.length === 0) {
      leagueData.matches = [];
    }
  }

  // Map quests (if API provided them, otherwise generate locally)
  if (questsData && questsData.quests) {
    leagueData.quests = questsData.quests.map(quest => ({
      title: quest.title || quest.name,
      description: quest.description || quest.desc,
      progress: quest.progress || '0/1',
      difficulty: quest.difficulty || 'Medium',
      xpReward: quest.xpReward || quest.xp || getXPForDifficulty(quest.difficulty || 'Medium'),
      completed: quest.completed || false
    }));
  } else {
    // Generate quests based on current rank if API didn't provide them
    generateQuests();
  }
  
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

// Function to copy match link to clipboard
function copyMatchLink(matchId) {
  // Create the URL with the match ID as a query parameter
  const currentUrl = window.location.origin + window.location.pathname;
  const matchUrl = `${currentUrl}?match=${matchId}`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(matchUrl).then(() => {
    // Show success notification
    showCopyNotification('Match link copied to clipboard!');
    
    // Update button icon temporarily to show checkmark
    const button = document.querySelector(`.share-match-btn[data-match-id="${matchId}"]`);
    if (button) {
      const originalHTML = button.innerHTML;
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
      button.classList.add('text-emerald-400');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('text-emerald-400');
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback: show the URL in an alert if clipboard API fails
    alert('Copy this link: ' + matchUrl);
  });
}

// Function to show copy notification
function showCopyNotification(message) {
  // Remove existing notification if any
  const existingNotification = document.getElementById('copy-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'copy-notification';
  notification.className = 'fixed top-20 right-6 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-10px)';
  notification.style.transition = 'all 0.3s ease-out';
  notification.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Animate out
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
  }, 2000);
  
  // Remove after animation
  setTimeout(() => {
    notification.remove();
  }, 2300);
}

// Function to check URL parameters and open specific match if needed
function checkAndOpenMatchFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('match');
  
  if (matchId) {
    // Switch to Match History tab (tab 3)
    $('.tab').removeClass('border-sky-500 text-sky-400').addClass('border-transparent text-gray-500');
    $('.tab[data-tab="3"]').addClass('border-sky-500 text-sky-400').removeClass('border-transparent text-gray-500');
    
    // Load match history
    fetchLeagueData(false).then(() => {
      displayChampRoleOverview();
      
      // Wait for DOM to update, then open the specific match
      setTimeout(() => {
        const matchElement = $(`[data-match-id="${matchId}"]`);
        if (matchElement.length > 0) {
          const expanded = $(`#expanded-${matchId}`);
          
          // Expand the match if it's not already expanded
          if (!expanded.is(':visible')) {
            expanded.slideDown();
            const matchHeader = matchElement.find('.match-header');
            const icon = matchHeader.find('div').last();
            icon.text('▲');
            
            // Create OP Score chart if match has opScore
            const match = leagueData.matches.find(m => m.matchId === matchId);
            if (match && match.opScore !== undefined) {
              const matchIndex = leagueData.matches.findIndex(m => m.matchId === matchId);
              const canvas = expanded.find('canvas')[0];
              if (canvas && matchIndex !== -1) {
                createOpScoreBarChart(canvas, match.opScore);
              }
            }
          }
          
          // Scroll to the match
          matchElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight the match briefly
          matchElement.css('box-shadow', '0 0 20px rgba(14, 165, 233, 0.5)');
          setTimeout(() => {
            matchElement.css('box-shadow', '');
          }, 2000);
        }
      }, 300);
    });
    
    // Clean URL to remove the parameter (optional - keeps URL clean)
    // Uncomment if you want to remove the parameter after opening
    // window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Function to generate brutally honest, detailed, and highly constructive feedback
function generateFeedback(match, playerData, mode) {
  const kdaParts = match.kda.split('/');
  const kills = parseInt(kdaParts[0]) || 0;
  const deaths = parseInt(kdaParts[1]) || 0;
  const assists = parseInt(kdaParts[2]) || 0;
  const kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toFixed(2);
  
  let feedback = '';
  const feedbackParts = [];
  
  if (mode === 'roast') {
    // FUNNY, STRAIGHTFORWARD ROASTS WITH QUICK FIXES
    
    // Death Analysis - Most Critical
    if (deaths >= 8) {
      feedbackParts.push(`You died ${deaths} times. You're basically an ATM that dispenses gold. Quick fix: Check minimap before every fight. No vision? No fight.`);
    } else if (deaths >= 6) {
      feedbackParts.push(`Your ${deaths} deaths funded the enemy team's items. You're playing League like it's a charity. Fix: Assume missing enemies = they're coming for you.`);
    } else if (deaths >= 4) {
      feedbackParts.push(`You spent ${Math.round(deaths * 30)} seconds dead. That's time you could've been useful. Fix: Stay alive > Get a kill. Dead = useless.`);
    }
    
    // KDA Analysis
    if (kda < 1.0) {
      feedbackParts.push(`Your ${kda} KDA? You're math homework - nobody wants you. Fix: Wait for enemy key abilities before engaging. Survival first, ego second.`);
    } else if (kda < 1.5) {
      feedbackParts.push(`Your ${kda} KDA is carrying your team... to a loss. Fix: Learn ${match.champion}'s range and never go past it alone.`);
    }
    
    // CS Analysis
    if (playerData) {
      if (playerData.csPerMin < 5) {
        feedbackParts.push(`Your ${playerData.csPerMin.toFixed(1)} CS/min is tragic. You're playing with items from Wish. Fix: Practice last-hitting 10 min/day. Hit cannons.`);
      } else if (playerData.csPerMin < 6.5) {
        feedbackParts.push(`Your ${playerData.csPerMin.toFixed(1)} CS/min is leaving money on the table. Fix: Learn wave management basics - freeze when ahead, shove when behind.`);
      }
      
      // Gold Efficiency
      if (playerData.goldEarned < 9000) {
        feedbackParts.push(`You earned ${playerData.goldEarned.toLocaleString()} gold. That's poverty in League terms. Fix: Farm sidelanes safely when behind. Don't force bad fights.`);
      } else if (playerData.goldEarned < 11000) {
        feedbackParts.push(`Your ${playerData.goldEarned.toLocaleString()} gold is weak. Fix: Participate in objectives (they give gold) and stop wasting time.`);
      }
    }
    
    // Position Analysis
    if (match.position && match.position > 7) {
      feedbackParts.push(`You finished #${match.position}/10. Bottom tier, just like your LP. Fix: Watch the #1 player's replay from this game. Copy their positioning.`);
    }
    
    // Score Analysis
    if (match.score && match.score < 70) {
      feedbackParts.push(`Your ${match.score} score means you're not helping anywhere. Fix: Pick ONE thing (survival OR farming) and master it for 5 games.`);
    } else if (match.score && match.score < 85) {
      feedbackParts.push(`Your ${match.score} score is inconsistent. You're coin-flipping. Fix: Before every fight, ask: Vision? Cooldowns? Safe position? Check all three.`);
    }
    
    // Role-Specific Feedback
    if (match.role === 'Support' && assists < 10) {
      feedbackParts.push(`Support with ${assists} assists? You're supporting the enemy team more. Fix: Stay near carries. Peel > Engage. Save lives, don't chase kills.`);
    }
    
    if (match.role === 'Jungle' && !match.win) {
      feedbackParts.push(`Jungle diff happened and you lost it. Fix: Track enemy jungler. See them top? Steal their botside. Always be productive.`);
    }
    
    // Champion-Specific Roasts
    if (match.champion === 'Yasuo' || match.champion === 'Yone') {
      if (deaths > 5) {
        feedbackParts.push(`Playing ${match.champion} with ${deaths} deaths? You're the meme. Fix: Dash only when you can dash out. Keep one escape available.`);
      }
    }
    
    if (match.champion === 'Vayne' || match.champion === 'Kog\'Maw') {
      if (deaths > 4) {
        feedbackParts.push(`You're playing ${match.champion} like a melee champ. You're an ADC - stay BACK. Fix: Auto from max range. If you're melee range, you failed.`);
      }
    }
    
    // Generic Feedback
    if (feedbackParts.length === 0) {
      feedbackParts.push(`Your gameplay has more holes than Swiss cheese. Fix: Watch your replay. Every death: Why? Could it be prevented? Learn from each one.`);
    }
    
    // Combine feedback - keep it short and punchy
    feedback = feedbackParts.join(' ');
    
  } else {
    // BRUTALLY HONEST, DETAILED ANALYSIS FOR COMPLIMENTS
    
    // KDA Deep Dive
    if (kda > 4.0) {
      feedbackParts.push(`Your ${kda} KDA ratio is exceptional - you're clearly understanding risk vs reward at a high level. You're securing kills without feeding shutdowns, which is crucial. Keep this up by: Always track enemy ultimates and key abilities before engaging. Your decision-making on when to commit is on point - maintain this by watching cooldowns religiously.`);
    } else if (kda > 3.0) {
      feedbackParts.push(`Your ${kda} KDA shows strong fundamentals. You're finding the right balance between aggression and safety. To maintain this: Continue tracking enemy cooldowns and summoner spells. Your positioning allowed you to deal damage without taking unnecessary risks - this is exactly how you should play ${match.champion}.`);
    }
    
    if (kills > 12 && deaths <= 3) {
      feedbackParts.push(`Your ${kills}-${deaths}-${assists} statline shows you understand priority targeting and execution. You're identifying key targets and eliminating them without overextending. This is high-level play. To replicate: Continue focusing on high-value targets (enemy carries, fed players) and exit cleanly after securing kills. Don't get greedy for the extra kill that doesn't matter.`);
    }
    
    // CS Excellence
    if (playerData && playerData.csPerMin >= 9) {
      feedbackParts.push(`Your ${playerData.csPerMin.toFixed(1)} CS/min is professional-tier farming. At 20 minutes, that's ~180 CS - you're maximizing your income. This farm lead translates directly to item advantages. Maintain this by: Prioritizing waves before unnecessary roams. Understanding wave states (slow push before objectives, freeze when ahead, shove when behind). Every missed CS is money you'll never get back.`);
    } else if (playerData && playerData.csPerMin >= 8) {
      feedbackParts.push(`Your ${playerData.csPerMin.toFixed(1)} CS/min is strong for ${match.role}. You're maintaining consistent farm throughout the game, which kept you relevant. To improve further: Learn advanced wave manipulation. Practice last-hitting under pressure. Minimize CS loss when recalling - time your backs with cannon waves when possible.`);
    }
    
    // Gold Efficiency Analysis
    if (playerData && playerData.goldEarned > 13000) {
      feedbackParts.push(`Your ${playerData.goldEarned.toLocaleString()} gold earned shows elite economy management. You're maximizing every income source: CS, kills, assists, objectives, and turret plates. This gold lead likely meant you were 1-2 items ahead of your lane opponent, creating massive pressure. Replicate this by: Never let waves crash into your turret without collecting them. Participate in every objective for the gold. Take jungle camps when your jungler isn't nearby.`);
    } else if (playerData && playerData.goldEarned > 12000) {
      feedbackParts.push(`Your ${playerData.goldEarned.toLocaleString()} gold shows strong resource management. You're balancing farming with fighting effectively. This gold advantage gave you item spikes that won fights. Continue this by: Maintaining CS even during mid/late game. Too many players abandon farm post-20 minutes - don't be one of them. Farm sidelanes safely, then group for objectives.`);
    }
    
    // Position Excellence
    if (match.position && match.position <= 3) {
      const percentile = ((4 - match.position) / 10 * 100).toFixed(0);
      feedbackParts.push(`Finishing #${match.position} means you outperformed ${percentile}% of players. This isn't luck - this is consistently making better decisions. Study this game to identify what you did differently: Was it your positioning in team fights? Your timing on rotations? Your ability to read the map? Document these patterns and make them habits.`);
    } else if (match.position && match.position <= 5) {
      feedbackParts.push(`Your #${match.position} finish shows you're playing at an above-average level. You're making more correct decisions than mistakes. To reach top 3: Focus on maximizing your impact in team fights. Ensure you're always positioned optimally for your role. Track enemy key abilities and engage only when they're on cooldown.`);
    }
    
    // Score Analysis
    if (match.score && match.score >= 95) {
      feedbackParts.push(`Your ${match.score} score reflects elite-level performance across all metrics. You contributed in fights, objectives, vision, and macro play. This holistic approach is what separates good players from great ones. Maintain this by: Continue participating in every major objective. Maintain vision control in key areas. Communicate with your team about rotations and objective timers.`);
    } else if (match.score && match.score >= 90) {
      feedbackParts.push(`Your ${match.score} score shows strong all-around contribution. You're not just getting kills - you're impacting the game in multiple ways. To push towards 95+: Increase your objective participation. Ensure you're present for every dragon and Baron fight. Improve your vision score - place wards in high-traffic areas, not just randomly.`);
    }
    
    // Role-Specific Excellence
    if (match.role === 'Support' && assists >= 18) {
      feedbackParts.push(`Your ${assists} assists show elite support play. You're enabling your team at a high level. This means you're positioned correctly in fights, timing your abilities well, and prioritizing your team's survival. Maintain this by: Continue tracking enemy engage tools and peeling for your carries. Your vision control is likely strong - keep wards in enemy jungle and around objectives.`);
    }
    
    if (match.role === 'ADC' && playerData && playerData.csPerMin >= 8 && deaths <= 2) {
      feedbackParts.push(`As ADC, you're doing everything right: farming well (${playerData.csPerMin.toFixed(1)} CS/min), staying alive (${deaths} deaths), and likely dealing consistent damage. This is textbook ADC play. Continue by: Always position behind your front line. Auto-attack the closest safe target - don't greed for the backline carry if it means dying. Your life > Getting a kill.`);
    }
    
    if (match.role === 'Jungle' && match.win) {
      feedbackParts.push(`Jungle diff - and you won it. Your pathing, gank timing, and objective control were superior. To maintain this: Continue tracking the enemy jungler. Counter-jungle when safe. Secure vision in their jungle. Time your ganks with objective spawns. Control the tempo of the game.`);
    }
    
    // Champion-Specific Analysis
    if (match.champion === 'Lux' || match.champion === 'Xerath' || match.champion === 'Ziggs') {
      feedbackParts.push(`As ${match.champion}, your positioning was likely excellent - you dealt damage from safety. Maintain this by: Always stay at max range. Never use your escape ability aggressively unless you're 100% sure it's safe. Your job is sustained damage, not all-in engages.`);
    }
    
    if (match.champion === 'Yasuo' || match.champion === 'Yone') {
      if (kda > 2.5) {
        feedbackParts.push(`Playing ${match.champion} with a ${kda} KDA is actually impressive - most players feed on these champions. Your decision-making on when to engage was correct. Continue by: Always have an escape plan. Don't use your E to go in unless you can dash out. Your Q is for poke and setup - use it to create opportunities, not force them.`);
      }
    }
    
    // Generic Comprehensive Feedback
    if (feedbackParts.length === 0) {
      feedbackParts.push(`Your performance shows solid fundamentals. To elevate further: Review your decision-making in this match. What made you successful? Was it positioning? Timing? Map awareness? Identify the patterns and make them automatic. Also, watch high-elo players of ${match.champion} and compare your gameplay. Notice their positioning, their timing, their decision-making.`);
    }
    
    // Combine all feedback parts
    feedback = feedbackParts.join(' ');
    
    // Add detailed improvement steps
    feedback += ` TO REPLICATE THIS: (1) Review this replay and identify your win conditions - what did you do that created advantages? (2) Study high-elo ${match.champion} gameplay to see what they do that you're not doing yet, (3) Focus on consistency - one great game means nothing if the next 5 are mediocre, (4) Analyze your laning phase: how did you build your lead? Was it through CS, kills, or both? and (5) Document your strengths from this match and actively reinforce these patterns in future games.`;
  }
  
  return feedback;
}

// Helper function to convert a single match to matchSummary format
function convertMatchToSummary(match) {
  // Parse KDA
  const kdaParts = match.kda ? match.kda.split('/') : ['0', '0', '0'];
  const kills = parseInt(kdaParts[0]) || 0;
  const deaths = parseInt(kdaParts[1]) || 0;
  const assists = parseInt(kdaParts[2]) || 0;
  
  // Get player data from roster if available - find the current player
  const playerData = match.playerRoster ? match.playerRoster.find(p => 
    p.isYou === true || p.isYou === 'true' || p.is_you === true ||
    (p.player && userCredentials.gameName && p.player.toLowerCase().includes(userCredentials.gameName.toLowerCase()))
  ) : null;
  
  // Get champion - prioritize from playerData if available, then from match
  // This ensures we get the champion the player actually played, not from a different player
  let champion = match.champion || 'Unknown';
  if (playerData && playerData.champion) {
    champion = playerData.champion;
  }
  
  // Get role - prioritize from playerData if available
  let role = match.role || 'UNKNOWN';
  if (playerData && playerData.role) {
    role = playerData.role;
  }
  
  // Get CS - use playerData if available, otherwise calculate from match data
  let cs = 0;
  if (playerData) {
    // Try multiple field names for CS
    cs = playerData.cs || 
         (playerData.csPerMin ? Math.round(playerData.csPerMin * (parseInt(match.duration || 0) / 60)) : 0) ||
         match.cs || 0;
  } else {
    cs = match.cs || 0;
  }
  
  // Get damage - prioritize from playerData, try multiple field names
  let damage = 0;
  if (playerData) {
    // The API uses damageToChamps, not damageDealt
    damage = playerData.damageToChamps || 
             playerData.totalDamageDealtToChampions || 
             playerData.damageDealt || 
             playerData.damage || 
             match.damage || 0;
  } else {
    damage = match.damage || 0;
  }
  
  // Get gold - prioritize from playerData
  let gold = 0;
  if (playerData) {
    gold = playerData.goldEarned || playerData.gold || match.gold || 0;
  } else {
    gold = match.gold || 0;
  }
  
  // Get vision - prioritize from playerData
  let vision = 0;
  if (playerData) {
    vision = playerData.visionScore || playerData.vision || match.vision || 0;
  } else {
    vision = match.vision || 0;
  }
  
  // Get game duration - convert seconds to readable format
  let gameDuration = 'Unknown';
  if (match.duration) {
    // duration is in seconds, convert to "X min" format
    const minutes = Math.floor(match.duration / 60);
    gameDuration = `${minutes} min`;
  } else if (match.gameDuration) {
    gameDuration = match.gameDuration;
  }
  
  const summary = {
    champion: champion,
    role: role,
    kills: kills,
    deaths: deaths,
    assists: assists,
    win: match.win !== undefined ? match.win : (match.result === 'Victory'),
    cs: cs,
    gold: gold,
    damage: damage,
    vision: vision,
    gameDuration: gameDuration
  };
  
  // Log for debugging
  console.log(`🎮 Converting match to summary - Champion: ${champion}, Role: ${role}, KDA: ${kills}/${deaths}/${assists}`);
  
  return summary;
}

// Function to generate AI trash talk or compliment based on match stats using Lambda API
async function generateAIMessage(matchId) {
  const match = leagueData.matches.find(m => m.matchId === matchId);
  if (!match) {
    showCopyNotification('Match data not found!');
    return;
  }
  
  // Get current mode (roast or compliment)
  const activeModeBtn = $(`.ai-mode-toggle.active-ai-mode[data-match-id="${matchId}"]`);
  const mode = activeModeBtn.length > 0 ? activeModeBtn.data('mode') : 'roast';
  
  // Show loading state
  const messageContainer = $(`#ai-message-${matchId}`);
  const messageText = $(`#ai-text-${matchId}`);
  messageContainer.removeClass('hidden');
  messageText.html('<div class="flex items-center gap-2 text-gray-400"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>Generating AI feedback...</div>');
  
  try {
    // Log the match being analyzed
    console.log(`🎯 Generating AI feedback for match ${matchId}:`);
    console.log(`   Champion: ${match.champion}, Role: ${match.role}, KDA: ${match.kda}`);
    
    // Convert match to summary format
    const matchSummary = convertMatchToSummary(match);
    
    // CRITICAL: Force the champion to match the match being viewed
    // This ensures we're analyzing the correct champion
    const correctChampion = match.champion;
    if (matchSummary.champion !== correctChampion) {
      console.warn(`⚠️ Champion mismatch detected!`);
      console.warn(`   Match champion: ${correctChampion}`);
      console.warn(`   Summary champion: ${matchSummary.champion}`);
      console.warn(`   FORCING champion to: ${correctChampion}`);
      matchSummary.champion = correctChampion;
    }
    
    // Double-check: ensure we have the correct champion
    if (!matchSummary.champion || matchSummary.champion === 'Unknown') {
      console.error(`❌ Invalid champion in summary! Using match champion: ${correctChampion}`);
      matchSummary.champion = correctChampion;
    }
    
    // Verify all data is correct before sending
    console.log(`✅ Final match summary before sending:`);
    console.log(`   Champion: ${matchSummary.champion} (should be ${correctChampion})`);
    console.log(`   Role: ${matchSummary.role}`);
    console.log(`   KDA: ${matchSummary.kills}/${matchSummary.deaths}/${matchSummary.assists}`);
    console.log(`   Win: ${matchSummary.win}`);
    
    // Prepare player info
    const player = {
      puuid: leagueData.player?.puuid || '',
      gameName: userCredentials.gameName || '',
      tagLine: userCredentials.tagLine || ''
    };
    
    // IMPORTANT: Send ONLY this single match, not multiple matches
    // The array should contain exactly ONE match summary
    const matchesToSend = [matchSummary];
    
    console.log(`📨 Sending ${matchesToSend.length} match(es) to Lambda for ${correctChampion} feedback`);
    
    // Call Lambda API to get AI feedback
    const feedback = await getAIFeedback(player, matchesToSend);
    
    // Display the appropriate feedback based on mode
    const feedbackText = mode === 'roast' ? feedback.roast : feedback.compliment;
    
    messageText.text(feedbackText || 'Failed to generate feedback');
    messageContainer.addClass('fade-in');
    
    // Store both roast and compliment for sharing
    messageContainer.data('ai-message', feedbackText);
    messageContainer.data('ai-roast', feedback.roast);
    messageContainer.data('ai-compliment', feedback.compliment);
    
    // Note: Mode toggle switching is handled by the existing click handler in displayChampRoleOverview
    // The feedback is now stored in data attributes so it can be switched without regenerating
    
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    
    // Fallback to local generation if Lambda fails
    const playerData = match.playerRoster ? match.playerRoster.find(p => p.isYou === true) : null;
    const kdaParts = match.kda.split('/');
    const kills = parseInt(kdaParts[0]) || 0;
    const deaths = parseInt(kdaParts[1]) || 0;
    const assists = parseInt(kdaParts[2]) || 0;
    const kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toFixed(2);
    
    let message = '';
    const feedback = generateFeedback(match, playerData, mode);
    
    if (mode === 'roast') {
      message = `⚠️ AI generation failed, using local feedback: ${feedback}`;
    } else {
      message = `⚠️ AI generation failed, using local feedback: ${feedback}`;
    }
    
    messageText.text(message);
    messageContainer.data('ai-message', message);
    
    showCopyNotification('AI generation failed. Using local feedback instead.');
  }
}

// Function to share AI message to clipboard (Discord-ready)
function shareAIMessage(matchId) {
  const messageContainer = $(`#ai-message-${matchId}`);
  const message = messageContainer.data('ai-message');
  
  if (!message) {
    showCopyNotification('No message to share. Generate one first!');
    return;
  }
  
  const match = leagueData.matches.find(m => m.matchId === matchId);
  if (!match) return;
  
  // Format as Discord-ready message with match context
  const shareText = `${message}\n\n📊 ${match.champion} ${match.role} | ${match.kda} KDA | ${match.win ? 'Victory' : 'Defeat'} | ${formatDate(match.date)}`;
  
  navigator.clipboard.writeText(shareText).then(() => {
    showCopyNotification('AI message copied to clipboard!');
    
    // Update button icon temporarily
    const button = $(`.share-ai-btn[data-match-id="${matchId}"]`);
    const originalHTML = button.html();
    button.html('<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>');
    
    setTimeout(() => {
      button.html(originalHTML);
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Copy this message:\n\n' + shareText);
  });
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
    
    const borderColor = match.win ? 'border-emerald-500' : 'border-red-500';
    const resultBg = match.win ? 'bg-emerald-500/10 border-emerald-500' : 'bg-red-500/10 border-red-500';
    
    // Neon text colors and glow effects
    const neonColor = match.win ? '#10b981' : '#ef4444'; // emerald-500 for victory, red-500 for defeat
    const neonGlow = match.win 
      ? '0 0 10px #10b981, 0 0 20px #10b981, 0 0 30px #10b981, 0 0 40px #10b981' 
      : '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444, 0 0 40px #ef4444';
    
    html += `<div class="bg-slate-800 border ${borderColor} rounded-lg overflow-hidden" data-match-id="${match.matchId}" style="border-left-width: 3px;">`;
    html += '<div class="match-header flex items-center gap-8 p-4 hover:bg-slate-800/50 transition-colors cursor-pointer" style="border-bottom: 1px solid #334155;">';
    html += `<div class="h-12 w-20 flex items-center justify-center overflow-visible mr-4"><span class="neon-text font-bold text-lg uppercase tracking-wider" style="color: ${neonColor}; text-shadow: ${neonGlow};">${winText}</span></div>`;
    html += '<div class="flex-1">';
    html += `<div class="text-xs text-gray-500">${formatDate(match.date)}</div>`;
    html += `<div class="text-base font-semibold text-gray-100">${match.champion}</div>`;
    html += `<div class="text-xs text-gray-400">${match.role}</div>`;
    html += '</div>';
    html += `<div class="text-sm text-gray-400 font-medium px-4">${match.kda}</div>`;
    
    // Find player's position in this match
    let playerPosition = null;
    if (match.playerRoster && Array.isArray(match.playerRoster)) {
      const playerInMatch = match.playerRoster.find(p => 
        p.isYou === true || 
        p.isYou === 'true' || 
        p.is_you === true ||
        (p.player && userCredentials.gameName && p.player.toLowerCase().includes(userCredentials.gameName.toLowerCase()))
      );
      if (playerInMatch) {
        playerPosition = playerInMatch.position || playerInMatch.rank;
      }
    }
    if (!playerPosition && match.position) {
      playerPosition = match.position;
    }
    
    // Show position with highlight if it's the player's position
    if (playerPosition) {
      const isPlayerPosition = match.playerRoster && match.playerRoster.some(p => 
        (p.position || p.rank) === playerPosition && 
        (p.isYou === true || p.isYou === 'true' || p.is_you === true ||
         (p.player && userCredentials.gameName && p.player.toLowerCase().includes(userCredentials.gameName.toLowerCase())))
      );
      if (isPlayerPosition) {
        html += `<div class="text-sky-400 font-bold bg-sky-500/20 px-3 py-1 rounded border border-sky-500">#${playerPosition}/10</div>`;
      } else {
        html += `<div class="text-sky-400 font-bold">#${playerPosition}/10</div>`;
      }
    } else {
      html += `<div class="text-sky-400 font-bold">-</div>`;
    }
    
    // Share button
    html += `<button class="share-match-btn text-gray-400 hover:text-sky-400 transition-colors px-2 py-1 rounded hover:bg-slate-700" data-match-id="${match.matchId}" title="Share match link" onclick="event.stopPropagation(); copyMatchLink('${match.matchId}');">`;
    html += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>';
    html += '</button>';
    
    html += '<div class="text-gray-500">▼</div>';
    html += '</div>';
    
    // Only render detailed sections if match has detailed data
    // Check if playerRoster exists and has at least one player
    const hasDetailedData = match.playerRoster && Array.isArray(match.playerRoster) && match.playerRoster.length > 0;
    
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
      
      // Check if playerRoster exists and has players
      if (match.playerRoster && Array.isArray(match.playerRoster) && match.playerRoster.length > 0) {
        html += '<div class="space-y-2">';
        
        match.playerRoster.forEach((player, idx) => {
          const playerId = (player.player || `Player_${idx}`).replace(/\s+/g, '_') + '_' + idx;
          
          // Check if this is the current player
          const isCurrentPlayer = player.isYou === true || 
                                 player.isYou === 'true' || 
                                 player.is_you === true ||
                                 (player.player && userCredentials.gameName && 
                                  player.player.toLowerCase().includes(userCredentials.gameName.toLowerCase()));
          
          // Highlighting logic: Player gets priority, then top 3
          let rowClass = 'bg-slate-700 border-slate-700';
          let positionClass = 'text-sky-400';
          
          if (isCurrentPlayer) {
            // Player's row gets strong blue highlight
            rowClass = 'bg-sky-500/20 border-sky-500 border-2';
            positionClass = 'text-sky-300 font-bold';
          } else {
            // Top 3 positions get special colors
            const topThreeBgs = {
              1: 'bg-yellow-500/10 border-yellow-500',
              2: 'bg-gray-400/10 border-gray-400',
              3: 'bg-orange-500/10 border-orange-500'
            };
            const position = player.position || idx + 1;
            rowClass = topThreeBgs[position] || rowClass;
          }
          
          const position = player.position || idx + 1;
          
          // Format score with 1 decimal place
          const score = (player.score || player.opScore || 0).toFixed(1);
          
          html += '<div class="grid grid-cols-6 gap-3 items-center p-3 rounded-lg border hover:bg-slate-700/50 transition-colors ' + rowClass + '" data-player-id="' + playerId + '">';
          
          // Position with special styling for player
          if (isCurrentPlayer) {
            html += `<div class="${positionClass} font-bold text-sm bg-sky-500/30 px-2 py-1 rounded">#${position}</div>`;
          } else {
            html += `<div class="text-sky-400 font-bold text-sm">#${position}</div>`;
          }
          
          // Player name with highlight if it's you
          if (isCurrentPlayer) {
            html += `<div class="font-bold text-sm text-sky-300">${player.player || `Player ${idx + 1}`} (You)</div>`;
          } else {
            html += `<div class="font-semibold text-sm">${player.player || `Player ${idx + 1}`}</div>`;
          }
          
          html += `<div class="text-gray-400 text-sm">${player.champion || 'Unknown'}</div>`;
          html += `<div class="text-gray-500 text-xs">${player.role || 'Unknown'}</div>`;
          html += `<div class="text-sky-400 font-bold text-sm text-right">${score}</div>`;
          html += '<div class="text-center">📊</div>';
          html += '</div>';
          
          // Player details - ALWAYS VISIBLE (not expandable)
          // Parse KDA from API format: "kills/deaths/assists" (first=kills, second=deaths, third=assists)
          let displayKills = 0;
          let displayAssists = 0;
          let displayDeaths = 0;
          
          // Parse KDA string: format is "kills/deaths/assists"
          // First number = Kills, Second number = Deaths, Third number = Assists
          if (player.kda && typeof player.kda === 'string') {
            const kdaParts = player.kda.split('/');
            if (kdaParts.length === 3) {
              displayKills = parseInt(kdaParts[0]) || 0;      // First number = Kills
              displayDeaths = parseInt(kdaParts[1]) || 0;     // Second number = Deaths
              displayAssists = parseInt(kdaParts[2]) || 0;    // Third number = Assists
            }
          } else if (player.kills !== undefined || player.deaths !== undefined || player.assists !== undefined) {
            // Fallback to individual fields if KDA string not available
            displayKills = player.kills || 0;
            displayDeaths = player.deaths || 0;
            displayAssists = player.assists || 0;
          }
          
          // Calculate KDA: (Kills + Assists) / Deaths, rounded to 2 decimal places (hundredths)
          const kdaRatio = displayDeaths > 0 ? (displayKills + displayAssists) / displayDeaths : (displayKills + displayAssists);
          
          html += `<div class="${playerId} bg-slate-800 border border-slate-700 rounded-lg p-4 mt-2">`;
          html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3">';
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Kills</div><div class="text-base font-bold text-gray-200">${displayKills}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Assists</div><div class="text-base font-bold text-gray-200">${displayAssists}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Deaths</div><div class="text-base font-bold text-gray-200">${displayDeaths}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">KDA</div><div class="text-base font-bold text-emerald-400">${kdaRatio.toFixed(2)}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">CS/min</div><div class="text-base font-bold text-gray-200">${(player.csPerMin || 0).toFixed(1)}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Gold</div><div class="text-base font-bold text-gray-200">${(player.goldEarned || 0).toLocaleString()}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">DMG Taken</div><div class="text-base font-bold text-gray-200">${(player.damageTaken || 0).toLocaleString()}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Vision Score</div><div class="text-base font-bold text-gray-200">${(player.visionScore || 0)}</div></div>`;
          html += `<div class="bg-slate-900 rounded p-2 col-span-2 md:col-span-4"><div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Items</div><div class="text-sm font-semibold text-gray-200">${(player.items && player.items.length > 0) ? player.items.join(', ') : 'N/A'}</div></div>`;
          html += '</div></div>';
        });
        
        html += '</div>'; // Close space-y-2
      } else {
        html += '<div class="text-gray-400 text-center py-4">No player roster data available for this match.</div>';
      }
      
      html += '</div>'; // Close leaderboard container
      
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
      
      // AI Trash Talk / Compliment Generator Section
      html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-5 mt-4">';
      html += '<div class="flex items-center justify-between mb-4">';
      html += '<h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Trash Talk / Compliment Generator</h4>';
      html += '</div>';
      
      // Toggle and Generate Controls
      html += '<div class="flex items-center gap-4 mb-4 flex-wrap">';
      html += '<div class="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">';
      html += `<button class="ai-mode-toggle px-4 py-2 rounded-md text-sm font-semibold transition-all active-ai-mode bg-sky-500 text-white" data-match-id="${match.matchId}" data-mode="roast">🔥 Roast Mode</button>`;
      html += `<button class="ai-mode-toggle px-4 py-2 rounded-md text-sm font-semibold transition-all bg-slate-700 text-gray-300" data-match-id="${match.matchId}" data-mode="compliment">✨ Compliment Mode</button>`;
      html += '</div>';
      html += `<button class="generate-ai-btn px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-sm font-semibold transition-colors" data-match-id="${match.matchId}">Generate</button>`;
      html += '</div>';
      
      // Generated Message Display Area
      html += `<div id="ai-message-${match.matchId}" class="ai-message-container bg-slate-900 border border-slate-600 rounded-lg p-5 min-h-[100px] max-w-full hidden">`;
      html += '<div class="flex items-start justify-between gap-4">';
      html += '<div class="flex-1 min-w-0">';
      html += `<p id="ai-text-${match.matchId}" class="text-gray-200 text-sm font-medium leading-relaxed whitespace-pre-wrap break-words"></p>`;
      html += '</div>';
      html += `<button class="share-ai-btn text-gray-400 hover:text-sky-400 transition-colors p-2 rounded hover:bg-slate-800 flex-shrink-0 mt-1" data-match-id="${match.matchId}" title="Copy to clipboard">`;
      html += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
      html += '</button>';
      html += '</div>';
      html += '</div>';
      
      html += '</div>'; // AI Generator section
    } else {
      // Show message for matches without detailed data
      html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
      html += '<div class="text-gray-400 text-center py-4">';
      html += '<p class="mb-2">⚠️ Detailed match data not available for this match.</p>';
      html += '<p class="text-sm text-gray-500">The API response does not include player roster data for this match.</p>';
      html += '<p class="text-xs text-gray-600 mt-2">Check the browser console (F12) for API response details.</p>';
      html += '</div>';
      html += '</div>';
      
      // Log diagnostic info
      console.warn(`⚠️ Match ${match.matchId || match.matchId || 'unknown'}: No playerRoster data available`);
      console.log(`   Match data:`, {
        matchId: match.matchId,
        champion: match.champion,
        role: match.role,
        win: match.win,
        kda: match.kda,
        opScore: match.opScore,
        hasPlayerRoster: !!match.playerRoster,
        playerRosterLength: match.playerRoster ? match.playerRoster.length : 0
      });
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
      
      // Auto-generate AI feedback when match is expanded (if not already generated)
      const messageContainer = $(`#ai-message-${matchId}`);
      if (messageContainer.length > 0 && !messageContainer.data('ai-roast')) {
        // Small delay to let the UI render first
        setTimeout(() => {
          generateAIMessage(matchId);
        }, 500);
      }
    }
  });
  
  // Player stats are now always visible, no need for click handlers
  // Removed click handlers since stats are always shown
  
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
  
  // Setup click handlers for AI mode toggle
  $('.ai-mode-toggle').off('click').on('click', function(event) {
    event.stopPropagation();
    const matchId = $(this).data('match-id');
    const mode = $(this).data('mode');
    
    // Update active state for both buttons in this match
    $(`.ai-mode-toggle[data-match-id="${matchId}"]`).removeClass('active-ai-mode bg-sky-500 text-white').addClass('bg-slate-700 text-gray-300');
    $(this).addClass('active-ai-mode bg-sky-500 text-white').removeClass('bg-slate-700 text-gray-300');
    
    // If feedback is already generated, switch between roast and compliment
    const messageContainer = $(`#ai-message-${matchId}`);
    const messageText = $(`#ai-text-${matchId}`);
    
    if (messageContainer.is(':visible') && messageContainer.data('ai-roast') && messageContainer.data('ai-compliment')) {
      // Switch to the selected mode's feedback
      const feedbackText = mode === 'roast' ? messageContainer.data('ai-roast') : messageContainer.data('ai-compliment');
      if (feedbackText) {
        messageText.text(feedbackText);
        messageContainer.data('ai-message', feedbackText);
      }
    }
  });
  
  // Setup click handler for generate AI button
  $('.generate-ai-btn').off('click').on('click', function(event) {
    event.stopPropagation();
    const matchId = $(this).data('match-id');
    generateAIMessage(matchId);
  });
  
  // Setup click handler for share AI button
  $('.share-ai-btn').off('click').on('click', function(event) {
    event.stopPropagation();
    const matchId = $(this).data('match-id');
    shareAIMessage(matchId);
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
              return `OP Score: ${context.parsed.y.toFixed(1)}/10`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: {
            color: '#334155'
          },
          ticks: {
            color: '#94A3B8',
            stepSize: 2
          },
          title: {
            display: true,
            text: 'OP Score (out of 10)',
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

// Function to calculate and display profile stats from last 20 matches
function calculateAndDisplayProfileStats(matches) {
  if (!matches || matches.length === 0) {
    return '';
  }
  
  // Initialize counters and totals
  const championCounts = {};
  const roleCounts = {};
  let totalOpScore = 0;
  let opScoreCount = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalGoldEarned = 0;
  let goldCount = 0;
  let totalCreepScore = 0;
  let csCount = 0;
  let totalGameLength = 0;
  let gameLengthCount = 0;
  
  // Process each match
  matches.forEach(match => {
    // Count champions
    if (match.champion) {
      championCounts[match.champion] = (championCounts[match.champion] || 0) + 1;
    }
    
    // Count roles
    if (match.role) {
      roleCounts[match.role] = (roleCounts[match.role] || 0) + 1;
    }
    
    // Calculate OP Score average
    if (match.opScore !== undefined && match.opScore !== null) {
      totalOpScore += match.opScore;
      opScoreCount++;
    }
    
    // Parse KDA (format: "kills/deaths/assists")
    if (match.kda && typeof match.kda === 'string') {
      const kdaParts = match.kda.split('/');
      if (kdaParts.length === 3) {
        const kills = parseFloat(kdaParts[0]) || 0;
        const deaths = parseFloat(kdaParts[1]) || 0;
        const assists = parseFloat(kdaParts[2]) || 0;
        totalKills += kills;
        totalDeaths += deaths;
        totalAssists += assists;
      }
    }
    
    // Determine game length for this match
    let gameLength = null;
    if (match.gameLength !== undefined && match.gameLength !== null) {
      gameLength = match.gameLength;
    } else {
      // Estimate: assume 27 minutes average (typical League game length)
      gameLength = 27;
    }
    totalGameLength += gameLength;
    gameLengthCount++;
    
    // Get player stats from playerRoster if available
    // Use the same robust player-finding logic as in mapAPIDataToLeagueData
    let playerData = null;
    
    // Method 1: Look for isYou flag in playerRoster
    if (match.playerRoster && Array.isArray(match.playerRoster)) {
      playerData = match.playerRoster.find(p => p.isYou === true || p.isYou === 'true' || p.is_you === true);
    }
    
    // Method 2: Look in participants
    if (!playerData && match.participants && Array.isArray(match.participants)) {
      playerData = match.participants.find(p => p.isYou === true || p.isYou === 'true' || p.is_you === true);
    }
    
    // Method 3: Use playerData directly
    if (!playerData && match.playerData) {
      playerData = match.playerData;
    }
    
    // Method 4: If playerRoster exists but no isYou flag, search by Riot ID (gameName#tagLine)
    if (!playerData && match.playerRoster && Array.isArray(match.playerRoster) && match.playerRoster.length > 0) {
      // Try to find by matching Riot ID (gameName#tagLine)
      if (userCredentials.gameName && userCredentials.tagLine) {
        const searchName = `${userCredentials.gameName}#${userCredentials.tagLine}`.toLowerCase();
        playerData = match.playerRoster.find(p => {
          const playerName = (p.player || p.riotId || p.gameName || p.name || '').toLowerCase();
          return playerName.includes(searchName) || playerName.includes(userCredentials.gameName.toLowerCase());
        });
      }
      // If still not found, try matching just the gameName
      if (!playerData && userCredentials.gameName) {
        const searchName = userCredentials.gameName.toLowerCase();
        playerData = match.playerRoster.find(p => {
          const playerName = (p.player || p.riotId || p.gameName || p.name || '').toLowerCase();
          return playerName.includes(searchName);
        });
      }
    }
    
    if (playerData) {
      // Gold earned - check multiple possible property names
      // goldEarned can be 0, so we check for !== undefined and !== null
      const goldEarned = playerData.goldEarned !== undefined && playerData.goldEarned !== null 
        ? playerData.goldEarned 
        : (playerData.gold_earned !== undefined && playerData.gold_earned !== null 
            ? playerData.gold_earned 
            : (playerData.gold !== undefined && playerData.gold !== null ? playerData.gold : null));
      
      // Also check if gold might be stored directly on the match object
      const matchGoldEarned = match.goldEarned !== undefined && match.goldEarned !== null
        ? match.goldEarned
        : (match.gold_earned !== undefined && match.gold_earned !== null
            ? match.gold_earned
            : (match.gold !== undefined && match.gold !== null ? match.gold : null));
      
      // Use playerData gold first, fallback to match gold
      const finalGoldEarned = goldEarned !== null && goldEarned !== undefined ? goldEarned : matchGoldEarned;
      
      // Debug logging (only log first match to avoid spam)
      if (goldCount === 0 && matches.indexOf(match) === 0) {
        console.log('🔍 Gold Earned Debug - First Match:', {
          playerDataFound: !!playerData,
          playerDataKeys: playerData ? Object.keys(playerData) : [],
          goldEarned: playerData?.goldEarned,
          gold_earned: playerData?.gold_earned,
          gold: playerData?.gold,
          matchGoldEarned: match.goldEarned,
          matchGold_earned: match.gold_earned,
          matchGold: match.gold,
          finalGoldEarned: finalGoldEarned,
          playerRosterLength: match.playerRoster?.length,
          matchKeys: Object.keys(match).slice(0, 10) // First 10 keys
        });
      }
      
      if (finalGoldEarned !== null && finalGoldEarned !== undefined) {
        totalGoldEarned += Number(finalGoldEarned);
        goldCount++;
      }
      
      // Creep score - calculate from CS/min if available
      if (playerData.csPerMin !== undefined) {
        // Use actual game length if available, otherwise use estimated
        const estimatedCS = playerData.csPerMin * gameLength;
        totalCreepScore += estimatedCS;
        csCount++;
      }
    } else {
      // Debug: Log when playerData is not found (only for first few matches)
      if (matches.indexOf(match) < 3) {
        console.log(`⚠️ Gold Debug - Match ${matches.indexOf(match) + 1}: Player data not found`, {
          hasPlayerRoster: !!match.playerRoster,
          playerRosterLength: match.playerRoster?.length,
          hasParticipants: !!match.participants,
          participantsLength: match.participants?.length,
          hasPlayerData: !!match.playerData,
          gameName: userCredentials.gameName,
          tagLine: userCredentials.tagLine
        });
      }
    }
  });
  
  // Debug: Log summary of gold data collection
  console.log(`💰 Gold Earned Summary: Found gold data in ${goldCount} out of ${matches.length} matches`);
  
  // Find most played champion(s) - handle ties
  const championValues = Object.values(championCounts);
  const maxChampionGames = championValues.length > 0 ? Math.max(...championValues) : 0;
  const mostPlayedChampions = maxChampionGames > 0 ? Object.keys(championCounts).filter(
    champ => championCounts[champ] === maxChampionGames
  ) : ['N/A'];
  
  // Find most played role(s) - handle ties
  const roleValues = Object.values(roleCounts);
  const maxRoleGames = roleValues.length > 0 ? Math.max(...roleValues) : 0;
  const mostPlayedRoles = maxRoleGames > 0 ? Object.keys(roleCounts).filter(
    role => roleCounts[role] === maxRoleGames
  ) : ['N/A'];
  
  // Calculate averages
  const avgOpScore = opScoreCount > 0 ? (totalOpScore / opScoreCount) : 0;
  const avgKDA = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths) : (totalKills + totalAssists);
  const avgGoldEarned = goldCount > 0 ? (totalGoldEarned / goldCount) : null;
  const avgCreepScore = csCount > 0 ? (totalCreepScore / csCount) : null;
  const avgGameLength = gameLengthCount > 0 ? (totalGameLength / gameLengthCount) : null;
  
  // Build HTML for Profile Stats section
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-8">';
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-6">Profile Stats</h2>';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
  
  // Most Played Champion
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Most Played Champion</div>';
  html += '<div class="text-lg font-bold text-gray-100">';
  html += mostPlayedChampions.join(', ');
  html += '</div>';
  if (maxChampionGames > 0) {
    html += '<div class="text-sm text-gray-400 mt-1">';
    html += `${maxChampionGames} game${maxChampionGames !== 1 ? 's' : ''} (Last 20 matches)`;
    html += '</div>';
  } else {
    html += '<div class="text-sm text-gray-500 mt-1">No data available</div>';
  }
  html += '</div>';
  
  // Most Played Role
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Most Played Role</div>';
  html += '<div class="text-lg font-bold text-gray-100">';
  html += mostPlayedRoles.join(', ');
  html += '</div>';
  if (maxRoleGames > 0) {
    html += '<div class="text-sm text-gray-400 mt-1">';
    html += `${maxRoleGames} game${maxRoleGames !== 1 ? 's' : ''} (Last 20 matches)`;
    html += '</div>';
  } else {
    html += '<div class="text-sm text-gray-500 mt-1">No data available</div>';
  }
  html += '</div>';
  
  // Average OP Score
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Average OP Score</div>';
  html += '<div class="text-2xl font-bold text-sky-400">';
  html += avgOpScore.toFixed(1);
  html += '</div>';
  html += '<div class="text-sm text-gray-400 mt-1">From last 20 matches</div>';
  html += '</div>';
  
  // Average KDA
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Average KDA</div>';
  html += '<div class="text-2xl font-bold text-emerald-400">';
  html += avgKDA.toFixed(2);
  html += '</div>';
  html += '<div class="text-sm text-gray-400 mt-1">';
  const totalMatches = matches.length;
  const avgKills = (totalKills / totalMatches).toFixed(1);
  const avgDeaths = (totalDeaths / totalMatches).toFixed(1);
  const avgAssists = (totalAssists / totalMatches).toFixed(1);
  html += `${avgKills}/${avgDeaths}/${avgAssists} (Last 20 matches)`;
  html += '</div>';
  html += '</div>';
  
  // Average Gold Earned
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Average Gold Earned</div>';
  if (avgGoldEarned !== null) {
    html += '<div class="text-2xl font-bold text-yellow-400">';
    html += Math.round(avgGoldEarned).toLocaleString();
    html += '</div>';
    html += '<div class="text-sm text-gray-400 mt-1">From last 20 matches</div>';
  } else {
    html += '<div class="text-lg font-bold text-gray-500">N/A</div>';
    html += '<div class="text-sm text-gray-500 mt-1">Insufficient data</div>';
  }
  html += '</div>';
  
  // Average Creep Score
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Average Creep Score</div>';
  if (avgCreepScore !== null) {
    html += '<div class="text-2xl font-bold text-purple-400">';
    html += Math.round(avgCreepScore).toLocaleString();
    html += '</div>';
    html += '<div class="text-sm text-gray-400 mt-1">From last 20 matches</div>';
  } else {
    html += '<div class="text-lg font-bold text-gray-500">N/A</div>';
    html += '<div class="text-sm text-gray-500 mt-1">Insufficient data</div>';
  }
  html += '</div>';
  
  // Average Game Length
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Average Game Length</div>';
  if (avgGameLength !== null) {
    const minutes = Math.floor(avgGameLength);
    const seconds = Math.round((avgGameLength - minutes) * 60);
    html += '<div class="text-2xl font-bold text-rose-400">';
    html += `${minutes}:${seconds.toString().padStart(2, '0')}`;
    html += '</div>';
    html += '<div class="text-sm text-gray-400 mt-1">From last 20 matches</div>';
  } else {
    html += '<div class="text-lg font-bold text-gray-500">N/A</div>';
    html += '<div class="text-sm text-gray-500 mt-1">Insufficient data</div>';
  }
  html += '</div>';
  
  html += '</div>'; // Close grid
  html += '</div>'; // Close profile stats section
  
  return html;
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
  
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-6">';
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-6">OP Score History (Last 20 Matches)</h2>';
  html += '<div class="bg-slate-900 rounded-lg p-6 futuristic-chart-container" style="height: 500px; position: relative; background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%); border: 1px solid rgba(0, 128, 255, 0.2); box-shadow: inset 0 0 30px rgba(0, 128, 255, 0.1), 0 0 40px rgba(0, 128, 255, 0.1);">';
  html += '<canvas id="opScoreChart" style="max-height: 100%; filter: drop-shadow(0 0 8px rgba(0, 191, 255, 0.6)) drop-shadow(0 0 15px rgba(0, 128, 255, 0.4));"></canvas>';
  html += '</div>';
  html += '</div>';
  
  // Add Profile Stats section
  html += calculateAndDisplayProfileStats(recentMatches);
  
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
    
    // Create a plugin to apply gradients dynamically
    const gradientPlugin = {
      id: 'neonGradient',
      afterLayout: (chart) => {
        // Store gradients in chart for later use
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        if (!chartArea) return;
        
        const dataset = chart.data.datasets[0];
        
        // Create gradient for border color (vertical gradient from top to bottom - neon blue)
        const lineGradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        lineGradient.addColorStop(0, '#00BFFF'); // Bright neon blue at top
        lineGradient.addColorStop(0.5, '#0080FF'); // Deep blue in middle
        lineGradient.addColorStop(1, '#0066FF'); // Deeper neon blue at bottom
        
        // Create gradient for area fill (darker at bottom, brighter at top - neon blue)
        const fillGradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        fillGradient.addColorStop(0, 'rgba(0, 191, 255, 0.4)'); // Bright neon blue at top
        fillGradient.addColorStop(0.5, 'rgba(0, 128, 255, 0.3)'); // Deep blue in middle
        fillGradient.addColorStop(1, 'rgba(0, 102, 255, 0.2)'); // Deeper neon blue at bottom
        
        // Store gradients in chart for use during drawing
        chart.neonGradients = {
          line: lineGradient,
          fill: fillGradient
        };
        
        // Apply gradients to the dataset
        dataset.borderColor = lineGradient;
        dataset.backgroundColor = fillGradient;
      }
    };
    
    // Plugin to update tooltip text colors based on win/loss
    const tooltipColorPlugin = {
      id: 'tooltipColors',
      beforeTooltipDraw: (chart) => {
        const tooltip = chart.tooltip;
        if (!tooltip || !tooltip.dataPoints || tooltip.dataPoints.length === 0) return;
        
        // Get the active data point
        const activePoint = tooltip.dataPoints[0];
        const index = activePoint.dataIndex;
        const match = recentMatches[index];
        if (!match) return;
        
        const isWin = match.win;
        // Update tooltip text colors dynamically based on win/loss
        // Green for victory, red for defeat
        tooltip.options.titleColor = isWin ? '#00FF88' : '#FF4444';
        tooltip.options.bodyColor = isWin ? '#E0FFE0' : '#FFE0E0';
      }
    };
    
    window.opScoreChartInstance = new Chart(ctx, {
      type: 'line',
      plugins: [gradientPlugin, tooltipColorPlugin],
      data: {
        labels: recentMatches.map((m, i) => `Match ${recentMatches.length - i}`),
        datasets: [{
          label: 'OP Score',
          data: recentMatches.map(m => m.opScore || 0),
          borderColor: '#0080FF', // Temporary neon blue, will be replaced by plugin
          backgroundColor: 'rgba(0, 128, 255, 0.2)', // Temporary neon blue, will be replaced by plugin
          borderWidth: 4,
          pointRadius: 0, // Hide points for cleaner look
          pointHoverRadius: 10,
          pointBackgroundColor: function(context) {
            // Return green for victory, red for defeat
            const index = context.dataIndex;
            const match = recentMatches[index];
            return match && match.win ? '#00FF88' : '#FF4444';
          },
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 3,
          pointHoverBackgroundColor: function(context) {
            // Return green for victory, red for defeat
            const index = context.dataIndex;
            const match = recentMatches[index];
            return match && match.win ? '#00FF88' : '#FF4444';
          },
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 4,
          tension: 0.5, // Smoother curves
          fill: true,
          borderCapStyle: 'round',
          borderJoinStyle: 'round'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeOutQuart',
          delay: 0
        },
        transitions: {
          show: {
            animations: {
              x: {
                from: 0
              },
              y: {
                from: 0
              }
            }
          },
          hide: {
            animations: {
              x: {
                to: 0
              },
              y: {
                to: 0
              }
            }
          }
        },
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
            backgroundColor: 'rgba(10, 15, 26, 0.95)', // Darker background
            borderColor: '#0080FF', // Neon blue border
            borderWidth: 2,
            padding: 12,
            titleColor: '#00BFFF', // Bright neon blue title (will be overridden by plugin for win/loss)
            bodyColor: '#E0F7FA', // Light cyan body text (will be overridden by plugin for win/loss)
            displayColors: false,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13,
              weight: 'normal'
            },
            boxPadding: 6,
            boxWidth: 20,
            cornerRadius: 6,
            callbacks: {
              title: function(context) {
                if (!context || !context[0]) return '';
                const index = context[0].dataIndex;
                const match = recentMatches[index];
                if (!match) return 'Match Data';
                const winText = match.win ? 'Victory' : 'Defeat';
                return `${formatDate(match.date)} - ${winText}`;
              },
              label: function(context) {
                // Return empty array to hide default label since we'll use afterBody
                return [];
              },
              afterBody: function(context) {
                if (!context || context.length === 0) return [];
                const index = context[0].dataIndex;
                const match = recentMatches[index];
                if (!match) return ['No data'];
                const prefix = match.win ? '✓' : '✗';
                const labels = [
                  `${prefix} ${match.champion} (${match.role})`,
                  `OP Score: ${(match.opScore || 0).toFixed(1)}/10`,
                  `KDA: ${match.kda}`
                ];
                // Add score if it exists in the match data
                if (match.score !== undefined) {
                  labels.push(`Score: ${match.score.toFixed(1)}/10`);
                }
                return labels;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            max: 10,
            grid: {
              color: 'rgba(0, 128, 255, 0.15)', // Subtle neon blue grid lines
              lineWidth: 1,
              drawBorder: true,
              borderColor: 'rgba(0, 191, 255, 0.3)'
            },
            ticks: {
              color: '#0080FF', // Neon blue text
              font: {
                size: 11,
                weight: 'bold'
              },
              backdropColor: 'rgba(15, 23, 42, 0.8)',
              padding: 6,
              stepSize: 1
            },
            title: {
              display: true,
              text: 'OP Score (out of 10)',
              color: '#00BFFF', // Bright neon blue title
              font: {
                size: 13,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 10
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 128, 255, 0.15)', // Subtle neon blue grid lines
              lineWidth: 1,
              drawBorder: true,
              borderColor: 'rgba(0, 191, 255, 0.3)'
            },
            ticks: {
              color: '#0080FF', // Neon blue text
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10,
                weight: 'bold'
              },
              backdropColor: 'rgba(15, 23, 42, 0.8)',
              padding: 6
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
  console.log("📊 displayOverview called - Current leagueData:", {
    rank: leagueData.currentRank,
    matchesCount: leagueData.matches.length,
    championsCount: leagueData.mostPlayedChampions.length,
    pastSeasonsCount: leagueData.pastSeasonRanks.length
  });
  
  // Current Rank Section (if available) - non-uniform box (wide but not tall)
  let html = '';
  if (leagueData.currentRank) {
    html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6" style="width: 100%; min-height: 140px; max-height: 160px;">';
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
  
  html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">';
  
  // Past Season Ranks Section
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
  html += '<h3 class="text-lg font-semibold text-gray-200 uppercase tracking-wide mb-4">Past Season Ranks</h3>';
  html += '<div class="grid grid-cols-2 gap-4">';
  leagueData.pastSeasonRanks.forEach(s => {
    const pastTier = extractTierFromRank(s.rank);
    const pastRankImagePath = pastTier ? getRankImagePath(pastTier) : null;
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors">';
    html += '<div class="flex flex-col items-start gap-2">';
    html += `<div class="text-gray-400 text-xs font-semibold uppercase tracking-wide">${s.season}</div>`;
    html += '<div class="flex items-center gap-2">';
    if (pastRankImagePath) {
      html += `<img src="${pastRankImagePath}" alt="${s.rank} rank" class="w-8 h-8 object-contain" onerror="this.style.display='none';">`;
    }
    html += `<span class="text-gray-300 font-medium">${s.rank}</span>`;
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div></div>';
  
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

// Function to display Mini game activities menu
function displayMiniGame() {
  let html = '<div class="space-y-6">';
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-6">Mini Games</h2>';
  html += '<p class="text-gray-400 mb-6">Choose an activity to play:</p>';
  
  html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">';
  
  // Duo Draft Activity Card
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-sky-500 transition-all duration-200 cursor-pointer group" onclick="displayDuoDraft()">';
  html += '<div class="flex items-center gap-3 mb-3">';
  html += '<div class="text-3xl">🎮</div>';
  html += '<h3 class="text-xl font-semibold text-gray-100 group-hover:text-sky-400 transition-colors">Duo Draft</h3>';
  html += '</div>';
  html += '<p class="text-gray-400 text-sm mb-4">Search for 2 players and let AI simulate who\'d win more matches together based on their match history.</p>';
  html += '<div class="text-sky-400 text-sm font-medium">Click to play →</div>';
  html += '</div>';
  
  // Champion Picker Activity Card
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-sky-500 transition-all duration-200 cursor-pointer group" onclick="displayChampionPicker()">';
  html += '<div class="flex items-center gap-3 mb-3">';
  html += '<div class="text-3xl">🎲</div>';
  html += '<h3 class="text-xl font-semibold text-gray-100 group-hover:text-sky-400 transition-colors">Champion Picker</h3>';
  html += '</div>';
  html += '<p class="text-gray-400 text-sm mb-4">Get a smart random champion recommendation based on your performance history and win rates.</p>';
  html += '<div class="text-sky-400 text-sm font-medium">Click to play →</div>';
  html += '</div>';
  
  // Match Predictor Activity Card
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-sky-500 transition-all duration-200 cursor-pointer group" onclick="displayMatchPredictor()">';
  html += '<div class="flex items-center gap-3 mb-3">';
  html += '<div class="text-3xl">🔮</div>';
  html += '<h3 class="text-xl font-semibold text-gray-100 group-hover:text-sky-400 transition-colors">Match Predictor</h3>';
  html += '</div>';
  html += '<p class="text-gray-400 text-sm mb-4">Enter team compositions and predict the match outcome based on champion strengths and your performance data.</p>';
  html += '<div class="text-sky-400 text-sm font-medium">Click to play →</div>';
  html += '</div>';
  
  // Rank Calculator Activity Card
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-sky-500 transition-all duration-200 cursor-pointer group" onclick="displayRankCalculator()">';
  html += '<div class="flex items-center gap-3 mb-3">';
  html += '<div class="text-3xl">📊</div>';
  html += '<h3 class="text-xl font-semibold text-gray-100 group-hover:text-sky-400 transition-colors">Rank Calculator</h3>';
  html += '</div>';
  html += '<p class="text-gray-400 text-sm mb-4">Calculate how many wins you need to rank up, estimate LP gains/losses, and plan your climb.</p>';
  html += '<div class="text-sky-400 text-sm font-medium">Click to play →</div>';
  html += '</div>';
  
  html += '</div>'; // Close grid
  html += '</div>'; // Close space-y-6
  
  $('#dynamicContent').html(html);
}

// Function to display Duo Draft game
function displayDuoDraft() {
  let html = '<div class="space-y-6">';
  
  // Back button
  html += '<button onclick="displayMiniGame()" class="text-sky-400 hover:text-sky-300 transition-colors mb-4 flex items-center gap-2">';
  html += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>';
  html += 'Back to Mini Games';
  html += '</button>';
  
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-2">Duo Draft</h2>';
  html += '<p class="text-gray-400 mb-6">Search for 2 players to see how well they would work together based on their match history!</p>';
  
  // Player Search Form
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Player 1</label>';
  html += '<input type="text" id="player1Search" placeholder="Enter player name..." class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors" />';
  html += '</div>';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Player 2</label>';
  html += '<input type="text" id="player2Search" placeholder="Enter player name..." class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors" />';
  html += '</div>';
  html += '</div>';
  html += '<button onclick="simulateDuoDraft()" class="w-full md:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">';
  html += 'Simulate Duo Compatibility';
  html += '</button>';
  html += '</div>';
  
  // Results container (initially hidden)
  html += '<div id="duoResults" class="hidden">';
  html += '</div>';
  
  html += '</div>';
  
  $('#dynamicContent').html(html);
}

// Function to find all unique players from match history
function getAllPlayersFromMatches() {
  const players = new Set();
  leagueData.matches.forEach(match => {
    if (match.playerRoster) {
      match.playerRoster.forEach(player => {
        if (player.player && player.player !== 'You') {
          players.add(player.player);
        }
      });
    }
  });
  return Array.from(players).sort();
}

// Function to find matches where both players played together
function findDuoMatches(player1, player2) {
  const duoMatches = [];
  leagueData.matches.forEach(match => {
    if (match.playerRoster) {
      const player1Found = match.playerRoster.find(p => p.player === player1);
      const player2Found = match.playerRoster.find(p => p.player === player2);
      
      // Check if both players were on the same team (positions 1-5 or 6-10)
      if (player1Found && player2Found) {
        const player1Team = player1Found.position <= 5 ? 'team1' : 'team2';
        const player2Team = player2Found.position <= 5 ? 'team1' : 'team2';
        
        if (player1Team === player2Team) {
          duoMatches.push({
            match: match,
            player1Data: player1Found,
            player2Data: player2Found,
            win: player1Team === 'team1' ? match.win : !match.win
          });
        }
      }
    }
  });
  return duoMatches;
}

// Function to simulate duo compatibility using AI-like algorithm
function simulateDuoDraft() {
  const player1 = $('#player1Search').val().trim();
  const player2 = $('#player2Search').val().trim();
  
  if (!player1 || !player2) {
    alert('Please enter both player names!');
    return;
  }
  
  // Find matches where they played together
  const duoMatches = findDuoMatches(player1, player2);
  
  if (duoMatches.length === 0) {
    // If no historical matches, show message and create a prediction based on individual stats
    showDuoResults(player1, player2, [], null);
    return;
  }
  
  // Calculate statistics
  let wins = 0;
  let totalMatches = duoMatches.length;
  let avgScore1 = 0;
  let avgScore2 = 0;
  let avgKDA1 = 0;
  let avgKDA2 = 0;
  let combinedAvgScore = 0;
  
  duoMatches.forEach(duo => {
    if (duo.win) wins++;
    avgScore1 += duo.player1Data.score || 0;
    avgScore2 += duo.player2Data.score || 0;
    const kda1 = ((duo.player1Data.kills || 0) + (duo.player1Data.assists || 0)) / Math.max(duo.player1Data.deaths || 1, 1);
    const kda2 = ((duo.player2Data.kills || 0) + (duo.player2Data.assists || 0)) / Math.max(duo.player2Data.deaths || 1, 1);
    avgKDA1 += kda1;
    avgKDA2 += kda2;
    combinedAvgScore += ((duo.player1Data.score || 0) + (duo.player2Data.score || 0)) / 2;
  });
  
  avgScore1 /= totalMatches;
  avgScore2 /= totalMatches;
  avgKDA1 /= totalMatches;
  avgKDA2 /= totalMatches;
  combinedAvgScore /= totalMatches;
  
  const winRate = (wins / totalMatches) * 100;
  
  // AI Simulation: Predict future win rate
  // Factors: Historical win rate (40%), Combined average score (30%), Individual KDA synergy (20%), Sample size (10%)
  const baseWinRate = winRate;
  const scoreBonus = Math.min((combinedAvgScore - 75) / 2, 10); // Max +10% if score > 75
  const kdaSynergy = Math.min((avgKDA1 + avgKDA2 - 2) * 2, 10); // Max +10% if combined KDA > 2
  const sampleSizeBonus = Math.min(totalMatches * 0.5, 5); // Up to +5% for larger sample
  
  const predictedWinRate = baseWinRate * 0.4 + 
                          (50 + scoreBonus) * 0.3 + 
                          (50 + kdaSynergy) * 0.2 + 
                          (50 + sampleSizeBonus) * 0.1;
  
  const clampedWinRate = Math.max(20, Math.min(90, predictedWinRate)); // Clamp between 20% and 90%
  
  // Generate AI analysis
  const analysis = generateDuoAnalysis(player1, player2, duoMatches, winRate, clampedWinRate, combinedAvgScore, avgKDA1, avgKDA2, totalMatches);
  
  showDuoResults(player1, player2, duoMatches, {
    historicalWinRate: winRate,
    predictedWinRate: clampedWinRate,
    totalMatches: totalMatches,
    avgScore1: avgScore1,
    avgScore2: avgScore2,
    avgKDA1: avgKDA1,
    avgKDA2: avgKDA2,
    combinedAvgScore: combinedAvgScore,
    analysis: analysis
  });
}

// Function to generate AI analysis of duo compatibility
function generateDuoAnalysis(player1, player2, duoMatches, historicalWinRate, predictedWinRate, combinedScore, avgKDA1, avgKDA2, matchCount) {
  let analysis = [];
  
  if (matchCount === 0) {
    analysis.push(`No historical matches found for ${player1} and ${player2}. This analysis is based on individual performance patterns.`);
    analysis.push(`Try searching with players who have played together in your match history.`);
    return analysis;
  }
  
  analysis.push(`📊 **Match History**: Found ${matchCount} game${matchCount !== 1 ? 's' : ''} played together.`);
  analysis.push(`Historical Win Rate: ${historicalWinRate.toFixed(1)}%`);
  analysis.push(`Predicted Future Win Rate: ${predictedWinRate.toFixed(1)}%`);
  
  // Win rate analysis
  if (predictedWinRate >= 65) {
    analysis.push(`\n🔥 **Strong Duo**: These two players have excellent synergy! Their predicted win rate suggests they'd win most games together.`);
  } else if (predictedWinRate >= 55) {
    analysis.push(`\n✅ **Good Duo**: This pairing shows solid potential. They work well together and should maintain a positive win rate.`);
  } else if (predictedWinRate >= 45) {
    analysis.push(`\n⚠️ **Average Duo**: Mixed results suggest this duo might need more coordination. Consider practicing together more.`);
  } else {
    analysis.push(`\n❌ **Challenging Duo**: Based on historical data, this pairing may struggle. Focus on communication and role synergy.`);
  }
  
  // Score analysis
  if (combinedScore >= 85) {
    analysis.push(`Both players consistently perform at high levels together (avg score: ${combinedScore.toFixed(1)}), indicating strong gameplay synergy.`);
  } else if (combinedScore >= 75) {
    analysis.push(`Their combined performance is solid (avg score: ${combinedScore.toFixed(1)}), showing they can contribute effectively together.`);
  } else {
    analysis.push(`Performance could be improved (avg score: ${combinedScore.toFixed(1)}). Consider working on individual mechanics and team coordination.`);
  }
  
  // KDA analysis
  const avgKDA = (avgKDA1 + avgKDA2) / 2;
  if (avgKDA >= 2.5) {
    analysis.push(`Strong KDA synergy (combined avg: ${avgKDA.toFixed(2)}) suggests they complement each other's playstyles well.`);
  } else if (avgKDA >= 1.5) {
    analysis.push(`Decent KDA performance (combined avg: ${avgKDA.toFixed(2)}) with room for improvement in coordination.`);
  } else {
    analysis.push(`Lower KDA numbers (combined avg: ${avgKDA.toFixed(2)}) indicate they may need to work on staying alive and securing kills together.`);
  }
  
  // Sample size note
  if (matchCount < 5) {
    analysis.push(`\n⚠️ Note: Limited sample size (${matchCount} game${matchCount !== 1 ? 's' : ''}). More games together would provide more accurate predictions.`);
  }
  
  return analysis;
}

// Function to display duo draft results
function showDuoResults(player1, player2, duoMatches, stats) {
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">';
  html += '<h3 class="text-xl font-bold text-gray-100">Duo Analysis Results</h3>';
  
  if (stats) {
    // Win Rate Display
    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4">';
    html += '<div class="text-gray-400 text-sm mb-1">Historical Win Rate</div>';
    const historicalColor = stats.historicalWinRate >= 50 ? 'text-emerald-400' : 'text-red-400';
    html += `<div class="text-3xl font-bold ${historicalColor}">${stats.historicalWinRate.toFixed(1)}%</div>`;
    html += `<div class="text-gray-500 text-xs mt-1">${stats.totalMatches} game${stats.totalMatches !== 1 ? 's' : ''} together</div>`;
    html += '</div>';
    
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4">';
    html += '<div class="text-gray-400 text-sm mb-1">Predicted Win Rate</div>';
    const predictedColor = stats.predictedWinRate >= 50 ? 'text-emerald-400' : 'text-red-400';
    html += `<div class="text-3xl font-bold ${predictedColor}">${stats.predictedWinRate.toFixed(1)}%</div>`;
    html += '<div class="text-gray-500 text-xs mt-1">AI Simulation</div>';
    html += '</div>';
    html += '</div>';
    
    // Stats Display
    html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3">';
    html += '<div class="text-gray-400 text-xs mb-1">Player 1 Avg Score</div>';
    html += `<div class="text-lg font-bold text-gray-200">${stats.avgScore1.toFixed(1)}</div>`;
    html += '</div>';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3">';
    html += '<div class="text-gray-400 text-xs mb-1">Player 2 Avg Score</div>';
    html += `<div class="text-lg font-bold text-gray-200">${stats.avgScore2.toFixed(1)}</div>`;
    html += '</div>';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3">';
    html += '<div class="text-gray-400 text-xs mb-1">Combined Avg Score</div>';
    html += `<div class="text-lg font-bold text-sky-400">${stats.combinedAvgScore.toFixed(1)}</div>`;
    html += '</div>';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3">';
    html += '<div class="text-gray-400 text-xs mb-1">Avg Combined KDA</div>';
    html += `<div class="text-lg font-bold text-gray-200">${((stats.avgKDA1 + stats.avgKDA2) / 2).toFixed(2)}</div>`;
    html += '</div>';
    html += '</div>';
    
    // AI Analysis
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
    html += '<h4 class="text-lg font-semibold text-gray-100 mb-3">AI Analysis</h4>';
    html += '<div class="text-gray-300 text-sm space-y-2">';
    stats.analysis.forEach(line => {
      html += `<p class="whitespace-pre-line">${line}</p>`;
    });
    html += '</div>';
    html += '</div>';
    
    // Match History (if available)
    if (duoMatches.length > 0) {
      html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
      html += '<h4 class="text-lg font-semibold text-gray-100 mb-3">Matches Played Together</h4>';
      html += '<div class="space-y-2 max-h-60 overflow-y-auto">';
      duoMatches.slice(0, 10).forEach((duo, idx) => {
        const winClass = duo.win ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10';
        const winText = duo.win ? 'Victory' : 'Defeat';
        const winTextColor = duo.win ? 'text-emerald-400' : 'text-red-400';
        html += `<div class="border rounded-lg p-3 ${winClass}">`;
        html += `<div class="flex justify-between items-center">`;
        html += `<div>`;
        html += `<div class="text-sm font-semibold text-gray-200">${formatDate(duo.match.date)}</div>`;
        html += `<div class="text-xs text-gray-400">${duo.match.champion} (${duo.match.role})</div>`;
        html += `</div>`;
        html += `<div class="${winTextColor} font-bold">${winText}</div>`;
        html += `</div>`;
        html += `</div>`;
      });
      if (duoMatches.length > 10) {
        html += `<div class="text-gray-400 text-sm text-center mt-2">... and ${duoMatches.length - 10} more</div>`;
      }
      html += '</div>';
      html += '</div>';
    }
  } else {
    html += '<div class="bg-slate-900 border border-yellow-500 rounded-lg p-5">';
    html += '<p class="text-yellow-400 font-semibold mb-2">⚠️ No Historical Data Found</p>';
    html += `<p class="text-gray-300 text-sm">Could not find any matches where ${player1} and ${player2} played together on the same team.</p>`;
    html += '<p class="text-gray-400 text-xs mt-2">Available players in match history:</p>';
    const availablePlayers = getAllPlayersFromMatches();
    if (availablePlayers.length > 0) {
      html += '<div class="mt-2 flex flex-wrap gap-2">';
      availablePlayers.slice(0, 20).forEach(player => {
        html += `<span class="px-2 py-1 bg-slate-800 text-gray-300 text-xs rounded">${player}</span>`;
      });
      if (availablePlayers.length > 20) {
        html += `<span class="text-gray-500 text-xs">+${availablePlayers.length - 20} more</span>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }
  
  html += '</div>';
  
  $('#duoResults').html(html).removeClass('hidden');
}

// Function to display Champion Picker game
function displayChampionPicker() {
  let html = '<div class="space-y-6">';
  
  // Back button
  html += '<button onclick="displayMiniGame()" class="text-sky-400 hover:text-sky-300 transition-colors mb-4 flex items-center gap-2">';
  html += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>';
  html += 'Back to Mini Games';
  html += '</button>';
  
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-2">Champion Picker</h2>';
  html += '<p class="text-gray-400 mb-6">Get a smart recommendation for which champion to play based on your match history!</p>';
  
  // Options
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">';
  html += '<div class="space-y-4">';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Pick for Role</label>';
  html += '<select id="championPickerRole" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors">';
  html += '<option value="">Any Role</option>';
  html += '<option value="Top">Top</option>';
  html += '<option value="Jungle">Jungle</option>';
  html += '<option value="Mid">Mid</option>';
  html += '<option value="Bot">Bot</option>';
  html += '<option value="Support">Support</option>';
  html += '</select>';
  html += '</div>';
  html += '<div>';
  html += '<label class="flex items-center gap-2 text-gray-300 text-sm">';
  html += '<input type="checkbox" id="preferHighWinRate" class="w-4 h-4 text-sky-600 bg-slate-900 border-slate-600 rounded focus:ring-sky-500" />';
  html += '<span>Prefer champions with high win rate</span>';
  html += '</label>';
  html += '</div>';
  html += '<button onclick="pickChampion()" class="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">';
  html += '🎲 Pick My Champion!';
  html += '</button>';
  html += '</div>';
  html += '</div>';
  
  // Results container
  html += '<div id="championPickerResults" class="hidden">';
  html += '</div>';
  
  html += '</div>';
  
  $('#dynamicContent').html(html);
}

// Function to pick a champion based on user stats
function pickChampion() {
  const role = $('#championPickerRole').val();
  const preferHighWinRate = $('#preferHighWinRate').is(':checked');
  
  // Get all champions from match history with stats
  const championStats = {};
  
  leagueData.matches.forEach(match => {
    if (!match.champion) return;
    
    const champName = match.champion;
    if (!championStats[champName]) {
      championStats[champName] = {
        name: champName,
        games: 0,
        wins: 0,
        avgScore: 0,
        roles: new Set(),
        totalScore: 0
      };
    }
    
    // Filter by role if specified
    if (role && match.role !== role) return;
    
    championStats[champName].games++;
    if (match.win) championStats[champName].wins++;
    if (match.role) championStats[champName].roles.add(match.role);
    if (match.score !== undefined) {
      championStats[champName].totalScore += match.score;
    }
  });
  
  // Calculate win rates and averages
  Object.keys(championStats).forEach(champ => {
    const stats = championStats[champ];
    stats.winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
    stats.avgScore = stats.games > 0 ? stats.totalScore / stats.games : 0;
  });
  
  // Get list of all champions (use most played champions + champions from matches)
  const allChampions = new Set();
  leagueData.mostPlayedChampions.forEach(champ => allChampions.add(champ.name));
  Object.keys(championStats).forEach(champ => allChampions.add(champ));
  
  // If no matches found with role filter, use all champions
  let candidates = Array.from(allChampions);
  
  // Filter by role if specified
  if (role && Object.keys(championStats).length > 0) {
    candidates = Object.keys(championStats).filter(champ => {
      return championStats[champ].roles.has(role) || championStats[champ].games === 0;
    });
    // If no matches with that role, fall back to all champions
    if (candidates.length === 0) {
      candidates = Array.from(allChampions);
    }
  }
  
  // Weight champions based on preferences
  let weightedChampions = [];
  candidates.forEach(champ => {
    const stats = championStats[champ] || { games: 0, winRate: 50, avgScore: 75 };
    let weight = 1;
    
    // Boost weight for champions with history
    if (stats.games > 0) {
      weight += 2; // Prefer champions you've played
      
      // If prefer high win rate, boost those
      if (preferHighWinRate && stats.winRate >= 55) {
        weight += stats.winRate / 10; // More weight for higher win rate
      } else if (!preferHighWinRate) {
        // If not preferring high win rate, include variety (even new champs)
        weight += 1;
      }
      
      // Slight boost for champions with good average scores
      if (stats.avgScore >= 80) {
        weight += 1;
      }
    } else {
      // New champions get some weight too (for variety)
      weight += 0.5;
    }
    
    // Add multiple entries for weighted random selection
    for (let i = 0; i < Math.ceil(weight * 10); i++) {
      weightedChampions.push(champ);
    }
  });
  
  // Pick random champion
  const randomIndex = Math.floor(Math.random() * weightedChampions.length);
  const pickedChampion = weightedChampions[randomIndex];
  const pickedStats = championStats[pickedChampion] || { games: 0, winRate: 0, avgScore: 0 };
  
  // Generate recommendation message
  let recommendation = [];
  if (pickedStats.games === 0) {
    recommendation.push(`🎲 **${pickedChampion}** - New Champion Pick!`);
    recommendation.push('This is a champion you haven\'t played yet. Time to expand your champion pool!');
  } else {
    recommendation.push(`🎲 **${pickedChampion}** - Your Smart Pick!`);
    recommendation.push(`You've played ${pickedStats.games} game${pickedStats.games !== 1 ? 's' : ''} with ${pickedChampion}.`);
    recommendation.push(`Win Rate: ${pickedStats.winRate.toFixed(1)}%`);
    if (pickedStats.avgScore > 0) {
      recommendation.push(`Average Score: ${pickedStats.avgScore.toFixed(1)}`);
    }
    
    if (pickedStats.winRate >= 60) {
      recommendation.push('\n🔥 Excellent choice! This champion has been performing well for you.');
    } else if (pickedStats.winRate >= 50) {
      recommendation.push('\n✅ Good pick! This champion has a positive win rate in your hands.');
    } else if (pickedStats.winRate > 0) {
      recommendation.push('\n💪 Challenge yourself! This champion could use more practice to improve your win rate.');
    }
    
    if (pickedStats.roles.size > 0) {
      const rolesList = Array.from(pickedStats.roles).join(', ');
      recommendation.push(`\nCan be played in: ${rolesList}`);
    }
  }
  
  showChampionPickerResults(pickedChampion, recommendation, pickedStats);
}

// Function to display champion picker results
function showChampionPickerResults(champion, recommendation, stats) {
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">';
  html += '<h3 class="text-2xl font-bold text-gray-100 mb-4">Your Champion Pick</h3>';
  
  html += '<div class="bg-slate-900 border border-sky-500 rounded-lg p-6 text-center">';
  html += `<div class="text-6xl mb-4">🎲</div>`;
  html += `<h4 class="text-3xl font-bold text-sky-400 mb-2">${champion}</h4>`;
  if (stats.games > 0) {
    const winRateColor = stats.winRate >= 60 ? 'text-emerald-400' : stats.winRate >= 50 ? 'text-yellow-400' : 'text-gray-400';
    html += `<div class="text-lg ${winRateColor} font-semibold">${stats.winRate.toFixed(1)}% Win Rate</div>`;
  } else {
    html += '<div class="text-lg text-gray-400 font-semibold">New Champion</div>';
  }
  html += '</div>';
  
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<h4 class="text-lg font-semibold text-gray-100 mb-3">Recommendation</h4>';
  html += '<div class="text-gray-300 text-sm space-y-2">';
  recommendation.forEach(line => {
    html += `<p class="whitespace-pre-line">${line}</p>`;
  });
  html += '</div>';
  html += '</div>';
  
  if (stats.games > 0) {
    html += '<div class="grid grid-cols-3 gap-4">';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">';
    html += '<div class="text-gray-400 text-xs mb-1">Games Played</div>';
    html += `<div class="text-2xl font-bold text-gray-200">${stats.games}</div>`;
    html += '</div>';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">';
    html += '<div class="text-gray-400 text-xs mb-1">Wins</div>';
    html += `<div class="text-2xl font-bold text-emerald-400">${stats.wins}</div>`;
    html += '</div>';
    html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">';
    html += '<div class="text-gray-400 text-xs mb-1">Losses</div>';
    html += `<div class="text-2xl font-bold text-red-400">${stats.games - stats.wins}</div>`;
    html += '</div>';
    html += '</div>';
  }
  
  html += '<button onclick="pickChampion()" class="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">';
  html += '🎲 Pick Another Champion';
  html += '</button>';
  
  html += '</div>';
  
  $('#championPickerResults').html(html).removeClass('hidden');
}

// Function to display Match Predictor game
function displayMatchPredictor() {
  let html = '<div class="space-y-6">';
  
  // Back button
  html += '<button onclick="displayMiniGame()" class="text-sky-400 hover:text-sky-300 transition-colors mb-4 flex items-center gap-2">';
  html += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>';
  html += 'Back to Mini Games';
  html += '</button>';
  
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-2">Match Predictor</h2>';
  html += '<p class="text-gray-400 mb-6">Enter team compositions to predict the match outcome!</p>';
  
  // Team Composition Forms
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">';
  
  // Your Team
  html += '<div class="bg-slate-800 border border-emerald-500/30 rounded-lg p-6">';
  html += '<h3 class="text-lg font-semibold text-emerald-400 mb-4">Your Team</h3>';
  html += '<div class="space-y-3">';
  ['Top', 'Jungle', 'Mid', 'Bot', 'Support'].forEach((role, idx) => {
    html += `<div>`;
    html += `<label class="block text-gray-300 text-sm font-medium mb-1">${role}</label>`;
    html += `<input type="text" id="yourTeam${idx}" placeholder="Champion name..." class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-emerald-500 transition-colors" />`;
    html += `</div>`;
  });
  html += '</div>';
  html += '</div>';
  
  // Enemy Team
  html += '<div class="bg-slate-800 border border-red-500/30 rounded-lg p-6">';
  html += '<h3 class="text-lg font-semibold text-red-400 mb-4">Enemy Team</h3>';
  html += '<div class="space-y-3">';
  ['Top', 'Jungle', 'Mid', 'Bot', 'Support'].forEach((role, idx) => {
    html += `<div>`;
    html += `<label class="block text-gray-300 text-sm font-medium mb-1">${role}</label>`;
    html += `<input type="text" id="enemyTeam${idx}" placeholder="Champion name..." class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-red-500 transition-colors" />`;
    html += `</div>`;
  });
  html += '</div>';
  html += '</div>';
  
  html += '</div>'; // Close grid
  
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">';
  html += '<button onclick="predictMatch()" class="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">';
  html += '🔮 Predict Match Outcome';
  html += '</button>';
  html += '</div>';
  
  // Results container
  html += '<div id="matchPredictorResults" class="hidden">';
  html += '</div>';
  
  html += '</div>';
  
  $('#dynamicContent').html(html);
}

// Function to predict match outcome
function predictMatch() {
  const yourTeam = [];
  const enemyTeam = [];
  
  // Collect team compositions
  for (let i = 0; i < 5; i++) {
    const yourChamp = $(`#yourTeam${i}`).val().trim();
    const enemyChamp = $(`#enemyTeam${i}`).val().trim();
    if (yourChamp) yourTeam.push({ champion: yourChamp, role: ['Top', 'Jungle', 'Mid', 'Bot', 'Support'][i] });
    if (enemyChamp) enemyTeam.push({ champion: enemyChamp, role: ['Top', 'Jungle', 'Mid', 'Bot', 'Support'][i] });
  }
  
  if (yourTeam.length === 0 && enemyTeam.length === 0) {
    alert('Please enter at least some champions for prediction!');
    return;
  }
  
  // Calculate your team strength based on your performance
  let yourTeamStrength = 0;
  let yourChampionsFound = 0;
  
  yourTeam.forEach(({ champion, role }) => {
    const champMatches = leagueData.matches.filter(m => 
      m.champion && m.champion.toLowerCase() === champion.toLowerCase()
    );
    
    if (champMatches.length > 0) {
      yourChampionsFound++;
      const wins = champMatches.filter(m => m.win).length;
      const winRate = (wins / champMatches.length) * 100;
      const avgScore = champMatches.reduce((sum, m) => sum + (m.score || 75), 0) / champMatches.length;
      
      // Add to team strength (win rate and score combined)
      yourTeamStrength += (winRate * 0.6) + ((avgScore / 100) * 40);
    } else {
      // Unknown champion - use base 50% (neutral)
      yourTeamStrength += 50;
    }
  });
  
  // Average team strength
  if (yourTeam.length > 0) {
    yourTeamStrength = yourTeamStrength / yourTeam.length;
  } else {
    yourTeamStrength = 50; // Default if no team entered
  }
  
  // Enemy team strength (randomized since we don't have their data, but consider composition)
  const enemyTeamStrength = 45 + Math.random() * 15; // Between 45-60% (slightly favoring you for fun)
  
  // Calculate win probability
  let winProbability = 50; // Base 50%
  
  // Adjust based on your team strength vs enemy
  const strengthDiff = yourTeamStrength - enemyTeamStrength;
  winProbability = 50 + (strengthDiff * 0.8); // Convert strength difference to win probability
  
  // Bonus if you're playing a champion you're good at
  if (yourChampionsFound === yourTeam.length && yourTeam.length > 0) {
    winProbability += 5; // Small bonus for playing all champions you know
  }
  
  // Clamp between 20% and 80%
  winProbability = Math.max(20, Math.min(80, winProbability));
  
  // Generate analysis
  const analysis = generateMatchAnalysis(yourTeam, enemyTeam, yourTeamStrength, enemyTeamStrength, winProbability, yourChampionsFound, yourTeam.length);
  
  showMatchPredictorResults(winProbability, analysis, yourTeam, enemyTeam);
}

// Function to generate match analysis
function generateMatchAnalysis(yourTeam, enemyTeam, yourStrength, enemyStrength, winProb, championsFound, totalTeam) {
  let analysis = [];
  
  analysis.push(`📊 **Match Prediction**: ${winProb.toFixed(1)}% chance to win`);
  
  if (winProb >= 65) {
    analysis.push(`\n🔥 **Strong Advantage**: Your team composition and your personal performance history suggest a high likelihood of victory!`);
  } else if (winProb >= 55) {
    analysis.push(`\n✅ **Slight Advantage**: You have a decent chance to win this match. Play smart and capitalize on your advantages.`);
  } else if (winProb >= 45) {
    analysis.push(`\n⚖️ **Even Match**: This looks like a close game. Focus on objectives and team coordination.`);
  } else {
    analysis.push(`\n⚠️ **Underdog**: This will be a challenging match. Focus on farming, vision control, and wait for enemy mistakes.`);
  }
  
  if (totalTeam > 0) {
    const familiarityRate = (championsFound / totalTeam) * 100;
    analysis.push(`\n📈 **Champion Familiarity**: ${championsFound}/${totalTeam} champions in your team are in your match history.`);
    
    if (familiarityRate >= 80) {
      analysis.push(`Excellent team composition! You're playing champions you're experienced with, which boosts your chances.`);
    } else if (familiarityRate >= 50) {
      analysis.push(`Good mix of familiar and new champions. Consider focusing on your comfort picks.`);
    } else {
      analysis.push(`Consider swapping some champions for ones you have more experience with to increase your win probability.`);
    }
  }
  
  if (yourTeam.length < 5) {
    analysis.push(`\n💡 Note: A complete team composition with all 5 roles filled would give more accurate predictions.`);
  }
  
  return analysis;
}

// Function to display match predictor results
function showMatchPredictorResults(winProbability, analysis, yourTeam, enemyTeam) {
  const willWin = winProbability >= 50;
  const resultColor = willWin ? 'emerald' : 'red';
  const resultText = willWin ? 'VICTORY' : 'DEFEAT';
  const resultEmoji = willWin ? '🏆' : '😔';
  
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">';
  html += '<h3 class="text-2xl font-bold text-gray-100 mb-4">Match Prediction Result</h3>';
  
  const borderColorClass = resultColor === 'emerald' ? 'border-emerald-500' : 'border-red-500';
  const textColorClass = resultColor === 'emerald' ? 'text-emerald-400' : 'text-red-400';
  html += `<div class="bg-slate-900 border-2 ${borderColorClass} rounded-lg p-8 text-center">`;
  html += `<div class="text-6xl mb-4">${resultEmoji}</div>`;
  html += `<h4 class="text-4xl font-bold ${textColorClass} mb-2">${winProbability.toFixed(1)}%</h4>`;
  html += `<div class="text-xl text-gray-300 font-semibold">Predicted ${resultText}</div>`;
  html += '</div>';
  
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<h4 class="text-lg font-semibold text-gray-100 mb-3">Analysis</h4>';
  html += '<div class="text-gray-300 text-sm space-y-2">';
  analysis.forEach(line => {
    html += `<p class="whitespace-pre-line">${line}</p>`;
  });
  html += '</div>';
  html += '</div>';
  
  html += '</div>';
  
  $('#matchPredictorResults').html(html).removeClass('hidden');
}

// Function to display Rank Calculator game
function displayRankCalculator() {
  let html = '<div class="space-y-6">';
  
  // Back button
  html += '<button onclick="displayMiniGame()" class="text-sky-400 hover:text-sky-300 transition-colors mb-4 flex items-center gap-2">';
  html += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>';
  html += 'Back to Mini Games';
  html += '</button>';
  
  html += '<h2 class="text-2xl font-bold text-gray-100 mb-2">Rank Calculator</h2>';
  html += '<p class="text-gray-400 mb-6">Calculate your rank progression and plan your climb!</p>';
  
  // Current Rank Display
  const currentRank = leagueData.currentRank;
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">';
  html += '<h3 class="text-lg font-semibold text-gray-100 mb-4">Current Rank</h3>';
  if (currentRank) {
    html += `<div class="text-2xl font-bold text-sky-400 mb-1">${currentRank.tier} ${currentRank.division}</div>`;
    html += `<div class="text-gray-400">${currentRank.lp} LP</div>`;
  } else {
    html += '<div class="text-gray-400">No rank data available</div>';
  }
  html += '</div>';
  
  // Calculator Form
  html += '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">';
  html += '<h3 class="text-lg font-semibold text-gray-100 mb-4">Calculate Progress</h3>';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Average LP Gain per Win</label>';
  html += '<input type="number" id="lpGain" value="18" min="10" max="30" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors" />';
  html += '</div>';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Average LP Loss per Defeat</label>';
  html += '<input type="number" id="lpLoss" value="18" min="10" max="30" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors" />';
  html += '</div>';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Win Rate (%)</label>';
  html += '<input type="number" id="winRate" value="55" min="0" max="100" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors" />';
  html += '</div>';
  html += '<div>';
  html += '<label class="block text-gray-300 text-sm font-medium mb-2">Target: Games to Play</label>';
  html += '<input type="number" id="gamesToPlay" value="10" min="1" max="100" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-sky-500 transition-colors" />';
  html += '</div>';
  html += '</div>';
  html += '<button onclick="calculateRankProgress()" class="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">';
  html += '📊 Calculate Rank Progress';
  html += '</button>';
  html += '</div>';
  
  // Results container
  html += '<div id="rankCalculatorResults" class="hidden">';
  html += '</div>';
  
  html += '</div>';
  
  $('#dynamicContent').html(html);
}

// Function to calculate rank progress
function calculateRankProgress() {
  const lpGain = parseFloat($('#lpGain').val()) || 18;
  const lpLoss = parseFloat($('#lpLoss').val()) || 18;
  const winRate = parseFloat($('#winRate').val()) || 50;
  const gamesToPlay = parseInt($('#gamesToPlay').val()) || 10;
  
  if (winRate < 0 || winRate > 100) {
    alert('Win rate must be between 0 and 100!');
    return;
  }
  
  // Calculate expected outcomes
  const expectedWins = Math.round(gamesToPlay * (winRate / 100));
  const expectedLosses = gamesToPlay - expectedWins;
  
  // Calculate net LP
  const totalLPGain = expectedWins * lpGain;
  const totalLPLoss = expectedLosses * lpLoss;
  const netLP = totalLPGain - totalLPLoss;
  
  // Get current rank info
  const currentRank = leagueData.currentRank;
  const currentLP = currentRank ? currentRank.lp : 0;
  const newLP = currentLP + netLP;
  
  // Calculate division progress
  const lpPerDivision = 100;
  const divisions = ['IV', 'III', 'II', 'I'];
  let currentDivisionIndex = divisions.indexOf(currentRank?.division || 'IV');
  let projectedDivision = currentRank?.division || 'IV';
  let projectedLP = newLP;
  
  // Handle LP overflow into next division
  while (projectedLP >= lpPerDivision && currentDivisionIndex < divisions.length - 1) {
    projectedLP -= lpPerDivision;
    currentDivisionIndex++;
    projectedDivision = divisions[currentDivisionIndex];
  }
  
  // Handle LP going negative (demotion risk)
  while (projectedLP < 0 && currentDivisionIndex > 0) {
    projectedLP += lpPerDivision;
    currentDivisionIndex--;
    projectedDivision = divisions[currentDivisionIndex];
  }
  
  // Clamp LP between 0 and 100
  projectedLP = Math.max(0, Math.min(100, projectedLP));
  
  const tier = currentRank?.tier || 'Unranked';
  const finalRank = `${tier} ${projectedDivision}`;
  
  // Generate insights
  const insights = generateRankInsights(netLP, expectedWins, expectedLosses, winRate, gamesToPlay, finalRank, currentRank?.division || 'IV', projectedDivision);
  
  showRankCalculatorResults({
    currentLP: currentLP,
    newLP: newLP,
    netLP: netLP,
    expectedWins: expectedWins,
    expectedLosses: expectedLosses,
    totalLPGain: totalLPGain,
    totalLPLoss: totalLPLoss,
    projectedLP: projectedLP,
    projectedDivision: projectedDivision,
    finalRank: finalRank,
    tier: tier,
    gamesToPlay: gamesToPlay,
    winRate: winRate,
    insights: insights
  });
}

// Function to generate rank insights
function generateRankInsights(netLP, wins, losses, winRate, games, finalRank, currentDiv, projectedDiv) {
  let insights = [];
  
  insights.push(`📊 **Projection**: After ${games} games at ${winRate}% win rate:`);
  insights.push(`Expected Wins: ${wins} | Expected Losses: ${losses}`);
  insights.push(`Net LP Change: ${netLP > 0 ? '+' : ''}${netLP.toFixed(0)} LP`);
  
  if (netLP > 0) {
    insights.push(`\n🎯 **Progress**: You're projected to gain ${Math.abs(netLP).toFixed(0)} LP!`);
    if (projectedDiv !== currentDiv && projectedDiv === 'I') {
      insights.push(`You'll reach ${finalRank}, which might qualify you for a promotion series!`);
    } else if (projectedDiv !== currentDiv) {
      insights.push(`You'll advance to ${finalRank}! Keep climbing!`);
    }
  } else if (netLP < 0) {
    insights.push(`\n⚠️ **Warning**: You're projected to lose ${Math.abs(netLP).toFixed(0)} LP.`);
    insights.push(`Consider improving your win rate or playing fewer games to minimize losses.`);
  } else {
    insights.push(`\n⚖️ **Neutral**: Your LP will remain roughly the same.`);
    insights.push(`To climb, aim for a higher win rate or play more games with this win rate.`);
  }
  
  if (winRate >= 60) {
    insights.push(`\n🔥 Excellent win rate! At this pace, you'll climb steadily.`);
  } else if (winRate >= 55) {
    insights.push(`\n✅ Good win rate. You'll make progress, but it might be gradual.`);
  } else if (winRate < 50) {
    insights.push(`\n⚠️ Your win rate is below 50%. Focus on improvement before climbing.`);
  }
  
  // Calculate games needed for promotion (if positive LP)
  if (netLP > 0 && currentDiv !== 'I') {
    const lpNeededForNextDiv = 100; // Assuming 100 LP per division
    const lpToNextDiv = 100 - (leagueData.currentRank?.lp || 0) + (100 * (['IV', 'III', 'II', 'I'].indexOf(currentDiv) - 0));
    const gamesNeeded = Math.ceil((lpNeededForNextDiv) / (netLP / games));
    insights.push(`\n📈 At this rate, you'd need approximately ${gamesNeeded} games to reach the next division.`);
  }
  
  return insights;
}

// Function to display rank calculator results
function showRankCalculatorResults(data) {
  const isPositive = data.netLP > 0;
  const resultColor = isPositive ? 'emerald' : data.netLP < 0 ? 'red' : 'gray';
  
  let html = '<div class="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">';
  html += '<h3 class="text-2xl font-bold text-gray-100 mb-4">Rank Progress Calculation</h3>';
  
  // Projected Rank Display
  const borderColorClass = resultColor === 'emerald' ? 'border-emerald-500' : resultColor === 'red' ? 'border-red-500' : 'border-gray-500';
  const textColorClass = resultColor === 'emerald' ? 'text-emerald-400' : resultColor === 'red' ? 'text-red-400' : 'text-gray-400';
  html += `<div class="bg-slate-900 border-2 ${borderColorClass} rounded-lg p-6 text-center">`;
  html += '<div class="text-gray-400 text-sm mb-2">Projected Rank After ' + data.gamesToPlay + ' Games</div>';
  html += `<div class="text-3xl font-bold ${textColorClass} mb-1">${data.finalRank}</div>`;
  html += `<div class="text-xl text-gray-300">${Math.round(data.projectedLP)} LP</div>`;
  html += '</div>';
  
  // LP Breakdown
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">Current LP</div>';
  html += `<div class="text-2xl font-bold text-gray-200">${data.currentLP}</div>`;
  html += '</div>';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">LP Gained</div>';
  html += `<div class="text-2xl font-bold text-emerald-400">+${data.totalLPGain}</div>`;
  html += '</div>';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">LP Lost</div>';
  html += `<div class="text-2xl font-bold text-red-400">-${data.totalLPLoss}</div>`;
  html += '</div>';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">Net Change</div>';
  const netColor = isPositive ? 'text-emerald-400' : data.netLP < 0 ? 'text-red-400' : 'text-gray-400';
  html += `<div class="text-2xl font-bold ${netColor}">${data.netLP > 0 ? '+' : ''}${Math.round(data.netLP)}</div>`;
  html += '</div>';
  html += '</div>';
  
  // Game Statistics
  html += '<div class="grid grid-cols-3 gap-4">';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">Expected Wins</div>';
  html += `<div class="text-2xl font-bold text-emerald-400">${data.expectedWins}</div>`;
  html += '</div>';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">Expected Losses</div>';
  html += `<div class="text-2xl font-bold text-red-400">${data.expectedLosses}</div>`;
  html += '</div>';
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">';
  html += '<div class="text-gray-400 text-xs mb-1">Win Rate</div>';
  html += `<div class="text-2xl font-bold text-sky-400">${data.winRate}%</div>`;
  html += '</div>';
  html += '</div>';
  
  // Insights
  html += '<div class="bg-slate-900 border border-slate-700 rounded-lg p-5">';
  html += '<h4 class="text-lg font-semibold text-gray-100 mb-3">Insights</h4>';
  html += '<div class="text-gray-300 text-sm space-y-2">';
  data.insights.forEach(line => {
    html += `<p class="whitespace-pre-line">${line}</p>`;
  });
  html += '</div>';
  html += '</div>';
  
  html += '</div>';
  
  $('#rankCalculatorResults').html(html).removeClass('hidden');
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

    // Handle different tabs - use cached data for instant display
    if (tabId === 1) {
      // Overview tab - instant display with cached data
      fetchLeagueData(false).then(() => {
        displayOverview();
      });
    } else if (tabId === 2) {
      // Score tab - instant display with cached data
      fetchLeagueData(false).then(() => {
        displayScore();
      });
    } else if (tabId === 3) {
      // Match History tab - instant display with cached data
      console.log('Match History tab clicked, using cached data...');
      fetchLeagueData(false).then(() => {
        console.log('Displaying match history from cache');
        displayChampRoleOverview();
      });
    } else if (tabId === 4) {
      // Quests tab - instant display with cached data
      fetchLeagueData(false).then(() => {
        displayQuests();
      });
    } else if (tabId === 5) {
      // Mini game tab - no data needed
      displayMiniGame();
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

// This function automatically cycles through different login splash art images with smooth crossfade
let loginBgCycleInterval = null;

function initLoginBackgroundCycling() {
  // Array of login splash art image paths to cycle through
  const loginImages = [
    'Images/loginsplashart1.jpg',
    'Images/loginsplashart2.jpg',
    'Images/loginsplashart3.jpg',
    'Images/loginsplashart4.jpg',
    'Images/loginsplashart5.jpeg'
  ];
  
  let currentLoginIndex = 0;
  const loginBgElement1 = document.getElementById('loginBgImage1');
  const loginBgElement2 = document.getElementById('loginBgImage2');
  
  // Check if login background elements exist
  if (!loginBgElement1 || !loginBgElement2) {
    console.warn('Login background elements not found');
    return;
  }
  
  // Track which image is currently visible (1 or 2)
  let currentVisible = 1;
  
  // Set initial state: image 1 visible, image 2 hidden
  loginBgElement1.style.opacity = '1';
  loginBgElement1.style.zIndex = '2';
  loginBgElement2.style.opacity = '0';
  loginBgElement2.style.zIndex = '1';
  
  // Set initial image
  loginBgElement1.src = loginImages[0];
  
  // Function to change to the next background image with crossfade
  function changeLoginBackground() {
    // Get the next image index
    currentLoginIndex = (currentLoginIndex + 1) % loginImages.length;
    const nextImageSrc = loginImages[currentLoginIndex];
    
    // Determine which image to update (the one that's currently hidden)
    let imageToUpdate, imageToShow, imageToHide;
    
    if (currentVisible === 1) {
      // Image 1 is visible, so update image 2 and fade it in
      imageToUpdate = loginBgElement2;
      imageToShow = loginBgElement2;
      imageToHide = loginBgElement1;
      currentVisible = 2;
      // Bring image 2 to front
      loginBgElement2.style.zIndex = '2';
      loginBgElement1.style.zIndex = '1';
    } else {
      // Image 2 is visible, so update image 1 and fade it in
      imageToUpdate = loginBgElement1;
      imageToShow = loginBgElement1;
      imageToHide = loginBgElement2;
      currentVisible = 1;
      // Bring image 1 to front
      loginBgElement1.style.zIndex = '2';
      loginBgElement2.style.zIndex = '1';
    }
    
    // Set the new image source (this happens instantly while opacity is 0)
    imageToUpdate.src = nextImageSrc;
    
    // Crossfade: fade out the visible image while fading in the new one
    imageToHide.style.opacity = '0';
    imageToShow.style.opacity = '1';
  }
  
  // Clear any existing interval
  if (loginBgCycleInterval) {
    clearInterval(loginBgCycleInterval);
  }
  
  // Start cycling: change background every 8 seconds (8000 milliseconds)
  loginBgCycleInterval = setInterval(changeLoginBackground, 8000);
  
  // Preload all login background images for smoother transitions
  loginImages.forEach(imagePath => {
    const img = new Image();
    img.src = imagePath;
  });
  
  console.log('Login background cycling initialized with', loginImages.length, 'images (crossfade enabled)');
}

// Stop login background cycling
function stopLoginBackgroundCycling() {
  if (loginBgCycleInterval) {
    clearInterval(loginBgCycleInterval);
    loginBgCycleInterval = null;
    console.log('Login background cycling stopped');
  }
}

// On document ready, initialize League data and load default tab content
// Save user credentials to localStorage
function saveCredentials(apiKey, gameName, tagLine, region) {
  // Use default API key if not provided
  const defaultApiKey = 'RGAPI-47148504-2d76-4d11-93aa-2e7db404f98f';
  const credentials = { 
    apiKey: apiKey || defaultApiKey, 
    gameName, 
    tagLine, 
    region 
  };
  localStorage.setItem('lolCredentials', JSON.stringify(credentials));
  userCredentials = credentials;
  console.log("💾 Credentials saved:", { 
    apiKey: '***', 
    gameName, 
    tagLine, 
    region 
  });
}

// Load user credentials from localStorage
function loadCredentials() {
  try {
    const saved = localStorage.getItem('lolCredentials');
    if (saved) {
      userCredentials = JSON.parse(saved);
      return true;
    }
  } catch (err) {
    console.error('Error loading credentials:', err);
  }
  return false;
}

// Clear saved credentials
function clearCredentials() {
  localStorage.removeItem('lolCredentials');
  userCredentials = { apiKey: null, gameName: null, tagLine: null, region: null };
}

// Show login page
function showLoginPage() {
  $('#loginPage').removeClass('hidden');
  $('#dashboardPage').addClass('hidden');
  // Initialize login background cycling when login page is shown
  initLoginBackgroundCycling();
  // Pre-populate form if credentials exist
  if (userCredentials.gameName) {
    $('#apiKey')?.val(userCredentials.apiKey || '');
    $('#gameName').val(userCredentials.gameName);
    $('#tagLine').val(userCredentials.tagLine);
    $('#region').val(userCredentials.region);
  }
}

// Show dashboard (hide login page)
function showDashboard() {
  $('#loginPage').addClass('hidden');
  $('#dashboardPage').removeClass('hidden');
  // Stop login background cycling when dashboard is shown
  stopLoginBackgroundCycling();
}

// Handle logout
function handleLogout() {
  clearCredentials();
  // Reset data load state to force fresh fetch on next login
  dataLoadState.isLoaded = false;
  dataLoadState.isLoading = false;
  dataLoadState.lastLoadTime = null;
  dataLoadState.loadPromise = null;
  // Clear league data
  leagueData = {
    currentRank: null,
    pastSeasonRanks: [],
    mostPlayedChampions: [],
    quests: [],
    matches: [],
    playerLevel: {
      level: 1,
      totalXP: 0,
      xpForNextLevel: 100
    }
  };
  showLoginPage();
  $('#dynamicContent').html('');
  // Reload the page to ensure a clean state
  location.reload();
}

// Handle login form submission
function handleLoginSubmit(e) {
  e.preventDefault();
  
  // Lambda requires api_key field in request (even if empty - Lambda handles it internally)
  const apiKey = $('#apiKey').val() || '';
  const gameName = $('#gameName').val().trim();
  const tagLine = $('#tagLine').val().trim();
  const region = $('#region').val().trim();
  
  console.log("📝 Form submission - Raw values:", { 
    apiKey: apiKey || '(empty)',
    gameName: gameName || '(empty)',
    tagLine: tagLine || '(empty)',
    region: region || '(empty)'
  });
  
  const errorDiv = $('#loginError');
  const errorSpan = errorDiv.find('span');
  errorDiv.addClass('hidden');
  errorSpan.text('');
  
  // Validate all fields including API key
  if (!apiKey || !apiKey.trim()) {
    errorSpan.html(`
      <strong>⚠️ API Key Required</strong><br>
      <small class="text-gray-400">Please enter your Riot API key. Get one from <a href="https://developer.riotgames.com/" target="_blank" class="text-sky-400 underline">Riot Developer Portal</a></small>
    `);
    errorDiv.removeClass('hidden');
    return;
  }
  
  if (!gameName || !tagLine || !region) {
    errorSpan.text(`Please fill in all fields. Missing: ${!gameName ? 'Game Name' : ''} ${!tagLine ? 'Tag Line' : ''} ${!region ? 'Region' : ''}`);
    errorDiv.removeClass('hidden');
    return;
  }
  
  // Validate API key format
  const trimmedApiKey = apiKey.trim();
  if (!trimmedApiKey.startsWith('RGAPI-')) {
    errorSpan.html(`
      <strong>⚠️ Invalid API Key Format</strong><br>
      <small class="text-gray-400">API key must start with "RGAPI-". Check that you copied the full key from the Riot Developer Portal.</small>
    `);
    errorDiv.removeClass('hidden');
    return;
  }
  
  // Save credentials (use provided API key)
  saveCredentials(trimmedApiKey, gameName, tagLine, region);
  
  // Show loading state
  const submitBtn = $('#loginSubmitBtn');
  const btnText = $('#loginBtnText');
  submitBtn.prop('disabled', true);
  btnText.text('Loading...');
  
  // Show loading message on login page
  errorDiv.addClass('hidden');
  
  // Reset data load state for fresh fetch
  dataLoadState.isLoaded = false;
  dataLoadState.isLoading = false;
  dataLoadState.lastLoadTime = null;
  dataLoadState.loadPromise = null;
  
  // Fetch data (force refresh on login)
  fetchLeagueData(true, true)
    .then(() => {
      console.log("✅ Data fetch complete, showing dashboard");
      console.log("📊 Current leagueData:", {
        rank: leagueData.currentRank,
        matches: leagueData.matches.length,
        champions: leagueData.mostPlayedChampions.length
      });
      
      // Show dashboard and hide login page
      showDashboard();
      
      // Set first tab as active and load overview
      $('.tab').first().addClass('border-sky-500 text-sky-400').removeClass('border-transparent text-gray-500');
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        displayOverview();
        console.log("✅ Overview displayed with API data");
      }, 100);
    })
    .catch((error) => {
      console.error("❌ Login failed:", error);
      
      // Format error message for display
      let errorMessage = error.message;
      let is403Error = error.message.includes('403') || error.message.includes('Forbidden');
      
      if (is403Error) {
        // Convert newlines to HTML breaks for better formatting
        errorMessage = error.message.replace(/\n/g, '<br>');
        
        // Highlight the API key expiration warning
        errorMessage = errorMessage.replace(
          /⚠️ MOST COMMON CAUSE: API KEY EXPIRED/g,
          '<strong class="text-yellow-400">⚠️ MOST COMMON CAUSE: API KEY EXPIRED</strong>'
        );
        errorMessage = errorMessage.replace(
          /🔑 API KEY EXPIRED/g,
          '<strong class="text-yellow-400">🔑 API KEY EXPIRED</strong>'
        );
      }
      
      const errorSpan = errorDiv.find('span');
      errorSpan.html(`
        ${is403Error ? '<div class="mb-3 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg"><strong class="text-yellow-400">⚠️ API Key Likely Expired</strong><br><small class="text-gray-300">Riot API keys expire after 24 hours. Get a new key from the <a href="https://developer.riotgames.com/" target="_blank" class="text-sky-400 underline">Riot Developer Portal</a> and update it in the form above.</small></div>' : ''}
        <strong>Error:</strong> ${errorMessage}<br>
        <small class="text-gray-500 mt-2 block">Check browser console (F12) for detailed diagnostics</small>
      `);
      errorDiv.removeClass('hidden');
      submitBtn.prop('disabled', false);
      btnText.text('Load Player Data');
    });
}

$(document).ready(function() {
  console.log("On Load");
  
  // Check for saved credentials
  const hasCredentials = loadCredentials();
  
  // Setup login form handler
  $('#loginForm').on('submit', handleLoginSubmit);
  
  // Enhanced dropdown arrow animation
  const regionSelect = $('#region');
  const regionArrow = $('#regionArrow');
  
  if (regionSelect.length && regionArrow.length) {
    // Rotate arrow on focus/blur
    regionSelect.on('focus', function() {
      regionArrow.css('transform', 'rotate(180deg)');
    });
    
    regionSelect.on('blur', function() {
      regionArrow.css('transform', 'rotate(0deg)');
    });
    
    // Also handle change event for better UX
    regionSelect.on('change', function() {
      // Add a subtle pulse effect when selection changes
      regionSelect.addClass('ring-2 ring-sky-500/50');
      setTimeout(() => {
        regionSelect.removeClass('ring-2 ring-sky-500/50');
      }, 300);
    });
  }
  
  // Pre-populate form if credentials exist
  if (hasCredentials) {
    $('#apiKey')?.val(userCredentials.apiKey || '');
    $('#gameName').val(userCredentials.gameName);
    $('#tagLine').val(userCredentials.tagLine);
    $('#region').val(userCredentials.region);
  }
  
  // Initialize banner cycling (only for dashboard)
  initBannerCycling();
  
  // Initialize login background cycling if login page is visible
  if (!$('#loginPage').hasClass('hidden')) {
    initLoginBackgroundCycling();
  }
  
  // Setup tab click handlers
  setupTabHandlers();
  
  // If no credentials, show login page immediately
  if (!hasCredentials) {
    console.log("No credentials found, showing login page");
    showLoginPage();
    return; // Exit early, don't try to load data
  }
  
  // User has saved credentials, show dashboard and load data
  console.log("Credentials found, showing dashboard");
  showDashboard();
  
  // Check if URL has a match parameter and open that match
  checkAndOpenMatchFromUrl();
  
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('match');
  
  if (!matchId) {
    // Set first tab as active
    $('.tab').first().addClass('border-sky-500 text-sky-400').removeClass('border-transparent text-gray-500');
    
    // Reset data load state for fresh fetch on page load
    dataLoadState.isLoaded = false;
    dataLoadState.isLoading = false;
    dataLoadState.lastLoadTime = null;
    dataLoadState.loadPromise = null;
    
    // Initialize League data from API (no mock data fallback)
    fetchLeagueData(true, true)
      .then(() => {
        console.log("✅ Auto-load complete, displaying overview");
        console.log("📊 leagueData before display:", leagueData);
        displayOverview();
      })
      .catch((error) => {
        console.error("❌ Auto-load failed:", error);
        // Show error but don't use mock data
        $('#dynamicContent').html(`
          <div class="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h3 class="text-red-400 font-semibold mb-2">Error Loading Data</h3>
            <p class="text-gray-300 mb-4">${error.message}</p>
            <p class="text-gray-400 text-sm mb-4">Please try logging in again or check the console for details.</p>
            <button onclick="handleLogout()" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded">
              Go to Login
            </button>
          </div>
        `);
      });
  }
});


