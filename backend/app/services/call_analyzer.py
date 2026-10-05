import re
from typing import Dict, Any, List
from app.services.ai_assistant import ai_assistant_engine
from app.services.sensitive_data_detector import sensitive_data_detector

class CallAnalyzer:
    """
    Intelligent Call Guard transcript analyzer for voice phishing (vishing),
    authority impersonation, and high-pressure credential extraction.
    """

    def __init__(self):
        self.otp_lure_keywords = [
            "otp", "one time password", "verification code", "6 digit", "code aaya hoga",
            "bataiye", "share karein", "sms me aaya code", "cvv", "pin number", "secret code"
        ]
        self.impersonation_keywords = [
            "customer support", "support executive", "bank manager", "head office",
            "card department", "reserve bank", "rbi", "cbi officer", "police cyber cell",
            "customs department", "trai officer", "electricity officer", "discom", "helpdesk"
        ]
        self.coercion_keywords = [
            "arrest", "fir", "jail", "penalty", "account blocked permanently",
            "police karwai", "immediately", "disconnect mat karna", "line par rahiye",
            "in 2 hours", "turant"
        ]

    def analyze_transcript(self, transcript: str) -> Dict[str, Any]:
        scan_res = sensitive_data_detector.scan_and_redact(transcript)
        sanitized = scan_res["sanitized_text"]
        transcript_lower = sanitized.lower()

        indicators: List[str] = []
        matched_otp = [k for k in self.otp_lure_keywords if k in transcript_lower]
        matched_impersonation = [k for k in self.impersonation_keywords if k in transcript_lower]
        matched_coercion = [k for k in self.coercion_keywords if k in transcript_lower]

        risk_score = 15

        if matched_otp:
            indicators.append("HIGH_PRIORITY_OTP_OR_CREDENTIAL_SOLICITATION")
            risk_score += 45

        if matched_impersonation:
            indicators.append("AUTHORITY_OR_FINANCIAL_IMPERSONATION")
            risk_score += 30

        if matched_coercion:
            indicators.append("PSYCHOLOGICAL_COERCION_AND_LEGAL_PRESSURE")
            risk_score += 25

        final_risk = min(risk_score, 100)
        confidence = 0.96 if final_risk >= 70 else (0.85 if final_risk >= 40 else 0.70)

        # Dynamic explanations
        if final_risk >= 70:
            category = "VOICE_PHISHING_VISHING_CALL"
            verdict = "CRITICAL_THREAT"
            imp_desc = f" ({', '.join(matched_impersonation)})" if matched_impersonation else ""
            explanation_en = (
                f"Critical Vishing Alert: Caller is exerting intense psychological urgency, impersonating an official{imp_desc}, "
                "and demanding sensitive verification codes or OTPs. Official representatives never ask for OTPs or PINs over the phone."
            )
            explanation_hi = (
                f"अति-संवेदनशील कॉल चेतावनी (Vishing): कॉलर किसी अधिकृत संस्था{imp_desc} का प्रतिनिधि बनकर दबाव बना रहा है "
                "और फोन पर आपका गुप्त कोड या ओटीपी मांग रहा है। याद रखें, कोई भी वैध संस्था फोन पर ओटीपी नहीं मांगती। तुरंत कॉल काटें।"
            )
            recommended_action = "Disconnect call immediately. Never share OTP or screen access. Block phone number."
        elif final_risk >= 35:
            category = "SUSPICIOUS_UNVERIFIED_CALL"
            verdict = "SUSPICIOUS"
            explanation_en = "Transcript displays unusual urgency or inquiry into personal credentials. Exercise high caution."
            explanation_hi = "संदिग्ध कॉल: बातचीत में असामान्य जल्दबाजी या व्यक्तिगत जानकारी पूछने के संकेत मिले हैं। सतर्क रहें।"
            recommended_action = "Do not share personal identifiers or bank details."
        else:
            category = "STANDARD_CALL_TRANSCRIPT"
            verdict = "SAFE"
            explanation_en = "No coercive scam tactics or credential harvesting detected in call conversation."
            explanation_hi = "कॉल में कोई संदिग्ध या धोखेबाजी वाले शब्द नहीं पाए गए।"
            recommended_action = "Standard discretion."

        return {
            "source": "Call Guard (Transcript Stream)",
            "category": category,
            "verdict": verdict,
            "risk_score": final_risk,
            "confidence": confidence,
            "indicators": indicators,
            "evidence": {
                "matched_otp_triggers": matched_otp,
                "matched_impersonation": matched_impersonation,
                "matched_coercion": matched_coercion,
                "has_sensitive_data_redacted": scan_res["has_sensitive_data"],
                "raw_audio_stored": False,
                "transcript_analyzed_tokens": len(sanitized.split())
            },
            "mitre": {
                "technique_id": "T1566.004",
                "technique_name": "Spearphishing Voice (Vishing)",
                "tactic": "Initial Access"
            } if final_risk >= 50 else None,
            "explanation_en": explanation_en,
            "explanation_hi": explanation_hi,
            "recommended_action": recommended_action
        }

call_analyzer = CallAnalyzer()
