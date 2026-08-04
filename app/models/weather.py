from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class WeatherStatus(str, Enum):
    SUCCESS = "SUCCESS"
    REQUIRES_CLARIFICATION = "REQUIRES_CLARIFICATION"
    ERROR = "ERROR"


class GeocodeResult(BaseModel):
    name: str
    admin1: Optional[str] = ""
    country: Optional[str] = ""
    latitude: float
    longitude: float
    feature_code: Optional[str] = None

    @property
    def display_name(self) -> str:
        return f"{self.name}, {self.admin1 or ''} ({self.country or ''})"


class WeatherForecast(BaseModel):
    status: WeatherStatus
    reason: Optional[str] = None
    resolved_location: Optional[str] = None
    dates: list[str] = Field(default_factory=list)
    min_temperatures_celsius: list[float] = Field(default_factory=list)
    max_temperatures_celsius: list[float] = Field(default_factory=list)
    total_precipitation_mm: list[float] = Field(default_factory=list)
    frost_warning: bool = False
    high_humidity_fungal_risk: bool = False
