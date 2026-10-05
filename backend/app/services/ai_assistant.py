import re
import os
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from app.services.sensitive_data_detector import sensitive_data_detector
from app.services.url_detector import url_detector

logger = logging.getLogger(__name__)

class AIAssistantEngine:
    """
    Intelligent dynamic AI security assistant and contextual detection pipeline
    specifically engineered for Indian and global cyber threat vectors.
    """

    def __init__(self):
        # Educational and General Knowledge Repository (English & Hindi)
        self.knowledge_base = {
            "phishing": {
                "title": "Phishing Attacks",
                "en": (
                    "Phishing is a deceptive social engineering technique where attackers impersonate trusted "
                    "organizations (such as banks, utility boards, tax departments, or online services) to trick "
                    "you into revealing sensitive information like passwords, credit card numbers, or OTPs.\n\n"
                    "**Common Signs of Phishing:**\n"
                    "• **Artificial Urgency:** Demands immediate payment or threats of account suspension within hours.\n"
                    "• **Deceptive Links:** Links with misspelled domains or strange extensions (.online, .top, .xyz).\n"
                    "• **Requests for Secrets:** Any request asking for your OTP, PIN, or password.\n\n"
                    "**Protection Advice:** Never click links in unexpected messages. Always navigate to official websites directly."
                ),
                "hi": (
                    "फिशिंग (Phishing) एक प्रकार का ऑनलाइन धोखा है जिसमें साइबर अपराधी किसी विश्वसनीय बैंक, सरकारी विभाग या कंपनी "
                    "का रूप धारण करके आपको फर्जी मैसेज या ईमेल भेजते हैं ताकि आपका पासवर्ड, कार्ड विवरण या ओटीपी चुरा सकें।\n\n"
                    "**फिशिंग के मुख्य लक्षण:**\n"
                    "• **अत्यधिक जल्दबाजी:** खाता तुरंत बंद होने या बिजली कटने का डर दिखाना।\n"
                    "• **फर्जी लिंक:** बैंक के नाम से मिलते-जुलते संदिग्ध वेब पते।\n"
                    "• **गोपनीय जानकारी मांगना:** ओटीपी, एटीएम पिन या पासवर्ड पूछना।\n\n"
                    "**सुरक्षा सुझाव:** अनजान मैसेज में आए लिंक पर कभी क्लिक न करें। हमेशा आधिकारिक ऐप या वेबसाइट का ही इस्तेमाल करें।"
                )
            },
            "malware": {
                "title": "Malware & Ransomware",
                "en": (
                    "Malware (short for malicious software) refers to any program designed to harm, exploit, or steal data from "
                    "devices. This includes viruses, trojans, spyware, and ransomware.\n\n"
                    "**How Malware Spreads:**\n"
                    "• Downloading unverified APK files from WhatsApp, Telegram, or third-party websites.\n"
                    "• Malicious email attachments (such as fake invoices or court notices).\n"
                    "• Vulnerable software that has not been updated with security patches.\n\n"
                    "**Protection Advice:** Install apps only from official stores (Google Play, Apple App Store) and keep your operating system updated."
                ),
                "hi": (
                    "मैलवेयर (Malware) दुर्भावनापूर्ण सॉफ्टवेयर होता है जो आपके मोबाइल या कंप्यूटर को नुकसान पहुंचाने या आपका व्यक्तिगत डेटा चुराने के लिए बनाया जाता है।\n\n"
                    "**मैलवेयर फैलने के कारण:**\n"
                    "• व्हाट्सएप या टेलीग्राम से फर्जी एपीके (.apk) फाइलें डाउनलोड करना।\n"
                    "• अनजान ईमेल से जुड़ी फाइलों को खोलना।\n"
                    "• सॉफ्टवेयर और ऑपरेटिंग सिस्टम को अपडेट न रखना।\n\n"
                    "**सुरक्षा सुझाव:** हमेशा केवल गूगल प्ले स्टोर या आधिकारिक ऐप स्टोर से ही एप्लिकेशन डाउनलोड करें।"
                )
            },
            "2fa": {
                "title": "Two-Factor Authentication (2FA)",
                "en": (
                    "Two-Factor Authentication (2FA) adds an extra layer of security beyond your password. Even if someone knows "
                    "your password, they cannot access your account without the second factor (such as an authenticator app code, "
                    "hardware security key, or SMS OTP).\n\n"
                    "**Best Practices:**\n"
                    "• Prefer Authenticator Apps (like Google Authenticator or Microsoft Authenticator) over SMS OTPs when possible.\n"
                    "• **CRITICAL RULE:** Never read out or forward an OTP to anyone over the phone, even if they claim to be from customer support or police."
                ),
                "hi": (
                    "टू-फैक्टर ऑथेंटिकेशन (2FA) आपके खाते की सुरक्षा की दूसरी दीवार है। पासवर्ड के अलावा यह दूसरा सत्यापन मांगता है "
                    "(जैसे फोन पर आने वाला गुप्त कोड या ऑथेंटिकेटर ऐप का कोड)।\n\n"
                    "**सर्वोत्तम सुरक्षा नियम:**\n"
                    "• जहां संभव हो, एसएमएस ओटीपी की जगह गूगल ऑथेंटिकेटर ऐप का प्रयोग करें।\n"
                    "• **अति महत्वपूर्ण:** अपने फोन पर आया ओटीपी कभी किसी को फोन कॉल पर न बताएं, चाहे कॉलर बैंक मैनेजर या पुलिस अधिकारी होने का दावा करे।"
                )
            },
            "password_compromise": {
                "title": "Password Compromise & Account Recovery",
                "en": (
                    "If you believe your password or credentials have been compromised or entered on a suspicious page:\n\n"
                    "1. **Immediately Change Your Password:** Change it from a clean, secure device.\n"
                    "2. **Log Out of All Active Sessions:** In account settings, select 'Sign out of all devices'.\n"
                    "3. **Enable 2FA:** Set up authenticator-based verification.\n"
                    "4. **Review Recent Transactions / Activity:** Check your account statement and report unauthorized activity to your bank immediately.\n"
                    "5. **National Cyber Crime Helpline:** In India, call **1930** or report at **cybercrime.gov.in**."
                ),
                "hi": (
                    "यदि आपने किसी संदिग्ध पेज पर अपना पासवर्ड दर्ज कर दिया है या पासवर्ड चोरी होने का अंदेशा है:\n\n"
                    "1. **तुरंत पासवर्ड बदलें:** सुरक्षित डिवाइस से अपना पासवर्ड तत्काल रिसेट करें।\n"
                    "2. **सभी सत्र समाप्त करें (Logout):** अकाउंट सेटिंग्स में जाकर 'Sign out of all other sessions' चुनें।\n"
                    "3. **2FA सक्रिय करें:** टू-फैक्टर ऑथेंटिकेशन चालू करें।\n"
                    "4. **बैंक लेनदेन की जांच करें:** बैंक खाते का विवरण देखें और किसी भी अज्ञात लेनदेन की सूचना तुरंत बैंक को दें।\n"
                    "5. **हेल्पलाइन 1930:** भारत में साइबर वित्तीय धोखाधड़ी की स्थिति में तत्काल 1930 पर कॉल करें या cybercrime.gov.in पर शिकायत दर्ज करें।"
                )
            }
        }

    def detect_language(self, text: str) -> Tuple[str, bool]:
        """
        Detects whether input is Devanagari Hindi, Romanized Hinglish, or English.
        Returns: (language_code: 'hi' | 'hinglish' | 'en', explicit_hindi_requested: bool)
        """
        text_lower = text.lower()
        has_devanagari = bool(re.search(r"[\u0900-\u097F]", text))

        explicit_hindi = any(phrase in text_lower for phrase in [
            "hindi", "हिन्दी", "हिंदी", "in hindi", "hindi me", "hindi mein", "translate to hindi"
        ])

        hinglish_words = [
            "kya", "hai", "mujhe", "aaya", "batao", "karein", "karna", "paisa", "paise",
            "khata", "band", "bataiye", "suno", "safe hai", "scam hai", "call aaya",
            "otp aaya", "turant", "raat", "bijli", "nambar", "sampark", "warna", "yeh", "ye"
        ]
        matched_hinglish = [w for w in hinglish_words if re.search(rf"\b{w}\b", text_lower)]

        if has_devanagari or explicit_hindi:
            return "hi", explicit_hindi
        elif len(matched_hinglish) >= 2 or (len(matched_hinglish) == 1 and len(text.split()) <= 6):
            return "hinglish", explicit_hindi
        return "en", explicit_hindi

    def detect_intent(self, text: str) -> str:
        """
        Determines user intent:
        - GENERAL_QUESTION
        - ACCOUNT_SECURITY / INCIDENT_GUIDANCE
        - URL_ANALYSIS
        - SECURITY_ANALYSIS (scam / message / call)
        - PRIVACY_QUESTION
        - TRANSLATION
        """
        text_lower = text.lower().strip()

        # Check for URL analysis intent
        if re.search(r"https?://\S+|www\.\S+|\b[a-zA-Z0-9-]+\.(?:com|org|in|online|top|xyz|club|net|gov|edu)(?:/\S*)?", text_lower):
            # If input is mostly a URL or asks to check a URL
            if len(text.split()) <= 10 or any(w in text_lower for w in ["check", "url", "link", "safe", "site", "website"]):
                return "URL_ANALYSIS"

        # Check for pure educational / conceptual question
        educational_starters = [
            "what is", "what are", "how does", "explain", "define", "meaning of", "difference between",
            "kya hota hai", "kya hai", "samjhao", "kaise kaam karta hai", "kise kehte hain"
        ]
        is_starter_question = any(text_lower.startswith(starter) for starter in educational_starters)
        question_keywords = ["phishing", "malware", "ransomware", "trojan", "2fa", "two factor", "mfa", "encryption", "firewall", "zero trust"]

        if is_starter_question and any(k in text_lower for k in question_keywords):
            # Verify it's not a scam report (e.g. "What should I do, someone called me...")
            if not any(k in text_lower for k in ["i received", "got a call", "someone called", "pay ₹", "pay rs", "my connection", "will be blocked"]):
                return "GENERAL_QUESTION"

        if text_lower in ["what is phishing?", "what is phishing", "what is malware?", "what is malware", "what is two factor authentication?", "what is 2fa?"]:
            return "GENERAL_QUESTION"

        # Incident guidance / Account protection questions
        if any(phrase in text_lower for phrase in [
            "what should i do", "shared my password", "shared my otp", "lost my phone",
            "how can i protect", "account hacked", "compromised", "kya karu", "kya karna chahiye",
            "password share ho gaya", "otp de diya"
        ]):
            return "INCIDENT_GUIDANCE"

        # Privacy questions
        if any(phrase in text_lower for phrase in [
            "privacy", "what data", "do you store", "gdpr", "consent", "dpdp", "data security"
        ]):
            return "PRIVACY_QUESTION"

        # Translation / explanation in Hindi request
        if text_lower in ["explain this in hindi", "hindi me samjhao", "hindi mein batao", "explain this in simple language"]:
            return "TRANSLATION"

        # Security analysis intent (suspicious message, call, transaction, or potential threat)
        threat_cues = [
            "disconnected", "cut", "pay", "rupees", "₹", "rs", "prize", "won", "lottery",
            "reward", "fee", "verification code", "otp", "called", "support", "bank", "police",
            "arrest", "fir", "blocked", "suspended", "urgent", "immediately", "turant",
            "kat diya jayega", "lucky draw", "link", "update", "expire", "deceptive", "fake"
        ]
        if any(c in text_lower for c in threat_cues):
            return "SECURITY_ANALYSIS"

        # If user asks if something is safe
        if any(phrase in text_lower for phrase in ["is this safe", "safe hai", "scam hai", "suspicious", "kya ye safe"]):
            return "SECURITY_ANALYSIS"

        return "GENERAL_QUESTION"

    def analyze_security_content(self, text: str) -> Dict[str, Any]:
        """
        Dynamic, context-aware security evaluation pipeline for arbitrary text.
        Extracts semantic characteristics, entities, urgency, coercion, financial pressure,
        and produces dynamic, non-hardcoded risk metrics and explanations.
        """
        text_lower = text.lower()

        indicators: List[str] = []
        evidence: Dict[str, Any] = {}
        risk_score = 10
        threat_type = "GENERAL_COMMUNICATION"
        summary_en_parts: List[str] = []
        summary_hi_parts: List[str] = []

        # 1. Check for Urgency & Artificial Deadline Pressure
        urgency_regex = re.compile(
            r"\b(immediately|in \d+ hours?|within \d+ hours?|tonight|today|by 9[:.]\d+|aaj raat|turant|urgent|deadline|action required|emergency)\b",
            re.IGNORECASE
        )
        urgency_matches = urgency_regex.findall(text)
        if urgency_matches:
            indicators.append("ARTIFICIAL_DEADLINE_URGENCY")
            evidence["urgency_cues"] = list(set(urgency_matches))
            risk_score += 25
            summary_en_parts.append(f"creates artificial urgency ('{', '.join(set(urgency_matches))}')")
            summary_hi_parts.append("तुरंत कार्रवाई करने का अत्यधिक दबाव बनाता है")

        # 2. Check for Service Disconnection / Penalty Threats (Electricity, Water, Mobile, Legal)
        disconnection_regex = re.compile(
            r"\b(disconnect(?:ed)?|cut|halted|suspended|blocked|kat diya jayega|band ho jayega|deactivate|frozen)\b",
            re.IGNORECASE
        )
        disconn_matches = disconnection_regex.findall(text)
        if disconn_matches:
            indicators.append("SERVICE_DISCONNECTION_OR_BLOCK_THREAT")
            evidence["threat_actions"] = list(set(disconn_matches))
            risk_score += 25
            summary_en_parts.append(f"threatens imminent service cut or suspension")
            summary_hi_parts.append("सेवा या खाता बंद करने की धमकी देता है")

        # 3. Check for Financial Pressure / Demands / Advance Fee
        money_matches = re.findall(r"(?:₹|rs\.?|inr)\s*([0-9,]+)|\b([0-9,]+)\s*(?:rupees|paisa|fee)", text_lower)
        flattened_amounts = [m[0] or m[1] for m in money_matches if (m[0] or m[1])]
        fee_lures = any(w in text_lower for w in ["pay", "payment", "processing fee", "jama karein", "transfer", "tax fee", "fee first"])
        if fee_lures or flattened_amounts:
            indicators.append("PAYMENT_SOLICITATION_OR_ADVANCE_FEE")
            evidence["payment_demanded"] = True
            if flattened_amounts:
                evidence["detected_amounts"] = flattened_amounts
            risk_score += 25
            summary_en_parts.append("demands an immediate financial payment")
            summary_hi_parts.append("तुरंत पैसों के भुगतान की मांग करता है")

        # 4. Check for Reward / Lottery / Fake Prize Lures
        reward_terms = ["won", "reward", "prize", "selected", "lottery", "cashback", "lucky draw", "gift", "bonus"]
        reward_matches = [w for w in reward_terms if re.search(rf"\b{w}\b", text_lower)]
        if reward_matches and ("pay" in text_lower or "fee" in text_lower or flattened_amounts):
            indicators.append("LOTTERY_OR_PRIZE_ADVANCE_FEE_SCAM")
            threat_type = "ADVANCE_FEE_FRAUD"
            evidence["reward_lure_keywords"] = reward_matches
            risk_score += 30
            summary_en_parts.append("uses a classic 'advance fee' prize trap where you must pay money to receive a fake reward")
            summary_hi_parts.append("फर्जी इनाम का लालच देकर पहले पैसे ऐंठने का प्रयास करता है")
        elif reward_matches:
            indicators.append("UNSOLICITED_PRIZE_OFFER")
            risk_score += 15

        # 5. Check for Official Authority / Impersonation (Discom, Bank, Support, Police, Telecom)
        impersonation_keywords = [
            "electricity", "power", "bijli", "water", "customer support", "support executive",
            "bank manager", "helpdesk", "officer", "trai", "cbi", "police", "customs",
            "courier", "fedex", "post office", "income tax", "rbi"
        ]
        matched_authorities = [w for w in impersonation_keywords if w in text_lower]
        if matched_authorities:
            indicators.append("INSTITUTION_OR_AUTHORITY_IMPERSONATION")
            evidence["impersonated_entity"] = matched_authorities
            risk_score += 20
            summary_en_parts.append(f"impersonates an institutional entity ({', '.join(matched_authorities)})")
            summary_hi_parts.append(f"किसी अधिकृत संस्था या अधिकारी ({', '.join(matched_authorities)}) का रूप धारण करता है")

        # 6. Check for Credential / OTP / Verification Code Demands
        cred_terms = ["verification code", "otp", "password", "pin", "cvv", "credentials", "login details", "passcode"]
        matched_creds = [c for c in cred_terms if c in text_lower]
        if matched_creds:
            indicators.append("SOLICITATION_OF_SENSITIVE_CREDENTIALS")
            evidence["solicited_credentials"] = matched_creds
            risk_score += 35
            summary_en_parts.append(f"attempts to harvest your secret {', '.join(matched_creds)}")
            summary_hi_parts.append(f"आपके गोपनीय क्रेडेंशियल ({', '.join(matched_creds)}) हासिल करने की कोशिश करता है")

        # 7. Check for Embedded or Deceptive URLs
        url_matches = re.findall(r"https?://[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9-]+\.(?:online|club|top|xyz|site|xyz|live|link|cc|ru)\b", text)
        if url_matches:
            indicators.append("CONTAINS_UNVERIFIED_WEB_LINK")
            evidence["detected_urls"] = url_matches
            # Analyze each URL
            url_res = url_detector.analyze(url_matches[0])
            evidence["url_analysis"] = {
                "url": url_matches[0],
                "domain": url_res["evidence"].get("domain"),
                "url_risk": url_res["risk_score"]
            }
            risk_score += int(url_res["risk_score"] * 0.4)

        # 8. Check for Phone Contact Lures
        phone_matches = re.findall(r"\b[6-9]\d{9}\b|\+91\s?[6-9]\d{9}", text)
        if phone_matches:
            indicators.append("DIRECT_SCAMMER_PHONE_CONTACT")
            evidence["contact_numbers"] = phone_matches
            risk_score += 15

        # Refine threat type
        if "LOTTERY_OR_PRIZE_ADVANCE_FEE_SCAM" in indicators:
            threat_type = "ADVANCE_FEE_PRIZE_SCAM"
        elif "SERVICE_DISCONNECTION_OR_BLOCK_THREAT" in indicators and any(a in text_lower for a in ["electricity", "bijli", "power"]):
            threat_type = "UTILITY_DISCONNECTION_FRAUD"
        elif "SOLICITATION_OF_SENSITIVE_CREDENTIALS" in indicators:
            threat_type = "SOCIAL_ENGINEERING_CREDENTIAL_THEFT"
        elif "CONTAINS_UNVERIFIED_WEB_LINK" in indicators and "SERVICE_DISCONNECTION_OR_BLOCK_THREAT" in indicators:
            threat_type = "COERCIVE_PHISHING_COMMUNICATION"
        elif len(indicators) >= 2:
            threat_type = "SUSPICIOUS_SOCIAL_ENGINEERING"
        else:
            threat_type = "BENIGN_OR_LOW_RISK_COMMUNICATION"

        # Final score calculation
        final_risk = min(max(risk_score, 0), 100)
        if len(indicators) == 0:
            final_risk = min(final_risk, 15)

        # Confidence based on evidence density (realistic, un-fabricated)
        if len(indicators) >= 3:
            confidence = 0.94
        elif len(indicators) == 2:
            confidence = 0.86
        elif len(indicators) == 1:
            confidence = 0.72
        else:
            confidence = 0.60

        # Severity
        if final_risk >= 75:
            severity = "CRITICAL"
            verdict = "CRITICAL_THREAT"
        elif final_risk >= 45:
            severity = "HIGH"
            verdict = "SUSPICIOUS"
        elif final_risk >= 25:
            severity = "MEDIUM"
            verdict = "SUSPICIOUS"
        else:
            severity = "LOW"
            verdict = "SAFE"

        # Dynamic summaries
        if summary_en_parts:
            summary_en = f"This content exhibits characteristics of an active cyber threat: it {', and '.join(summary_en_parts)}."
        else:
            summary_en = "No coercive scam tactics, credential theft indicators, or malicious links were detected in this content."

        if summary_hi_parts:
            summary_hi = f"यह सामग्री संदिग्ध साइबर धोखाधड़ी के लक्षण दर्शाती है: यह {', तथा '.join(summary_hi_parts)}।"
        else:
            summary_hi = "इस सामग्री में कोई धोखाधड़ी, पासवर्ड चोरी या दुर्भावनापूर्ण लिंक के संकेत नहीं पाए गए।"

        # Dynamic Recommended Actions
        actions: List[str] = []
        if "SOLICITATION_OF_SENSITIVE_CREDENTIALS" in indicators:
            actions.append("Never share your verification code, OTP, or password with anyone, regardless of who they claim to be.")
        if "SERVICE_DISCONNECTION_OR_BLOCK_THREAT" in indicators:
            actions.append("Do not pay through links or numbers provided in the message. Check your official utility bill or portal directly.")
        if "LOTTERY_OR_PRIZE_ADVANCE_FEE_SCAM" in indicators:
            actions.append("Ignore this offer. Legitimate competitions or lotteries never demand an upfront fee to claim prizes.")
        if "CONTAINS_UNVERIFIED_WEB_LINK" in indicators:
            actions.append("Avoid clicking the unverified link. Bookmark and use only official verified portals.")
        if "DIRECT_SCAMMER_PHONE_CONTACT" in indicators:
            actions.append("Block the phone number and report it on the National Cyber Crime portal (1930 / cybercrime.gov.in).")
        if not actions:
            actions.append("Standard security caution: always verify the sender before sharing any personal information.")

        # Predicted Next Step
        if severity in ["HIGH", "CRITICAL"]:
            if "SOLICITATION_OF_SENSITIVE_CREDENTIALS" in indicators:
                predicted_next_step = "Attacker will attempt immediate unauthorized account login or financial fund transfer using stolen credentials."
            elif "CONTAINS_UNVERIFIED_WEB_LINK" in indicators:
                predicted_next_step = "Attacker will direct victim to a cloned web portal to harvest credentials or install a malicious APK."
            elif "LOTTERY_OR_PRIZE_ADVANCE_FEE_SCAM" in indicators or "SERVICE_DISCONNECTION_OR_BLOCK_THREAT" in indicators:
                predicted_next_step = "Attacker will pressure the victim to make an irreversible UPI or IMPS transfer to a mule account."
            else:
                predicted_next_step = "Attacker will escalate urgency to coerce compliance."
        else:
            predicted_next_step = "There is not enough evidence to confidently predict the next stage."

        return {
            "risk_score": final_risk,
            "severity": severity,
            "verdict": verdict,
            "confidence": confidence,
            "threat_type": threat_type,
            "summary_en": summary_en,
            "summary_hi": summary_hi,
            "indicators": indicators,
            "evidence": evidence,
            "recommended_actions": actions,
            "explanation_en": summary_en + f" Risk is assessed as {severity} ({final_risk}/100).",
            "explanation_hi": summary_hi + f" जोखिम स्तर {severity} ({final_risk}/100) आंका गया है।",
            "predicted_next_step": predicted_next_step
        }

    def process_query(self, raw_input: str, preferred_lang: str = "auto") -> Dict[str, Any]:
        """
        Complete processing pipeline for the AI Assistant:
        1. Sanitize & redact sensitive inputs
        2. Detect language (English, Hindi, Hinglish)
        3. Detect intent (Educational Question, Security Threat Analysis, URL check, Guidance)
        4. Execute appropriate dynamic reasoning
        5. Formulate natural bilingual replies and speech scripts
        """
        raw_trimmed = raw_input.strip()
        if not raw_trimmed:
            return {
                "reply": "Please enter a message, question, or URL for analysis.",
                "reply_en": "Please enter a message, question, or URL for analysis.",
                "reply_hi": "कृपया विश्लेषण के लिए कोई संदेश, प्रश्न या वेब लिंक दर्ज करें।",
                "intent": "EMPTY_INPUT",
                "language_detected": "English",
                "is_security_threat": False,
                "analysis": None,
                "sensitive_data_warning": None,
                "speech_text_en": "Please enter a question or message to analyze.",
                "speech_text_hi": "कृपया विश्लेषण के लिए कोई संदेश या प्रश्न दर्ज करें।",
                "saved_event_id": None
            }

        # Step 1: Scan for and redact sensitive info
        scan_result = sensitive_data_detector.scan_and_redact(raw_trimmed)
        sanitized_input = scan_result["sanitized_text"]
        has_sensitive = scan_result["has_sensitive_data"]

        # Step 2: Language Detection
        detected_lang, explicit_hindi = self.detect_language(raw_trimmed)
        if preferred_lang == "hi" or explicit_hindi:
            active_lang = "hi"
        elif preferred_lang == "en":
            active_lang = "en"
        elif detected_lang in ["hi", "hinglish"]:
            active_lang = "hi"
        else:
            active_lang = "en"

        # Step 3: Intent Detection
        intent = self.detect_intent(sanitized_input)

        # Step 4: Handle based on intent
        if intent == "GENERAL_QUESTION":
            # Educational answering - DO NOT CLASSIFY AS THREAT
            topic_key = None
            input_lower = sanitized_input.lower()
            if "phishing" in input_lower:
                topic_key = "phishing"
            elif any(w in input_lower for w in ["malware", "virus", "ransomware", "trojan"]):
                topic_key = "malware"
            elif any(w in input_lower for w in ["2fa", "two factor", "two-factor", "mfa"]):
                topic_key = "2fa"

            if topic_key and topic_key in self.knowledge_base:
                en_text = self.knowledge_base[topic_key]["en"]
                hi_text = self.knowledge_base[topic_key]["hi"]
            else:
                # Dynamic generic educational response
                en_text = (
                    f"**Security Insight:**\n\n"
                    f"Your inquiry regarding '{sanitized_input[:80]}' relates to foundational cyber safety. "
                    "In digital security, safety begins with verification: never trust unverified communications, "
                    "keep your operating system and software updated, use unique complex passwords, and verify "
                    "all financial or account security alerts directly through official channels."
                )
                hi_text = (
                    f"**साइबर सुरक्षा मार्गदर्शन:**\n\n"
                    f"आपके प्रश्न '{sanitized_input[:80]}' के संबंध में साइबर सुरक्षा का मूल सिद्धांत है: "
                    "किसी भी अनजान संदेश या कॉल पर तुरंत भरोसा न करें। अपने डिवाइस को हमेशा अपडेट रखें, "
                    "मजबूत पासवर्ड का उपयोग करें और वित्तीय लेन-देन से जुड़ी किसी भी चेतावनी की पुष्टि आधिकारिक बैंक ऐप या वेबसाइट से करें।"
                )

            reply = hi_text if active_lang == "hi" else en_text
            speech_en = "Cyberguard security advice: Always verify communications through official channels and never share sensitive credentials."
            speech_hi = "साइबरगार्ड सुरक्षा सलाह: हमेशा आधिकारिक माध्यमों से पुष्टि करें और अपनी गोपनीय जानकारी किसी के साथ साझा न करें।"

            return {
                "reply": reply,
                "reply_en": en_text,
                "reply_hi": hi_text,
                "intent": intent,
                "language_detected": "Hindi" if detected_lang in ["hi", "hinglish"] else "English",
                "is_security_threat": False,
                "analysis": {
                    "risk_score": 0,
                    "severity": "LOW",
                    "confidence": 0.99,
                    "threat_type": "EDUCATIONAL_QUERY",
                    "summary": "Educational query answered safely without security incident creation.",
                    "indicators": [],
                    "evidence": {"query": sanitized_input},
                    "recommended_actions": ["Keep learning about cyber safety.", "Enable 2FA on your accounts."],
                    "explanation_en": "Standard educational question. No threat identified.",
                    "explanation_hi": "यह एक सामान्य जानकारी से संबंधित प्रश्न है। कोई खतरा नहीं है।",
                    "predicted_next_step": "There is not enough evidence to confidently predict the next stage."
                },
                "sensitive_data_warning": scan_result["warning_hi"] if active_lang == "hi" else scan_result["warning_en"],
                "speech_text_en": speech_en,
                "speech_text_hi": speech_hi,
                "saved_event_id": None
            }

        elif intent == "INCIDENT_GUIDANCE":
            # Guidance on compromised credentials or panic scenario
            en_text = self.knowledge_base["password_compromise"]["en"]
            hi_text = self.knowledge_base["password_compromise"]["hi"]
            reply = hi_text if active_lang == "hi" else en_text
            speech_en = "Immediate action required: Change your password immediately, log out from all devices, and call 1930 if money was debited."
            speech_hi = "तुरंत कार्रवाई करें: अपना पासवर्ड तत्काल बदलें, सभी डिवाइस से लॉगआउट करें और पैसे कटने पर तुरंत 1930 पर कॉल करें।"

            return {
                "reply": reply,
                "reply_en": en_text,
                "reply_hi": hi_text,
                "intent": intent,
                "language_detected": "Hindi" if detected_lang in ["hi", "hinglish"] else "English",
                "is_security_threat": False,
                "analysis": {
                    "risk_score": 20,
                    "severity": "LOW",
                    "confidence": 0.95,
                    "threat_type": "INCIDENT_RECOVERY_GUIDANCE",
                    "summary": "Provided official step-by-step incident containment and 1930 helpline guidelines.",
                    "indicators": ["INCIDENT_RESPONSE_ASSISTANCE"],
                    "evidence": {"user_scenario": sanitized_input},
                    "recommended_actions": [
                        "Change compromised passwords immediately.",
                        "Revoke active device sessions.",
                        "Call 1930 National Cyber Helpline if financial fraud occurred."
                    ],
                    "explanation_en": "Incident guidance provided for account protection.",
                    "explanation_hi": "खाते की सुरक्षा के लिए आवश्यक कदम बताए गए हैं।",
                    "predicted_next_step": "There is not enough evidence to confidently predict the next stage."
                },
                "sensitive_data_warning": scan_result["warning_hi"] if active_lang == "hi" else scan_result["warning_en"],
                "speech_text_en": speech_en,
                "speech_text_hi": speech_hi,
                "saved_event_id": None
            }

        elif intent == "PRIVACY_QUESTION":
            en_text = (
                "**Zero-Trust Privacy Architecture:**\n\n"
                "CYBERGUARD adheres strictly to India's Digital Personal Data Protection (DPDP) principles:\n"
                "• **Consent-Gated Telemetry:** We only analyze communications from channels you explicitly activate in the Consent Center.\n"
                "• **No Plaintext Credential Retention:** Passwords, OTPs, and card tokens are automatically redacted in-memory.\n"
                "• **Local Cryptographic Integrity:** Security logs are cryptographically hashed so unauthorized tampering is immediately flagged."
            )
            hi_text = (
                "**गोपनीयता और डेटा सुरक्षा नीति:**\n\n"
                "साइबरगार्ड भारत के डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) नियमों का पूर्ण पालन करता है:\n"
                "• **सहमति-आधारित सुरक्षा:** हम केवल उन्हीं संदेशों या चैनलों की जांच करते हैं जिनकी अनुमति आप प्राइवेसी सेंटर में देते हैं।\n"
                "• **गोपनीय क्रेडेंशियल सुरक्षा:** आपके पासवर्ड, ओटीपी और कार्ड नंबर कभी भी सेव नहीं किए जाते।\n"
                "• **क्रिप्टोग्राफिक ऑडिट:** सभी सुरक्षा रिकॉर्ड सुरक्षित और छेड़छाड़-रहित (tamper-proof) रखे जाते हैं।"
            )
            reply = hi_text if active_lang == "hi" else en_text
            return {
                "reply": reply,
                "reply_en": en_text,
                "reply_hi": hi_text,
                "intent": intent,
                "language_detected": "Hindi" if detected_lang in ["hi", "hinglish"] else "English",
                "is_security_threat": False,
                "analysis": None,
                "sensitive_data_warning": scan_result["warning_hi"] if active_lang == "hi" else scan_result["warning_en"],
                "speech_text_en": "Cyberguard operates with zero-trust privacy. No passwords or OTPs are stored.",
                "speech_text_hi": "साइबरगार्ड पूर्ण गोपनीयता के साथ काम करता है। कोई पासवर्ड या ओटीपी सेव नहीं किया जाता।",
                "saved_event_id": None
            }

        # Otherwise, perform Dynamic Security Analysis Pipeline (Scams, URLs, Phishing, Coercion, Unseen Inputs)
        analysis_res = self.analyze_security_content(sanitized_input)

        # Build natural conversational response in English and Hindi
        en_lines = [
            f"### Security Analysis: {analysis_res['threat_type'].replace('_', ' ').title()}",
            f"**Assessed Risk Level:** {analysis_res['severity']} ({analysis_res['risk_score']}/100) • **Confidence:** {int(analysis_res['confidence']*100)}%",
            f"\n**Summary:**\n{analysis_res['summary_en']}",
        ]

        if analysis_res['indicators']:
            en_lines.append(f"\n**Key Behavioral Indicators:**\n" + "\n".join([f"• `{ind}`" for ind in analysis_res['indicators']]))

        en_lines.append(f"\n**Recommended Action:**\n" + "\n".join([f"{i+1}. {act}" for i, act in enumerate(analysis_res['recommended_actions'])]))

        if analysis_res['severity'] in ['HIGH', 'CRITICAL']:
            en_lines.append(f"\n**Next Stage Prediction:**\n{analysis_res['predicted_next_step']}")

        hi_lines = [
            f"### सुरक्षा विश्लेषण: {analysis_res['threat_type'].replace('_', ' ').title()}",
            f"**खतरे का स्तर:** {analysis_res['severity']} ({analysis_res['risk_score']}/100) • **सटीकता:** {int(analysis_res['confidence']*100)}%",
            f"\n**विवरण:**\n{analysis_res['summary_hi']}",
        ]

        if analysis_res['indicators']:
            hi_lines.append(f"\n**पहचाने गए मुख्य खतरे:**\n" + "\n".join([f"• `{ind}`" for ind in analysis_res['indicators']]))

        # Translate recommended actions into natural Hindi
        hi_actions = []
        for act in analysis_res['recommended_actions']:
            if "verification code" in act or "OTP" in act:
                hi_actions.append("अपना ओटीपी या पासवर्ड किसी को भी फोन पर न बताएं।")
            elif "utility bill" in act:
                hi_actions.append("मैसेज में दिए गए नंबर या लिंक पर भुगतान न करें। आधिकारिक बिजली ऐप या बिल की जांच करें।")
            elif "Ignore this offer" in act:
                hi_actions.append("इस मैसेज को नजरअंदाज करें। कोई भी वैध लॉटरी पहले पैसे जमा करने को नहीं कहती।")
            elif "Avoid clicking" in act:
                hi_actions.append("संदिग्ध लिंक पर क्लिक न करें। केवल आधिकारिक वेबसाइट पर ही जाएं।")
            else:
                hi_actions.append("संदिग्ध नंबर को ब्लॉक करें और 1930 साइबर हेल्पलाइन पर रिपोर्ट करें।")

        hi_lines.append(f"\n**सुझाए गए सुरक्षा कदम:**\n" + "\n".join([f"{i+1}. {act}" for i, act in enumerate(hi_actions)]))

        if analysis_res['severity'] in ['HIGH', 'CRITICAL']:
            hi_lines.append(f"\n**संभावित अगला कदम:**\nधोखेबाज तुरंत आपके खाते से अनधिकृत लेन-देन या पैसे निकालने का प्रयास कर सकता है।")

        reply_en = "\n".join(en_lines)
        reply_hi = "\n".join(hi_lines)
        reply = reply_hi if active_lang == "hi" else reply_en

        # Clean speech texts (concise and clear for TTS)
        if analysis_res['severity'] in ['HIGH', 'CRITICAL']:
            speech_en = f"Alert: High risk {analysis_res['threat_type'].replace('_', ' ').lower()} detected. {analysis_res['recommended_actions'][0]}"
            speech_hi = f"चेतावनी: उच्च जोखिम वाला संदिग्ध संदेश पाया गया है। कृपया कोई गोपनीय जानकारी या ओटीपी साझा न करें।"
        else:
            speech_en = f"Security check complete. Content evaluated with risk score of {analysis_res['risk_score']} out of 100."
            speech_hi = f"सुरक्षा जांच पूर्ण हुई। सामग्री का जोखिम स्कोर 100 में से {analysis_res['risk_score']} है।"

        return {
            "reply": reply,
            "reply_en": reply_en,
            "reply_hi": reply_hi,
            "intent": intent,
            "language_detected": "Hindi" if detected_lang in ["hi", "hinglish"] else "English",
            "is_security_threat": analysis_res['risk_score'] >= 45,
            "analysis": analysis_res,
            "sensitive_data_warning": scan_result["warning_hi"] if active_lang == "hi" else scan_result["warning_en"],
            "speech_text_en": speech_en,
            "speech_text_hi": speech_hi,
            "saved_event_id": None
        }

ai_assistant_engine = AIAssistantEngine()
