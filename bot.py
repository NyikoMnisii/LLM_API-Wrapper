import os
import sys
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

if not os.environ.get("GEMINI_API_KEY"):
    print("Error: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
    sys.exit(1)

# Initialize FastAPI App
app = FastAPI(
    title="Agrilite AI Agronomist API",
    description="Production-grade API wrapper for agricultural decision support with function calling."
)

# Enable CORS for frontend frameworks (React, Flutter, Vue, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
client = genai.Client()

# --- 1. CORE AGRICULTURAL WEATHER FUNCTION ---
def get_agricultural_weather(location: str, days: int = 3) -> str:
    """Fetch a multi-day weather forecast for a farming region to check for frost, rain, or disease risks.
    
    Args:
        location: The city, town, or farming district name typed by the user (e.g., 'Ceres', 'Iowa City').
        days: Number of days to forecast. Must be between 1 and 7. Defaults to 3.
    """
    try:
        geo_url = f"https://open-meteo.com{location}&count=3&language=en&format=json"
        geo_res = requests.get(geo_url, timeout=5).json()
        results = geo_res.get("results", [])

        if not results:
            return json.dumps({
                "status": "REQUIRES_CLARIFICATION",
                "reason": f"I couldn't find any location named '{location}'. Could you check the spelling or add a province/country?"
            })
            
        if len(results) > 1 and results[0]["name"] == results[1]["name"]:
            options = [f"{r.get('name')}, {r.get('admin1', '')} ({r.get('country', '')})" for r in results[:3]]
            return json.dumps({
                "status": "REQUIRES_CLARIFICATION",
                "reason": f"I found multiple places named '{location}'. Did you mean:\n" + "\n".join([f"- {opt}" for opt in options])
            })

        best_match = results[0]
        lat = best_match["latitude"]
        lon = best_match["longitude"]
        resolved_name = f"{best_match['name']}, {best_match.get('admin1', '')} ({best_match.get('country', '')})"

        weather_url = (
            f"https://open-meteo.com{lat}&longitude={lon}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max"
            f"&forecast_days={days}&timezone=auto"
        )
        weather_res = requests.get(weather_url, timeout=5).json()
        daily = weather_res.get("daily", {})

        if not daily:
            return json.dumps({"status": "ERROR", "reason": "Failed to retrieve metrics from weather station."})

        min_temps = daily.get("temperature_2m_min", [])
        max_humidities = daily.get("relative_humidity_2m_max", [])
        
        return json.dumps({
            "status": "SUCCESS",
            "resolved_location": resolved_name,
            "dates": daily.get("time", []),
            "min_temperatures_celsius": min_temps,
            "max_temperatures_celsius": daily.get("temperature_2m_max", []),
            "total_precipitation_mm": daily.get("precipitation_sum", []),
            "frost_warning": any(t <= 2.0 for t in min_temps if t is not None),
            "high_humidity_fungal_risk": any(h >= 85 for h in max_humidities if h is not None)
        })

    except Exception as e:
        return json.dumps({"status": "ERROR", "reason": f"API internal connection issue: {str(e)}"})

available_functions = {
    "get_agricultural_weather": get_agricultural_weather
}

# --- 2. STRUCTURED RESPONSE SCHEMAS (PYDANTIC) ---
class AgronomistResponse(BaseModel):
    analysis: str = Field(description="The core botanical, climate, or agricultural analysis of the query.")
    recommendations: list[str] = Field(description="List of actionable, step-by-step farming, preventative treatments, or scheduling tasks.")
    sustainability_note: str = Field(description="Eco-friendly, water-saving, or safe chemical handling advice based on current data.")
    is_farming_related: bool = Field(description="True if the query is about plants/soil/farming/weather, False otherwise.")

# Incoming client request payload structure
class ChatMessage(BaseModel):
    role: str = Field(description="The role of the sender, either 'user', 'model', or 'function'.")
    content: str = Field(description="The text content or tool output of the message.")

class ChatPayload(BaseModel):
    message: str = Field(description="The latest prompt submitted by the user.")
    history: list[ChatMessage] = Field(default=[], description="The list of previous message payloads for context continuity.")

# --- 3. PERSONA TUNING ---
agronomist_persona = (
    "You are an expert agronomist, crop scientist, and digital farming assistant. "
    "Your job is to provide highly accurate, practical, and scientifically sound advice. "
    "You have access to a weather tool. Always use it if the user asks about weather, planting, spraying, or harvesting schedules. "
    "If the tool returns 'REQUIRES_CLARIFICATION', map its 'reason' text exactly into the 'analysis' field and leave recommendations empty. "
    "Always populate the requested JSON schema accurately. If the user query is "
    "unrelated to agriculture, plants, or soil, set is_farming_related to false and "
    "use the analysis field to politely steer them back to farming topics."
)

# --- 4. FASTAPI CHAT ENDPOINT ---
@app.post("/chat", response_model=AgronomistResponse)
async def chat_endpoint(payload: ChatPayload):
    try:
        # Reconstruct chat session state history into formats compliant with the SDK
        contents = []
        for msg in payload.history:
            # Map roles accurately to what Gemini expects ('user' or 'model')
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
        
        # Append the new user input to the execution queue
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=payload.message)]))

        # Setup configuration definitions injecting structured output + python tools
        config = types.GenerateContentConfig(
            system_instruction=agronomist_persona,
            temperature=0.3,
            top_p=0.95,                  
            max_output_tokens=1000,     
            response_mime_type="application/json", 
            response_schema=AgronomistResponse,
            tools=[get_agricultural_weather]
        )

        # Execute generation request
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=contents,
            config=config
        )

        # Resolve looping tool updates if Gemini requests function executions
        while response.function_calls:
            for call in response.function_calls:
                name = call.name
                args = call.args
                
                if name in available_functions:
                    # Run target tool execution block locally
                    tool_result = available_functions[name](**args)
                    
                    # Update contents with the model's function call record
                    contents.append(response.candidates[0].content)
                    
                    # Append the tool's output block to data arrays
                    contents.append(
                        types.Content(
                            role="function",
                            parts=[
                                types.Part.from_function_response(
                                    name=name,
                                    response={"result": tool_result}
                                )
                            ]
                        )
                    )
                    
                    # Execute confirmation exchange back to model context
                    response = client.models.generate_content(
                        model="gemini-3.5-flash",
                        contents=contents,
                        config=config
                    )
                else:
                    raise HTTPException(status_code=500, detail=f"Unknown system tool requested: {name}")

        # Parse string output from Gemini securely into verified Pydantic response structures
        final_json_data = json.loads(response.text)
        return final_json_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agronomist Engine Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run("bot:app", host="127.0.0.1", port=8000, reload=True)
