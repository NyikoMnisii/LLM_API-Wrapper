from typing import Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


class AppError(Exception):
    """Base class for application errors that translate directly into HTTP responses."""

    status_code = 500
    detail = "Internal server error."

    def __init__(self, detail: Optional[str] = None):
        self.detail = detail or self.detail
        super().__init__(self.detail)


class InvalidRequestError(AppError):
    status_code = 422
    detail = "The request is missing required parameters."


class LocationNotFoundError(AppError):
    status_code = 422
    detail = "Could not resolve the requested location."


class AmbiguousLocationError(AppError):
    status_code = 422
    detail = "Multiple locations matched; clarification required."


class ExternalAPIError(AppError):
    status_code = 502
    detail = "An upstream service failed to respond correctly."


class ToolExecutionError(AppError):
    status_code = 500
    detail = "A tool invocation failed during execution."


class LLMGenerationError(AppError):
    status_code = 502
    detail = "The language model failed to generate a valid response."


class AuthenticationError(AppError):
    status_code = 401
    detail = "Missing or invalid access token."


async def _app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


async def _unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception while processing request")
    return JSONResponse(status_code=500, content={"error": "An unexpected error occurred."})


def register_exception_handlers(app: FastAPI) -> None:
    # Starlette's ExceptionHandler stub wants a handler typed to accept the base
    # Exception; narrowing the second parameter to a specific subclass is safe at
    # runtime (Starlette only invokes it for registered exception types) but not
    # expressible in the stub, hence the ignores.
    app.add_exception_handler(AppError, _app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, _unhandled_error_handler)
