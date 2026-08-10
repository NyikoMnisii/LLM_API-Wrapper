def clamp_forecast_days(days: int, minimum: int = 1, maximum: int = 7) -> int:
    return max(minimum, min(days, maximum))
