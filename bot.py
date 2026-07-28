import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
load_dotenv()


if not os.environ.get("GEMINI_API_KEY"):
    print("Error: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
    sys.exit(1)

client = genai.Client()


class AgronomistResponse(BaseModel):
    analysis: str = Field(description="The core botanical or agricultural analysis of the query.")
    recommendations: list[str] = Field(description="List of actionable, step-by-step farming or treatment tasks.")
    sustainability_note: str = Field(description="Eco-friendly, water-saving, or safe chemical handling advice.")
    is_farming_related: bool = Field(description="True if the query is about plants/soil/farming, False otherwise.")

# The Agronomist persona
agronomist_persona = (
    "You are an expert agronomist, crop scientist, and digital farming assistant. "
    "Your job is to provide highly accurate, practical, and scientifically sound advice. "
    "Always populate the requested JSON schema accurately. If the user query is "
    "unrelated to agriculture, plants, or soil, set is_farming_related to false and "
    "use the analysis field to politely steer them back to farming topics."
)

def start_agronomist_chat():
    print("Hi I am Agrilite Your farming assistant. Ask your farming questions! (Type 'exit' to quit)\n")


    chat = client.chats.create(
        model="gemini-3.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=agronomist_persona,
            temperature=0.3,
            top_p=0.95,                  
            max_output_tokens=1000,     
            response_mime_type="application/json", 
            response_schema=AgronomistResponse,   
        )
    )
    
    while True:
        try:
            user_input = input("You: ")
            if user_input.strip().lower() == "exit":
                print("Goodbye! Happy farming.")
                break
                
            if not user_input.strip():
                continue
                
            response = chat.send_message(user_input)

            print(f"\nAgronomist JSON Output:\n{response.text}\n")
            
        except Exception as e:
            print(f"\nAn error occurred: {e}\n")

if __name__ == "__main__":
    start_agronomist_chat()
