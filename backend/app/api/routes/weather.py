from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import InvalidRequestError
from app.dependencies import get_weather_service
from app.models.weather import WeatherForecast
from app.services.weather_service import WeatherService

router = APIRouter(tags=["weather"])


@router.get("/weather/forecast", response_model=WeatherForecast)
async def get_forecast(
    location: Optional[str] = Query(None, description="City, town, or farming district name."),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Device-resolved latitude."),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Device-resolved longitude."),
    location_label: Optional[str] = Query(
        None, description="Optional display label to echo back when using latitude/longitude."
    ),
    days: int = Query(3, ge=1, le=7),
    weather_service: WeatherService = Depends(get_weather_service),
) -> WeatherForecast:
    if latitude is not None and longitude is not None:
        return await weather_service.get_agricultural_forecast_by_coordinates(
            latitude, longitude, days, location_label
        )
    if location:
        return await weather_service.get_agricultural_forecast(location, days)
    raise InvalidRequestError("Provide either 'location' or both 'latitude' and 'longitude'.")
