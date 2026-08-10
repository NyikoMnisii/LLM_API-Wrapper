from fastapi import Request

from app.services.agronomist_service import AgronomistService
from app.services.weather_service import WeatherService


def get_weather_service(request: Request) -> WeatherService:
    """Retrieves the singleton WeatherService built at startup (see app.main lifespan),
    so its geocode cache and pooled HTTP connection are shared across requests."""
    return request.app.state.weather_service


def get_agronomist_service(request: Request) -> AgronomistService:
    return request.app.state.agronomist_service
