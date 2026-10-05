from typing import Dict, Any, List

class CallAnalyzer:
    def __init__(self):
        self.otp_lure_keywords = [
            "otp", "one time password", "verification code", "6 digit", "code aaya hoga",
            "bataiye", "share karein", "sms me aaya code", "cvv", "pin number"
        ]
        self.impersonation_keywords = [
            "bank manager", "sbi head office", "card department", "reserve bank", "rbi",
            "cbi officer", "police cyber cell", "customs department", "trai officer"
        ]
        self.coercion_keywords = [
            "arrest", "fir", "jail", "penalty", "account blocked permanently",
            "police karwai", "immediately", "disconnect mat karna", "line par rahiye"
        ]

    def analyze_transcript(self, transcript: str) -> Dict[str, Any]:
        transcript_lower = transcript.lower()

        indicators: List[str] = []
        matched_otp = [k for k in self.otp_lure_keywords if k in transcript_lower]
        matched_impersonation = [k for k in self.impersonation_keywords if k in transcript_lower]
        matched_coercion = [k for k in self.coercion_keywords if k in transcript_lower]

        risk_score = 0

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
        confidence = 0.96 if final_risk >= 70 else 0.82

        if final_risk >= 70:
            category = "VOICE_PHISHING_VISHING_CALL"
            verdict = "CRITICAL_THREAT"
            explanation_en = (
                "Critical Vishing Alert: Caller is exerting high psychological pressure, impersonating an official, "
                "and aggressively soliciting your one-time password (OTP). Official bank staff NEVER request OTPs."
            )
            explanation_hi = (
                "अति-संवेदनशील कॉल चेतावनी (Vishing): कॉलर खुद को बैंक या पुलिस अधिकारी बताकर तुरंत OTP मांग रहा है। "
                "याद रखें, बैंक कभी भी फोन पर OTP या पासवर्ड नहीं मांगता। तुरंत कॉल काटें।"
            )
            recommended_action = "Disconnect call immediately. Never share OTP or screen access. Block phone number."
        elif final_risk >= 35:
            category = "SUSPICIOUS_UNVERIFIED_CALL"
            verdict = "SUSPICIOUS"
            explanation_en = "Transcript displays unusual urgency or inquiry into account details. Exercise high caution."
            explanation_hi = "संदिग्ध कॉल: बातचीत में खाते से जुड़ी संवेदनशील पूछताछ के संकेत मिले हैं। सतर्क रहें।"
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
                "raw_audio_stored": False,
                "transcript_analyzed_tokens": len(transcript.split())
            },
            "mitre": {
                "technique_id": "T1598",
                "technique_name": "Phishing for Information: Voice / Telephone",
                "tactic": "Reconnaissance / Initial Access"
            } if final_risk >= 50 else None,
            "explanation_en": explanation_en,
            "explanation_hi": explanation_hi,
            "recommended_action": recommended_action
        }

call_analyzer = CallAnalyzer()
