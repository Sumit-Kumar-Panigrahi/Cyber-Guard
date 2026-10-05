from typing import Dict, Any, List

class BilingualExplainer:
    """
    Generates explainable, citizen-friendly and SOC-grade narratives in both
    English and Hindi for multi-stage correlated attack chains.
    """

    def generate_narrative(
        self,
        current_stage: str,
        predicted_stage: str,
        confidence: float,
        events: List[Dict[str, Any]],
        human_risk: int,
        tech_risk: int,
        is_contained: bool = False
    ) -> Dict[str, str]:
        if is_contained:
            return {
                "en": (
                    "ATTACK CONTAINED: Cyberguard successfully neutralized the active attack chain. "
                    "The rogue session has been revoked, malicious domains blocked at DNS, "
                    "and authorization credentials secured. Your financial accounts remain protected."
                ),
                "hi": (
                    "हमला रोक दिया गया: साइबरगार्ड ने सक्रिय हमले की श्रृंखला को सफलतापूर्वक निष्प्रभावी कर दिया है। "
                    "अनाधिकृत सत्र को रद्द कर दिया गया है, दुर्भावनापूर्ण वेबसाइट को ब्लॉक किया गया है, "
                    "और आपका बैंक खाता पूरी तरह सुरक्षित है।"
                ),
                "speech_en": "Cyberguard security alert: Active attack chain successfully contained. Rogue session terminated.",
                "speech_hi": "साइबरगार्ड सुरक्षा चेतावनी: साइबर हमला सफलतापूर्वक रोक दिया गया है। आपका खाता सुरक्षित है।"
            }

        # Build dynamic narrative based on stages and events
        num_events = len(events)
        sources = list(set(e.get("source", "Unknown") for e in events))
        source_str = ", ".join(sources) if sources else "SMS and Web"

        en_narrative = (
            f"CYBERGUARD CORRELATION ALERT: We have correlated {num_events} threat signal(s) across {source_str} "
            f"into a single coordinated cyber intrusion. The attacker has completed the '{current_stage}' stage. "
            f"Our Markov Chain prediction engine forecasts with {int(confidence * 100)}% certainty that the attacker's "
            f"immediate next objective is '{predicted_stage}'. "
            f"Human Susceptibility Risk is rated at {human_risk}/100 and Technical Intrusion Risk at {tech_risk}/100. "
            f"DO NOT share any 6-digit OTP received on your phone, and do not authorize any pending login requests."
        )

        hi_narrative = (
            f"साइबरगार्ड चेतावनी: हमने {source_str} के माध्यम से मिले {num_events} संदिग्ध संकेतों को एक बड़े साइबर हमले से जोड़ा है। "
            f"जालसाज वर्तमान में '{current_stage}' चरण पूरा कर चुका है। "
            f"हमारे एआई प्रेडिक्शन मॉडल के अनुसार {int(confidence * 100)}% संभावना है कि धोखेबाज का अगला कदम '{predicted_stage}' होगा। "
            f"मानवीय जोखिम स्कोर {human_risk}/100 और तकनीकी खतरा {tech_risk}/100 है। "
            f"कृपया ध्यान दें: अपने फोन पर आया कोई भी ओटीपी किसी को न बताएं और न ही किसी अज्ञात लिंक पर क्लिक करें।"
        )

        # Voice Speech script designed for clear TTS audio warning
        speech_en = (
            f"Warning! Cyberguard has detected a coordinated cyber attack against your account. "
            f"The attacker has accessed your login credentials and is now attempting: {predicted_stage}. "
            f"Do not share any OTP with any caller, even if they claim to be from SBI or police. "
            f"Press contain now to revoke the attacker session."
        )

        speech_hi = (
            f"सावधान! साइबरगार्ड ने आपके खाते पर साइबर हमले की पहचान की है। "
            f"धोखेबाज अब आपसे ओटीपी मांगने या पैसे निकालने का प्रयास कर रहा है। "
            f"बैंक या पुलिस के नाम पर आए किसी भी फोन कॉल पर ओटीपी बिल्कुल न दें। "
            f"हमले को तुरंत रोकने के लिए कंटेन बटन दबाएं।"
        )

        return {
            "en": en_narrative,
            "hi": hi_narrative,
            "speech_en": speech_en,
            "speech_hi": speech_hi
        }

bilingual_explainer = BilingualExplainer()
