from fastapi import APIRouter
from app.models.schemas import UrlCheckRequest, UrlCheckResponse
from app.services.url_service import url_service

router = APIRouter()

@router.post("/check-url", response_model=UrlCheckResponse)
async def check_url(req: UrlCheckRequest):
    return url_service.check_url(req.url)
