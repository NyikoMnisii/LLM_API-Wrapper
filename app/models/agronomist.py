from pydantic import BaseModel, Field


class AgronomistResponse(BaseModel):
    analysis: str = Field(description="The core botanical, climate, or agricultural analysis of the query.")
    recommendations: list[str] = Field(
        description="List of actionable, step-by-step farming, preventative treatments, or scheduling tasks."
    )
    sustainability_note: str = Field(
        description="Eco-friendly, water-saving, or safe chemical handling advice based on current data."
    )
    is_farming_related: bool = Field(
        description="True if the query is about plants/soil/farming/weather, False otherwise."
    )
