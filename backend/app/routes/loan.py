from fastapi import APIRouter
from app.models.schemas import LoanAppRequest, LoanAppResponse
from app.services.scoring import scoring_engine

router = APIRouter()

@router.post("/scan-loan-app", response_model=LoanAppResponse)
async def scan_loan_app(req: LoanAppRequest):
    return scoring_engine.evaluate_loan_app(req.app_name, req.permissions)
