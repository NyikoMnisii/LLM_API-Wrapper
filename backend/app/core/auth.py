from dataclasses import dataclass
from functools import lru_cache
from typing import Optional

import jwt
from fastapi import Header
from jwt import PyJWKClient

from app.core.config import get_settings
from app.core.exceptions import AuthenticationError


@dataclass
class AuthenticatedUser:
    id: str
    email: Optional[str]


@lru_cache
def _jwk_client() -> PyJWKClient:
    settings = get_settings()
    # Supabase signs access tokens with a per-project asymmetric key (ES256),
    # published at this well-known JWKS URL — no shared secret to hold. PyJWKClient
    # caches fetched keys in-memory and refetches on an unrecognized `kid`, which
    # covers Supabase's documented ~10-20 minute key-rotation window.
    return PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> AuthenticatedUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthenticationError("Missing or malformed Authorization header.")

    token = authorization.split(" ", 1)[1]
    settings = get_settings()

    try:
        signing_key = _jwk_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience=settings.supabase_jwt_audience,
        )
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid or expired access token.") from exc

    return AuthenticatedUser(id=claims["sub"], email=claims.get("email"))
