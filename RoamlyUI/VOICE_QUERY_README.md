# Voice Query Feature for Roamly

## Overview
The voice query feature allows users to ask questions about landmarks using natural language, such as "Hey Roamly, tell me about this building" or "What is the Eiffel Tower?"

## Frontend Implementation

### Components Added:
1. **VoiceQueryButton** (`components/VoiceQueryButton.tsx`)
   - Floating Action Button (FAB) with microphone icon
   - Modal with text input for queries
   - Processes natural language queries
   - Extracts landmark names from user input

### Integration:
- Added to the main explore screen (`app/(tabs)/index.tsx`)
- Handles query results and navigates to landmark details
- Provides user feedback for different response types

## Backend Implementation

### New Endpoints (to be added to `app.py`):

#### 1. `/voice-query/` (POST)
Processes voice queries and returns landmark information.

**Request Body:**
```json
{
  "query": "Hey Roamly, tell me about the Eiffel Tower",
  "userCountry": "USA",
  "interestOne": "Architecture",
  "latitude": 48.8584,
  "longitude": 2.2945
}
```

**Response Types:**
- `success`: Found landmark with response
- `suggestion`: Found nearby landmark
- `landmark_not_found`: Landmark not in database
- `no_match`: Could not identify landmark

#### 2. `/semantic-search/` (POST) - Optional
Advanced semantic search using FAISS index.

## Usage Examples

### User Queries:
- "Hey Roamly, tell me about this building"
- "What is the Eiffel Tower?"
- "Tell me about the Statue of Liberty"
- "About the Colosseum"

### Query Processing:
1. Extracts landmark name using regex patterns
2. Searches database for landmark information
3. Returns personalized response based on user preferences
4. Provides navigation to detailed landmark page

## Next Steps

### 1. Add Backend Endpoints
Copy the code from `voice_query_endpoint.py` to your `app.py` file in RoamlyService.

### 2. Test the Feature
1. Start your backend server
2. Run the frontend app
3. Tap the microphone FAB
4. Try queries like "Hey Roamly, tell me about [landmark name]"

### 3. Enhancements
- **Speech Recognition**: Integrate real voice-to-text
- **Camera Integration**: Combine with landmark scanning
- **Offline Support**: Cache responses for offline use
- **Voice Response**: Text-to-speech for answers

## Files Modified:
- `components/VoiceQueryButton.tsx` (new)
- `app/(tabs)/index.tsx` (updated)
- `voice_query_endpoint.py` (backend code to add)

## Dependencies:
- `expo-speech` (already installed)
- `react-native-paper` (FAB, Modal components)
- `axios` (API calls)

The voice query feature is now ready for testing! Users can tap the microphone button and ask questions about landmarks in natural language. 