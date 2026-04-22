from fastapi import APIRouter
from app.models.schemas import TextFraudRequest, TextFraudResponse, UpiFraudRequest, UpiFraudResponse
from app.services.model_service import model_service
from app.services.scoring import scoring_engine

router = APIRouter()

@router.post("/predict-text-fraud", response_model=TextFraudResponse)
async def predict_text_fraud(req: TextFraudRequest):
    return model_service.analyze_text(req.message_text)

@router.post("/predict-upi-risk", response_model=UpiFraudResponse)
async def predict_upi_risk(req: UpiFraudRequest):
    return scoring_engine.evaluate_upi_risk(req.text, req.amount, req.upi_id)
