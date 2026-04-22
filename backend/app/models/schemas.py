from pydantic import BaseModel
from typing import List, Optional

# Text Fraud Schemas
class TextFraudRequest(BaseModel):
    message_text: str
    lang: Optional[str] = "en"

class TextFraudResponse(BaseModel):
    risk_score: int
    scam_type: str
    confidence: float
    action: str

# URL Schemas
class UrlCheckRequest(BaseModel):
    url: str

class UrlCheckResponse(BaseModel):
    is_phishing: bool
    reputation_score: int
    threat_type: str

# Loan App Schemas
class LoanAppRequest(BaseModel):
    app_name: str
    permissions: List[str]

class LoanAppResponse(BaseModel):
    risk_level: str
    abusive_permissions: List[str]
    safety_rating: int

# UPI Fraud Schemas
class UpiFraudRequest(BaseModel):
    text: str
    amount: float
    upi_id: str

class UpiFraudResponse(BaseModel):
    risk_score: int
    fraud_pattern: str
    recommended_action: str

# Media Claim / Deepfake Schemas
class MediaClaimRequest(BaseModel):
    text: str
    source_url: Optional[str] = ""

class MediaClaimResponse(BaseModel):
    risk_score: int
    type: str
    label: str
    reasons: List[str]
