import re

class UrlService:

    def check_url(self, url: str):
        url_lower = url.lower()

        score = 90
        is_phishing = False
        reasons = []

        suspicious_tlds = [".xyz", ".top", ".cc", ".tk", ".gq"]
        brand_keywords = ["sbi", "hdfc", "icici", "paytm", "gpay", "upi", "bank"]
        danger_words = ["login", "verify", "kyc", "update", "reward", "gift", "free"]

        if any(tld in url_lower for tld in suspicious_tlds):
            score -= 35
            reasons.append("Suspicious TLD")

        if any(k in url_lower for k in brand_keywords) and any(d in url_lower for d in danger_words):
            score -= 40
            reasons.append("Brand impersonation pattern")

        if "bit.ly" in url_lower or "tinyurl" in url_lower:
            score -= 20
            reasons.append("Shortened URL")

        # too many hyphens
        if url_lower.count("-") >= 2:
            score -= 15
            reasons.append("Obfuscated domain")

        # many digits
        if len(re.findall(r'\d', url_lower)) >= 4:
            score -= 10
            reasons.append("Suspicious numeric pattern")

        score = max(score, 0)

        if score < 50:
            is_phishing = True
            threat = "Likely Phishing"
        elif score < 70:
            is_phishing = True
            threat = "Suspicious URL"
        else:
            threat = "Safe"

        return {
            "is_phishing": is_phishing,
            "reputation_score": score,
            "threat_type": threat,
            "reasons": reasons
        }

url_service = UrlService()