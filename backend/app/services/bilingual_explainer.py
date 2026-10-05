from typing import Dict, Any, List

class BilingualExplainer:
    """
    Generates explainable, citizen-friendly narratives in both
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
                    "The unauthorized session has been revoked, malicious domains blocked at DNS, "
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
        source_str = ", ".join(sources) if sources else "Messaging and Web"

        if predicted_stage == "There is not enough evidence to confidently predict the next stage." or confidence == 0.0:
            pred_en = "There is currently not enough telemetry to forecast a subsequent attack stage."
            pred_hi = "वर्तमान में अगले हमले के चरण का अनुमान लगाने के लिए पर्याप्त संकेत नहीं हैं।"
            speech_pred_en = "No immediate follow-up attack predicted. Standard caution advised."
            speech_pred_hi = "तत्काल किसी नए हमले का संकेत नहीं है। सामान्य सतर्कता बरतें।"
        else:
            pred_en = f"Our predictive correlation engine forecasts with {int(confidence * 100)}% certainty that the adversary's next step is '{predicted_stage}'."
            pred_hi = f"हमारे पूर्वानुमान मॉडल के अनुसार {int(confidence * 100)}% संभावना है कि जालसाज का अगला कदम '{predicted_stage}' होगा।"
            speech_pred_en = f"The adversary may attempt {predicted_stage}. Do not share verification codes."
            speech_pred_hi = f"धोखेबाज अगला कदम उठा सकता है। कोई भी ओटीपी या कोड किसी से साझा न करें।"

        en_narrative = (
            f"CYBERGUARD CORRELATION ALERT: We have correlated {num_events} threat signal(s) across {source_str} "
            f"into a coordinated intrusion progression. Current stage: '{current_stage}'. "
            f"{pred_en} "
            f"Human Susceptibility Risk is rated at {human_risk}/100 and Technical Risk at {tech_risk}/100. "
            f"Never share verification codes (OTP) received on your phone, and do not click unverified links."
        )

        hi_narrative = (
            f"साइबरगार्ड चेतावनी: हमने {source_str} के माध्यम से मिले {num_events} संदिग्ध संकेतों को एक साइबर हमले से जोड़ा है। "
            f"वर्तमान चरण: '{current_stage}'। "
            f"{pred_hi} "
            f"मानवीय जोखिम स्कोर {human_risk}/100 और तकनीकी खतरा {tech_risk}/100 है। "
            f"कृपया ध्यान दें: फोन पर आया कोई भी ओटीपी किसी को न बताएं और न ही किसी अज्ञात लिंक पर क्लिक करें।"
        )

        speech_en = (
            f"Warning! Cyberguard has detected a coordinated cyber attack against your account. "
            f"{speech_pred_en} "
            f"Never share any OTP or verification code with any caller."
        )

        speech_hi = (
            f"सावधान! साइबरगार्ड ने आपके खाते पर संदिग्ध साइबर गतिविधि की पहचान की है। "
            f"{speech_pred_hi} "
            f"फोन पर आया कोई भी ओटीपी किसी को भी न बताएं।"
        )

        return {
            "en": en_narrative,
            "hi": hi_narrative,
            "speech_en": speech_en,
            "speech_hi": speech_hi
        }

bilingual_explainer = BilingualExplainer()
