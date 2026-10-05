import re
import numpy as np
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Benchmark training dataset specifically tailored for Indian cyberthreats
TRAIN_CORPUS = [
    # Indian Banking & KYC Phishing (Hindi/Hinglish/English)
    ("Dear customer your SBI account will be blocked today update your KYC immediately at sbi-kyc-update.online", 1),
    ("Priye grahak aapka SBI YONO khata aaj band ho jayega turant PAN card link karein", 1),
    ("HDFC Alert: Your NetBanking access is suspended due to unverified Aadhaar. Click here to resume", 1),
    ("ICICI Bank: Important notice! Your credit card reward points worth Rs 9850 will expire tonight. Redeem now at icici-rewards.club", 1),
    ("Axis Bank notification: Update your PAN details within 24 hours or account transaction will be halted", 1),
    ("Paytm KYC Expired! Your wallet will be blocked within 2 hours. Call our executive immediately at 9876543210", 1),
    ("Bijli Vibhag Alert: Priye upbhokta, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki pichla bill jama nahi hai", 1),
    ("Electricity Department Notice: Power will be disconnected tonight due to unpaid electricity bill. Contact officer immediately", 1),
    ("Congratulations! You have won Rs 25,00,000 in KBC Lottery WhatsApp Lucky Draw. Claim your lottery token", 1),
    ("Work from home: Earn Rs 3000 to 8000 daily by liking YouTube videos and rating hotels on Google Maps. Contact HR on Telegram", 1),
    ("CBI / Police Digital Arrest Notice: A parcel containing contraband has been intercepted in your name. Join video call immediately", 1),
    ("TRAI Warning: Your mobile number will be disconnected within 2 hours due to illegal broadcasting. Press 9 to speak with executive", 1),
    ("Urgent: Income Tax refund of Rs 14,350 has been approved. Confirm your bank account credentials to receive transfer", 1),
    ("Aadhaar e-KYC suspension notice: Click link to authenticate biometric or SIM card will be deactivated", 1),
    ("Dear SBI user, your YONO mobile banking is locked. Update KYC to unlock immediately: bit.ly/sbi-yono-update", 1),

    # Benign Indian communications
    ("Your SBI account has been credited with Rs 5000 via UPI from Rahul Sharma on 04-10-2026", 0),
    ("Dear Customer, OTP for your transaction at Amazon India is 492819. Valid for 10 minutes. Do not share with anyone", 0),
    ("Your electricity bill for the month of September is Rs 1240. Due date is 15th October. Pay via official portal or app", 0),
    ("Welcome to HDFC Bank NetBanking. Thank you for registering your email address with us", 0),
    ("Dear Customer, your monthly statement for credit card ending in 4092 is now generated. View in official app", 0),
    ("Namaste, please find attached the agenda for tomorrow's team sync meeting at 10 AM", 0),
    ("Hi Sumit, are we meeting for lunch at the cafeteria today? Let me know", 0),
    ("Your package from Flipkart has been dispatched and will arrive by tomorrow evening", 0),
    ("Aadhaar authentication successful for transaction ID 992837. UIDAI respects your privacy", 0),
    ("Flight ticket confirmation for your travel from New Delhi to Mumbai on 12th October. PNR: 4K92PL", 0),
    ("Dear student, semester examination schedule has been published on the university official website", 0),
    ("Thank you for choosing Jio. Your recharge of Rs 299 was successful. Data balance: 1.5GB/day", 0),
]

class NLPDetector:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, lowercase=True)
        texts, labels = zip(*TRAIN_CORPUS)
        X = self.vectorizer.fit_transform(texts)
        self.classifier = LogisticRegression(C=2.0)
        self.classifier.fit(X, labels)

        # Curated threat lexicon for Indian ecosystem
        self.high_urgency_words = [
            "blocked today", "suspended", "immediately", "turant", "band ho jayega", 
            "kat diya jayega", "within 2 hours", "within 24 hours", "aaj hi", "expire tonight", 
            "disconnected tonight", "urgent", "action required"
        ]
        self.financial_kyc_words = [
            "kyc", "pan card", "aadhaar", "yono", "netbanking", "lottery", "kbc", 
            "refund", "unpaid bill", "bijli", "rewards", "claim", "digital arrest", 
            "contraband", "trai", "cbi", "police"
        ]
        self.action_lures = [
            "click here", "update", "link", "verify", "call", "telegram", "whatsapp", 
            "contact", "redeem", "authenticate", "confirm"
        ]

    def analyze(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()

        # 1. ML Classifier Prediction
        X_test = self.vectorizer.transform([text])
        ml_prob = float(self.classifier.predict_proba(X_test)[0][1])

        # 2. Rule & Heuristic Analysis
        indicators: List[str] = []
        evidence_keywords: List[str] = []

        # Check urgency
        urgency_matches = [w for w in self.high_urgency_words if w in text_lower]
        if urgency_matches:
            indicators.append("HIGH_URGENCY_DEADLINE_PRESSURE")
            evidence_keywords.extend(urgency_matches)

        # Check KYC / Financial lure
        kyc_matches = [w for w in self.financial_kyc_words if w in text_lower]
        if kyc_matches:
            if any(k in ["kyc", "pan card", "aadhaar", "yono"] for k in kyc_matches):
                indicators.append("IMPERSONATING_BANK_KYC_SUSPENSION")
            elif any(k in ["bijli", "unpaid bill"] for k in kyc_matches):
                indicators.append("ELECTRICITY_BILL_DISCONNECTION_FRAUD")
            elif any(k in ["lottery", "kbc"] for k in kyc_matches):
                indicators.append("LOTTERY_ADVANCE_FEE_SCAM")
            elif any(k in ["digital arrest", "cbi", "police", "trai"] for k in kyc_matches):
                indicators.append("GOVERNMENT_AGENCY_DIGITAL_ARREST_IMPERSONATION")
            evidence_keywords.extend(kyc_matches)

        # Check URL or contact lure
        has_url = bool(re.search(r"https?://\S+|bit\.ly/\S+|www\.\S+|\.online|\.club|\.top", text_lower))
        if has_url:
            indicators.append("CONTAINS_UNVERIFIED_SUSPICIOUS_LINK")
            evidence_keywords.append("unverified_link_detected")

        has_phone = bool(re.search(r"\b[6-9]\d{9}\b", text))
        if has_phone:
            indicators.append("CONTAINS_DIRECT_FRAUD_CONTACT_NUMBER")

        # Check Hindi / Hinglish script or transliteration
        is_hindi_script = bool(re.search(r"[\u0900-\u097F]", text))
        is_hinglish = any(h in text_lower for h in ["priye", "grahak", "khata", "aaj", "turant", "karein", "ho jayega", "bijli"])
        language_detected = "Hindi (Devanagari)" if is_hindi_script else ("Hinglish" if is_hinglish else "English")

        if is_hinglish or is_hindi_script:
            indicators.append("REGIONAL_HINGLISH_THREAT_PATTERN")

        # 3. Composite Risk Score Synthesis (0 - 100)
        heuristic_score = 0
        if "HIGH_URGENCY_DEADLINE_PRESSURE" in indicators:
            heuristic_score += 30
        if "IMPERSONATING_BANK_KYC_SUSPENSION" in indicators or "GOVERNMENT_AGENCY_DIGITAL_ARREST_IMPERSONATION" in indicators:
            heuristic_score += 35
        if "CONTAINS_UNVERIFIED_SUSPICIOUS_LINK" in indicators:
            heuristic_score += 25
        if "REGIONAL_HINGLISH_THREAT_PATTERN" in indicators:
            heuristic_score += 10
        if "LOTTERY_ADVANCE_FEE_SCAM" in indicators or "ELECTRICITY_BILL_DISCONNECTION_FRAUD" in indicators:
            heuristic_score += 30

        # Weighted combination: 45% ML prob + 55% heuristic features
        combined_score = int(np.clip((ml_prob * 45) + (min(heuristic_score, 100) * 0.55), 0, 100))

        confidence = round(float(np.clip(0.65 + (ml_prob * 0.3), 0.65, 0.98)), 2)

        # Explanations in English and Hindi
        if combined_score >= 70:
            category = "PHISHING_SMS"
            verdict = "CRITICAL_THREAT"
            explanation_en = (
                f"High Risk Phishing: The message impersonates an authority using coercive {language_detected} "
                f"language, threatens immediate service block, and urges action via an unverified link or contact."
            )
            explanation_hi = (
                f"अत्यधिक जोखिम वाला फिशिंग संदेश: यह संदेश {language_detected} भाषा में तुरंत सेवा बंद करने की "
                f"धमकी देता है और फर्जी लिंक या फोन नंबर के जरिए गोपनीय जानकारी चुराने का प्रयास करता है।"
            )
            recommended_action = "Do not click links or respond. Mark as phishing and block sender."
        elif combined_score >= 35:
            category = "SUSPICIOUS_MESSAGE"
            verdict = "SUSPICIOUS"
            explanation_en = (
                f"Suspicious Message: Contains potential urgency cues or unverified links. Exercise caution "
                f"and verify through official banking channels."
            )
            explanation_hi = (
                f"संदिग्ध संदेश: इसमें दबाव बनाने वाली भाषा या अज्ञात लिंक मौजूद हैं। आधिकारिक बैंक ऐप के जरिए जांच करें।"
            )
            recommended_action = "Verify sender authenticity before clicking or replying."
        else:
            category = "BENIGN_COMMUNICATION"
            verdict = "SAFE"
            explanation_en = "Standard communication. No deceptive social engineering or malicious urgency patterns detected."
            explanation_hi = "सामान्य संदेश। कोई धोखाधड़ी या संदिग्ध खतरे के संकेत नहीं पाए गए।"
            recommended_action = "No action required."

        return {
            "source": "SMS / Message",
            "category": category,
            "verdict": verdict,
            "risk_score": combined_score,
            "confidence": confidence,
            "language_detected": language_detected,
            "indicators": indicators,
            "evidence": {
                "matched_keywords": list(set(evidence_keywords)),
                "has_url": has_url,
                "has_phone": has_phone,
                "ml_probability": round(ml_prob, 3)
            },
            "mitre": {
                "technique_id": "T1566.002",
                "technique_name": "Spearphishing Link (SMS)",
                "tactic": "Initial Access"
            } if combined_score >= 50 else None,
            "explanation_en": explanation_en,
            "explanation_hi": explanation_hi,
            "recommended_action": recommended_action
        }

# Global singleton
nlp_detector = NLPDetector()
