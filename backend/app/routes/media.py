from fastapi import APIRouter
from app.models.schemas import MediaClaimRequest, MediaClaimResponse
from app.services.model_service import model_service

router = APIRouter()

@router.post("/check-media-claim", response_model=MediaClaimResponse)
async def check_media_claim(req: MediaClaimRequest):
    return model_service.analyze_media_claim(req.text, req.source_url)
