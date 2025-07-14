# Updated Voice Query Backend Code

Add this updated endpoint to your `app.py` file in RoamlyService:

```python
class VoiceQuery(BaseModel):
    query: str
    userCountry: str = "default"
    interestOne: str = ""
    latitude: float = None
    longitude: float = None
    landmarkContext: str = None  # Add this new field

@app.post("/voice-query/")
async def process_voice_query(voice_query: VoiceQuery):
    try:
        query = voice_query.query.lower().strip()
        
        # If we have landmark context, prioritize that landmark
        if voice_query.landmarkContext:
            landmark_id = voice_query.landmarkContext.replace(" ", "_").lower()
            
            # Try to get a response for this specific landmark
            try:
                response = assemble_response(
                    landmark_id=landmark_id,
                    landmark_type="general",
                    user_country=voice_query.userCountry,
                    interest=voice_query.interestOne
                )
                
                return {
                    "type": "success",
                    "landmark": landmark_id,
                    "response": response,
                    "query": query
                }
                
            except Exception as landmark_error:
                # If landmark not found, continue with normal processing
                pass
        
        # Extract landmark name from query patterns
        landmark_patterns = [
            r"tell me about (.+)",
            r"what is (.+)",
            r"tell me (.+)",
            r"about (.+)",
            r"this (.+)",
            r"that (.+)",
            r"the (.+)"
        ]
        
        extracted_landmark = None
        for pattern in landmark_patterns:
            match = re.search(pattern, query)
            if match:
                extracted_landmark = match.group(1).strip()
                break
        
        if not extracted_landmark:
            # If no landmark found, try to find nearby landmarks based on location
            if voice_query.latitude and voice_query.longitude:
                # Use your existing get-properties logic to find nearby landmarks
                geohash_code = geohash.encode(voice_query.latitude, voice_query.longitude, precision=6)
                
                scan_results = landmarks_table.scan(
                    FilterExpression=Attr("geohash").eq(geohash_code)
                )
                
                nearby_landmarks = scan_results.get("Items", [])
                if nearby_landmarks:
                    # Return the closest landmark as a suggestion
                    closest_landmark = nearby_landmarks[0]["landmark_id"]
                    return {
                        "type": "suggestion",
                        "message": f"I found a landmark near you: {closest_landmark.replace('_', ' ')}. Would you like to know more about it?",
                        "landmark": closest_landmark,
                        "query": query
                    }
            
            return {
                "type": "no_match",
                "message": "I couldn't identify a specific landmark from your query. Try saying 'Hey Roamly, tell me about [landmark name]' or point your camera at a building.",
                "query": query
            }
        
        # Clean up the landmark name
        landmark_id = extracted_landmark.replace(" ", "_").lower()
        
        # Try to get a response for this landmark
        try:
            response = assemble_response(
                landmark_id=landmark_id,
                landmark_type="general",  # You might want to detect the type
                user_country=voice_query.userCountry,
                interest=voice_query.interestOne
            )
            
            return {
                "type": "success",
                "landmark": landmark_id,
                "response": response,
                "query": query
            }
            
        except Exception as landmark_error:
            # If landmark not found, suggest similar landmarks
            return {
                "type": "landmark_not_found",
                "message": f"I couldn't find information about '{extracted_landmark}'. Try asking about a different landmark or use the camera to scan a building.",
                "query": query,
                "suggested_query": f"Try: 'Hey Roamly, tell me about [landmark name]'"
            }
    
    except Exception as e:
        print("🔥 ERROR in /voice-query:", e)
        raise HTTPException(status_code=500, detail=f"Failed to process voice query: {str(e)}")
```

## Key Changes:

1. **Added `landmarkContext` field** to the VoiceQuery model
2. **Prioritizes landmark context** when provided
3. **Falls back to normal processing** if landmark context fails
4. **Better error handling** for landmark-specific queries

## Usage:

- **From main screen**: No landmark context, searches for landmarks in query
- **From landmark details**: Includes landmark context, focuses on that specific landmark
- **Follow-up questions**: Automatically uses the current landmark as context

This allows users to ask follow-up questions like "What's the history?" or "Tell me more about the architecture" while viewing a specific landmark, and the system will know which landmark they're referring to. 

# Voice Query Backend Implementation

## New Endpoint for Speech-to-Text

Add this endpoint to your FastAPI backend to handle voice recordings:

```python
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import speech_recognition as sr
import tempfile
import os
from pydub import AudioSegment

app = FastAPI()

@app.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    try:
        # Save uploaded audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Convert m4a to wav (speech_recognition works better with wav)
        audio_segment = AudioSegment.from_file(temp_file_path, format="m4a")
        wav_path = temp_file_path.replace(".m4a", ".wav")
        audio_segment.export(wav_path, format="wav")
        
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Load audio file
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            
        # Convert speech to text
        text = recognizer.recognize_google(audio_data)
        
        # Clean up temporary files
        os.unlink(temp_file_path)
        os.unlink(wav_path)
        
        return JSONResponse(content={"transcript": text})
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to transcribe audio: {str(e)}"}
        )
```

## Required Dependencies

Add these to your `requirements.txt`:

```
SpeechRecognition==3.10.0
pydub==0.25.1
PyAudio==0.2.11
```

## Installation Notes

1. **PyAudio Installation**: On some systems, you might need to install additional dependencies:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install python3-pyaudio portaudio19-dev
   
   # macOS
   brew install portaudio
   ```

2. **Alternative Speech-to-Text Services**: You can also use cloud services:
   - Google Cloud Speech-to-Text
   - Azure Speech Services
   - AWS Transcribe
   - OpenAI Whisper API

## Frontend Configuration

Update the `YOUR_BACKEND_URL` in `VoiceQueryButton.tsx` with your actual backend URL:

```typescript
const response = await fetch('http://your-backend-url:8000/speech-to-text', {
  // ... rest of the code
});
```

## Testing the Voice Feature

1. Start your backend server
2. Update the backend URL in the frontend
3. Test voice recording in your app
4. Check the console for any errors

## Error Handling

The implementation includes error handling for:
- File upload failures
- Audio format conversion issues
- Speech recognition failures
- Network errors

## Security Considerations

- Validate file types and sizes
- Implement rate limiting
- Add authentication if needed
- Consider using HTTPS in production 