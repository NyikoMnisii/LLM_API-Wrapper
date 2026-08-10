import uuid
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.router import api_router
from app.clients.gemini import GeminiClient
from app.clients.openmeteo import OpenMeteoClient
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger, request_id_ctx
from app.core.security import limiter
from app.prompts.agronomist import AGRONOMIST_SYSTEM_PROMPT
from app.services.agronomist_service import AgronomistService
from app.services.gemini_service import GeminiService
from app.services.weather_service import WeatherService

settings = get_settings()
configure_logging(level=settings.log_level, json_format=settings.log_json)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(timeout=settings.http_timeout_seconds)
    app.state.gemini_client = GeminiClient(api_key=settings.gemini_api_key, model=settings.gemini_model)

    openmeteo_client = OpenMeteoClient(
        http_client=app.state.http_client,
        geocode_url=settings.weather_geocode_url,
        forecast_url=settings.weather_forecast_url,
    )
    app.state.weather_service = WeatherService(
        client=openmeteo_client,
        cache_size=settings.geocode_cache_size,
        cache_ttl_seconds=settings.geocode_cache_ttl_seconds,
    )

    gemini_service = GeminiService(
        client=app.state.gemini_client,
        system_prompt=AGRONOMIST_SYSTEM_PROMPT,
    )
    app.state.agronomist_service = AgronomistService(
        gemini_service=gemini_service, weather_service=app.state.weather_service
    )

    logger.info("Application startup complete")
    try:
        yield
    finally:
        await app.state.http_client.aclose()
        logger.info("Application shutdown complete")


def create_app() -> FastAPI:
    fastapi_app = FastAPI(
        title="Agrilite AI Agronomist API",
        description="Production-grade API wrapper for agricultural decision support with function calling.",
        lifespan=lifespan,
    )

    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    fastapi_app.state.limiter = limiter
    fastapi_app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
    fastapi_app.add_middleware(SlowAPIMiddleware)

    @fastapi_app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        token = request_id_ctx.set(request_id)
        try:
            response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers["X-Request-ID"] = request_id
        return response

    register_exception_handlers(fastapi_app)
    fastapi_app.include_router(api_router, prefix=settings.api_prefix)

    return fastapi_app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
