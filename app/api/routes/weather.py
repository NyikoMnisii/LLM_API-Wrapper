from fastapi import APIRouter, Depends, Query

from app.dependencies import get_weather_service
from app.models.weather import WeatherForecast
from app.services.weather_service import WeatherService

router = APIRouter(tags=["weather"])


@router.get("/weather/forecast", response_model=WeatherForecast)
async def get_forecast(
    location: str = Query(..., description="City, town, or farming district name."),
    days: int = Query(3, ge=1, le=7),
    weather_service: WeatherService = Depends(get_weather_service),
) -> WeatherForecast:
    return await weather_service.get_agricultural_forecast(location, days)
