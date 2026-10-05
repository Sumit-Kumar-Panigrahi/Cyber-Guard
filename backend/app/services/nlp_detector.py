import re
from typing import Dict, Any, List
from app.services.ai_assistant import ai_assistant_engine
from app.services.sensitive_data_detector import sensitive_data_detector

class NLPDetector:
    """
    Intelligent NLP & Heuristic detector for messages, SMS, and text communications.
    Uses multi-stage semantic extraction without dependence on fixed bank examples.
    """

    def analyze(self, text: str) -> Dict[str, Any]:
        # 1. First, check for and redact sensitive information
        scan_res = sensitive_data_detector.scan_and_redact(text)
        sanitized_text = scan_res["sanitized_text"]

        # 2. Run through the dynamic security analysis engine
        analysis = ai_assistant_engine.analyze_security_content(sanitized_text)

        # 3. Detect language
        detected_lang, _ = ai_assistant_engine.detect_language(text)
        lang_str = "Hindi" if detected_lang == "hi" else ("Hinglish" if detected_lang == "hinglish" else "English")

        # 4. Determine MITRE technique if applicable
        mitre_info = None
        if analysis["risk_score"] >= 45:
            if "SOLICITATION_OF_SENSITIVE_CREDENTIALS" in analysis["indicators"]:
                mitre_info = {
                    "technique_id": "T1056",
                    "technique_name": "Input Capture / Credential Solicitation",
                    "tactic": "Credential Access"
                }
            elif "CONTAINS_UNVERIFIED_WEB_LINK" in analysis["indicators"]:
                mitre_info = {
                    "technique_id": "T1566.002",
                    "technique_name": "Spearphishing Link (SMS/Messaging)",
                    "tactic": "Initial Access"
                }
            else:
                mitre_info = {
                    "technique_id": "T1566",
                    "technique_name": "Phishing / Social Engineering",
                    "tactic": "Initial Access"
                }

        # 5. Format response adhering to AnalysisResultResponse schema
        return {
            "source": "SMS / Messaging Shield",
            "category": analysis["threat_type"],
            "verdict": analysis["verdict"],
            "risk_score": analysis["risk_score"],
            "confidence": analysis["confidence"],
            "language_detected": lang_str,
            "indicators": analysis["indicators"],
            "evidence": {
                **analysis["evidence"],
                "has_sensitive_data_redacted": scan_res["has_sensitive_data"],
                "sanitized_input_preview": sanitized_text[:120]
            },
            "mitre": mitre_info,
            "explanation_en": analysis["explanation_en"],
            "explanation_hi": analysis["explanation_hi"],
            "recommended_action": analysis["recommended_actions"][0] if analysis["recommended_actions"] else "Verify sender through official channels."
        }

nlp_detector = NLPDetector()
