import re
from typing import Dict, Any, List, Tuple

class SensitiveDataDetector:
    """
    Detects and redacts sensitive credentials (passwords, OTPs, PINs, tokens,
    card numbers, Aadhaar numbers) to protect user confidentiality in compliance
    with privacy principles.
    """

    def __init__(self):
        # Regex patterns for sensitive information
        self.password_pattern = re.compile(
            r"(?i)\b(?:password|passwd|pwd|passcode)\s*[:=]\s*([^\s,;]+)",
            re.IGNORECASE
        )
        self.otp_pattern = re.compile(
            r"(?i)\b(?:otp|one[- ]?time[- ]?password|verification[- ]?code|auth[- ]?code)\s*[:=]?\s*([0-9]{4,8})\b",
            re.IGNORECASE
        )
        self.raw_otp_pattern = re.compile(
            r"(?i)\b(?:otp\s+is|code\s+is)\s*([0-9]{4,8})\b",
            re.IGNORECASE
        )
        self.api_key_pattern = re.compile(
            r"(?i)\b(?:api[-_]?key|secret[-_]?key|access[-_]?token|auth[-_]?token|bearer)\s*[:=]\s*([a-zA-Z0-9_\-\.]{16,})",
            re.IGNORECASE
        )
        self.card_pattern = re.compile(
            r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13})\b"
        )
        self.aadhaar_pattern = re.compile(
            r"\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b"
        )

    def scan_and_redact(self, text: str) -> Dict[str, Any]:
        """
        Scans input for sensitive values, generates redactions, and returns
        sanitized text along with security alert metadata.
        """
        sanitized = text
        detected_types: List[str] = []
        has_sensitive = False

        # 1. Password detection
        def redact_password(match):
            nonlocal has_sensitive
            has_sensitive = True
            detected_types.append("PASSWORD")
            return match.group(0).replace(match.group(1), "[REDACTED_PASSWORD]")

        sanitized = self.password_pattern.sub(redact_password, sanitized)

        # 2. OTP detection
        def redact_otp(match):
            nonlocal has_sensitive
            has_sensitive = True
            detected_types.append("OTP")
            return match.group(0).replace(match.group(1), "[REDACTED_OTP]")

        sanitized = self.otp_pattern.sub(redact_otp, sanitized)
        sanitized = self.raw_otp_pattern.sub(redact_otp, sanitized)

        # 3. API key / Token detection
        def redact_token(match):
            nonlocal has_sensitive
            has_sensitive = True
            detected_types.append("AUTH_TOKEN")
            return match.group(0).replace(match.group(1), "[REDACTED_SECRET_KEY]")

        sanitized = self.api_key_pattern.sub(redact_token, sanitized)

        # 4. Credit/Debit Card detection
        def redact_card(match):
            nonlocal has_sensitive
            has_sensitive = True
            detected_types.append("PAYMENT_CARD")
            card_num = match.group(0)
            return card_num[:4] + "-XXXX-XXXX-" + card_num[-4:]

        sanitized = self.card_pattern.sub(redact_card, sanitized)

        # 5. Aadhaar detection
        def redact_aadhaar(match):
            nonlocal has_sensitive
            has_sensitive = True
            detected_types.append("GOVERNMENT_ID")
            return "XXXX-XXXX-" + match.group(0).replace(" ", "")[-4:]

        sanitized = self.aadhaar_pattern.sub(redact_aadhaar, sanitized)

        # Deduplicate detected types
        detected_unique = list(dict.fromkeys(detected_types))

        warning_en = None
        warning_hi = None
        if has_sensitive:
            items_str = ", ".join(detected_unique).lower()
            warning_en = (
                f"Sensitive Information Alert: We detected confidential credential(s) ({items_str}) in your input. "
                "For your safety, CYBERGUARD has automatically redacted these credentials. "
                "Never share passwords, OTPs, or private authentication tokens in plaintext. "
                "These values are not retained in storage."
            )
            warning_hi = (
                f"संवेदनशील जानकारी चेतावनी: आपके इनपुट में गोपनीय क्रेडेंशियल ({items_str}) पाए गए हैं। "
                "आपकी सुरक्षा के लिए साइबरगार्ड ने इन्हें स्वतः हटा (redact) दिया है। "
                "पासवर्ड, ओटीपी या गुप्त टोकन कभी भी किसी के साथ साझा न करें। यह जानकारी सिस्टम में संग्रहीत नहीं की जाती।"
            )

        return {
            "has_sensitive_data": has_sensitive,
            "detected_types": detected_unique,
            "sanitized_text": sanitized,
            "warning_en": warning_en,
            "warning_hi": warning_hi
        }

sensitive_data_detector = SensitiveDataDetector()
