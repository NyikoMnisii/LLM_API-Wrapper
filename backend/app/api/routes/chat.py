from fastapi import APIRouter, Depends

from app.dependencies import get_agronomist_service
from app.models.agronomist import AgronomistResponse
from app.models.chat import ChatPayload
from app.services.agronomist_service import AgronomistService

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=AgronomistResponse)
async def chat_endpoint(
    payload: ChatPayload,
    agronomist_service: AgronomistService = Depends(get_agronomist_service),
) -> AgronomistResponse:
    return await agronomist_service.answer(payload.message, payload.history, payload.latitude, payload.longitude)
