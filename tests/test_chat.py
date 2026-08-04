import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_agronomist_service
from app.main import app
from app.models.agronomist import AgronomistResponse


class StubAgronomistService:
    async def answer(self, message, history):
        return AgronomistResponse(
            analysis="Test analysis",
            recommendations=["Water the crops"],
            sustainability_note="Use drip irrigation.",
            is_farming_related=True,
        )


@pytest.fixture
def client():
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


def test_health_endpoint(client):
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
