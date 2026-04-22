from fastapi import APIRouter

router = APIRouter()

@router.get("/panic-help")
async def panic_help(scam_type: str = "General"):
    return {
        "steps": [
            "1. Disconnect the call or stop messaging immediately.",
            "2. DO NOT make any UPI transfers or share OTPs.",
            "3. If money was deducted, immediately call 1930 (National Cyber Crime Helpline).",
            "4. Block the number and report it on WhatsApp/Truecaller."
        ],
        "helpline": "1930",
        "contact_alert_template": f"URGENT: I might be facing a {scam_type} cyber scam. I am okay, but my phone might be unreachable. Do not trust any messages asking for money from my number."
    }
