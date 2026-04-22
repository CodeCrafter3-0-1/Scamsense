import logging
import re
from transformers import pipeline
from app.config import settings

logger = logging.getLogger(__name__)


class ScamSenseModelService:
    def __init__(self):
        self.zero_shot = None
        self.muril = None
        self._load_models()

    def _load_models(self):
        try:
            logger.info("Loading ScamSense AI models...")

            # Main multilingual model (India focused)
            self.muril = pipeline(
                task="feature-extraction",
                model=settings.MODEL_NAME
            )

            # Zero-shot intent classifier
            self.zero_shot = pipeline(
                task="zero-shot-classification",
                model="facebook/bart-large-mnli"
            )

            logger.info("Models loaded successfully.")

        except Exception as e:
            logger.error(f"Model loading failed: {e}")

    def detect_language(self, text: str):
        hindi_chars = re.findall(r'[\u0900-\u097F]', text)
        if hindi_chars:
            return "hindi"

        hinglish_words = [
            "bhai", "jaldi", "bhejo", "karo", "paise",
            "account band", "otp bhejo"
        ]

        if any(word in text.lower() for word in hinglish_words):
            return "hinglish"

        return "english"

    def analyze_text(self, text: str):
        text_lower = text.lower()

        labels = [
            "scam message",
            "safe message",
            "bank fraud",
            "upi fraud",
            "authority impersonation",
            "phishing attempt",
            "loan app scam"
        ]

        result = self.zero_shot(text, labels)

        label_scores = dict(zip(result["labels"], result["scores"]))
        safe_score = label_scores.get("safe message", 0.0)
        
        # Total probability of being a scam is 1.0 - safe_score
        risk = int((1.0 - safe_score) * 100)

        top_label = result["labels"][0]
        confidence = float(result["scores"][0])

        authority_words = [
            "rbi", "bank", "police", "cbi",
            "customs", "kyc", "income tax"
        ]

        urgency_words = [
            "urgent", "now", "immediately",
            "freeze", "blocked", "suspend"
        ]

        money_words = [
            "pay", "transfer", "upi",
            "pin", "otp", "refund"
        ]

        if any(word in text_lower for word in authority_words):
            risk += 15

        if any(word in text_lower for word in urgency_words):
            risk += 10

        if any(word in text_lower for word in money_words):
            risk += 10

        lang = self.detect_language(text)

        if lang in ["hindi", "hinglish"]:
            risk += 5

        risk = min(risk, 99)

        if risk >= 85:
            action = "High Risk: Do not respond. Disconnect and report to 1930."
        elif risk >= 65:
            action = "Suspicious: Verify using official source only."
        else:
            action = "Low risk. Stay cautious."

        return {
            "risk_score": risk,
            "scam_type": top_label.title(),
            "confidence": round(confidence, 2),
            "language_detected": lang,
            "action": action
        }

    def analyze_media_claim(self, text: str, source_url: str = ""):
        text_lower = text.lower()

        risk = 15
        label = "Safe Claim"
        type_name = "Verified"
        reasons = []

        authority_words = [
            "pm", "prime minister", "rbi",
            "governor", "minister", "police"
        ]

        scam_words = [
            "invest now", "double money",
            "guaranteed", "urgent",
            "limited offer", "last chance"
        ]

        if any(word in text_lower for word in authority_words):
            risk += 30
            reasons.append("Authority mention")

        if any(word in text_lower for word in scam_words):
            risk += 40
            reasons.append("Urgency / unrealistic promise")

        if source_url:
            if ".gov" not in source_url and ".org" not in source_url:
                risk += 15
                reasons.append("Unverified source")

        risk = min(risk, 95)

        if risk >= 75:
            label = "Possible Deepfake-Enabled Scam"
            type_name = "Impersonation Risk"
        elif risk >= 50:
            label = "Suspicious Claim"
            type_name = "Needs Verification"

        return {
            "risk_score": risk,
            "type": type_name,
            "label": label,
            "reasons": reasons
        }


model_service = ScamSenseModelService()