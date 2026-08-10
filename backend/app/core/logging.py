import logging
import sys
from contextvars import ContextVar
from typing import Optional

request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


class RequestIdFilter(logging.Filter):
    """Injects the current request's correlation id into every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get() or "-"
        return True


def configure_logging(level: str = "INFO", json_format: bool = False) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter())

    if json_format:
        fmt = (
            '{"time": "%(asctime)s", "level": "%(levelname)s", '
            '"request_id": "%(request_id)s", "logger": "%(name)s", "message": "%(message)s"}'
        )
    else:
        fmt = "%(asctime)s | %(levelname)-8s | req=%(request_id)s | %(name)s | %(message)s"

    handler.setFormatter(logging.Formatter(fmt))

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
