import pytest
from fastapi.testclient import TestClient

from app.core.auth import AuthenticatedUser, get_current_user
from app.dependencies import get_agronomist_service
from app.main import app
from app.models.agronomist import AgronomistResponse


class StubAgronomistService:
    async def answer(self, message, history, latitude=None, longitude=None):
        return AgronomistResponse(
            analysis="Test analysis",
            recommendations=["Water the crops"],
            sustainability_note="Use drip irrigation.",
            is_farming_related=True,
        )


@pytest.fixture
def client():
    app.dependency_overrides[get_agronomist_service] = lambda: StubAgronomistService()
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id="test-user", email="farmer@example.com")
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client():
    app.dependency_overrides[get_agronomist_service] = lambda: StubAgronomistService()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_chat_endpoint_returns_structured_response(client):
    response = client.post("/api/v1/chat", json={"message": "Should I water my maize today?", "history": []})

    assert response.status_code == 200
    body = response.json()
    assert body["is_farming_related"] is True
    assert body["recommendations"] == ["Water the crops"]


def test_chat_endpoint_accepts_coordinates(client):
    response = client.post(
        "/api/v1/chat",
        json={"message": "Is there frost risk today?", "history": [], "latitude": -33.93, "longitude": 18.86},
    )

    assert response.status_code == 200
    assert response.json()["is_farming_related"] is True


def test_chat_endpoint_requires_auth(unauthenticated_client):
    response = unauthenticated_client.post("/api/v1/chat", json={"message": "Should I water my maize today?"})

    assert response.status_code == 401


def test_health_endpoint(client):
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
