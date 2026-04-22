class ScoringEngine:
    def evaluate_loan_app(self, app_name: str, permissions: list[str]):
        risk_level = "LOW"
        abusive_permissions = []
        score = 100

        risky_perms = ["SMS", "Contacts", "Storage", "Call Log", "Camera"]
        
        for perm in permissions:
            if perm in risky_perms:
                abusive_permissions.append(perm)
                score -= 20

        if "Contacts" in abusive_permissions and "SMS" in abusive_permissions:
            risk_level = "HIGH"
            score -= 30
        elif len(abusive_permissions) >= 2:
            risk_level = "MEDIUM"

        return {
            "risk_level": "HIGH" if score < 40 else ("MEDIUM" if score < 80 else "LOW"),
            "abusive_permissions": abusive_permissions,
            "safety_rating": max(0, score)
        }

    def evaluate_upi_risk(self, text: str, amount: float, upi_id: str):
        text_lower = text.lower()
        score = 10
        pattern = "Normal Request"
        action = "Safe to proceed if you know the sender."

        if "refund" in text_lower or "cashback" in text_lower or "lottery" in text_lower:
            score += 50
            pattern = "Refund / Reward Scam"
            action = "DO NOT ENTER PIN. You never need a PIN to receive money."
        
        if amount > 10000:
            score += 20
        
        if score > 50:
            score = min(98, score + 15)

        return {
            "risk_score": score,
            "fraud_pattern": pattern,
            "recommended_action": action
        }

scoring_engine = ScoringEngine()
