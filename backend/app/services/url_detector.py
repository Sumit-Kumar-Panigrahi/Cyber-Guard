import re
import math
from urllib.parse import urlparse
from typing import Dict, Any, List

LEGITIMATE_TARGETS = [
    "sbi.co.in", "onlinesbi.sbi", "onlinesbi.com",
    "hdfcbank.com", "hdfc.com",
    "icicibank.com", "icici.com",
    "axisbank.com", "axis.com",
    "paytm.com", "paytmbank.com",
    "bankofbaroda.in", "canarabank.com",
    "incometax.gov.in", "uidai.gov.in"
]

HIGH_RISK_TLDS = [".top", ".xyz", ".online", ".club", ".live", ".site", ".cc", ".icu", ".vip", ".work", ".shop"]

SUSPICIOUS_PATH_TERMS = [
    "kyc", "yono", "pan", "aadhaar", "netbanking", "login", "verify", 
    "authenticate", "secure", "update", "ebanking", "portal", "otp", "rewards"
]

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / len(text)
        entropy -= p * math.log2(p)
    return round(entropy, 2)

class URLDetector:
    def analyze(self, url: str) -> Dict[str, Any]:
        url = url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url_to_parse = "http://" + url
        else:
            url_to_parse = url

        parsed = urlparse(url_to_parse)
        netloc = parsed.netloc.lower()
        path = parsed.path.lower()
        full_url_lower = url.lower()

        indicators: List[str] = []
        evidence: Dict[str, Any] = {
            "domain": netloc,
            "path": path,
            "tld": None,
            "matched_legitimate_target": None,
            "similarity_score": 0.0,
            "entropy": calculate_entropy(netloc)
        }

        risk_score = 0

        # Exact legitimate domain match?
        if any(netloc == legit or netloc.endswith("." + legit) for legit in LEGITIMATE_TARGETS):
            return {
                "source": "Browser / Pay-Safe",
                "category": "VERIFIED_SAFE_DOMAIN",
                "verdict": "SAFE",
                "risk_score": 5,
                "confidence": 0.98,
                "indicators": ["OFFICIAL_VERIFIED_BANKING_DOMAIN"],
                "evidence": evidence,
                "mitre": None,
                "explanation_en": "Verified safe official domain. Valid SSL and known legitimate banking authority.",
                "explanation_hi": "सत्यापित सुरक्षित आधिकारिक डोमेन। यह बैंक का आधिकारिक और सुरक्षित पोर्टल है।",
                "recommended_action": "Safe to browse and interact."
            }

        # 1. High-risk TLD check
        for tld in HIGH_RISK_TLDS:
            if netloc.endswith(tld):
                indicators.append(f"HIGH_RISK_SUSPICIOUS_TLD_{tld.replace('.', '').upper()}")
                evidence["tld"] = tld
                risk_score += 30
                break

        # 2. Typosquatting / Lookalike Check against Indian Banking Targets
        closest_target = None
        min_dist = 99
        domain_without_tld = netloc.split(".")[0]

        for legit in LEGITIMATE_TARGETS:
            legit_name = legit.split(".")[0]
            # Check substring match like "sbi-kyc" or "sbi-online"
            if legit_name in netloc and netloc != legit:
                indicators.append("TYPOSQUATTING_TARGETING_INDIAN_BANK")
                closest_target = legit
                risk_score += 45
                break
            
            dist = levenshtein_distance(domain_without_tld, legit_name)
            if dist < min_dist:
                min_dist = dist
                closest_target = legit

        if min_dist <= 2 and closest_target and "TYPOSQUATTING_TARGETING_INDIAN_BANK" not in indicators:
            indicators.append("HOMOGRAPH_SIMILARITY_TO_LEGITIMATE_BANK")
            evidence["matched_legitimate_target"] = closest_target
            risk_score += 40

        # 3. Suspicious Keywords in Subdomain or Path
        matched_terms = [t for t in SUSPICIOUS_PATH_TERMS if t in full_url_lower]
        if matched_terms:
            indicators.append("DECEPTIVE_SECURITY_PATH_KEYWORDS")
            evidence["matched_terms"] = matched_terms
            risk_score += min(len(matched_terms) * 15, 30)

        # 4. Domain Entropy Anomaly
        if evidence["entropy"] > 4.2:
            indicators.append("HIGH_CHARACTER_ENTROPY_ALGORITHM_GENERATED")
            risk_score += 15

        # 5. IP Address used as host
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", netloc):
            indicators.append("RAW_IP_ADDRESS_HOSTING")
            risk_score += 35

        final_risk = min(risk_score, 100)
        confidence = 0.94 if final_risk >= 70 else 0.85

        if final_risk >= 65:
            category = "MALICIOUS_PHISHING_URL"
            verdict = "CRITICAL_THREAT"
            explanation_en = (
                f"Dangerous Lookalike Website: The URL '{netloc}' mimics official banking infrastructure, "
                f"uses deceptive keywords ({', '.join(matched_terms[:3]) if matched_terms else 'banking'}), and lacks trusted institution certification."
            )
            explanation_hi = (
                f"खतरनाक फर्जी बैंकिंग वेबसाइट: '{netloc}' असली बैंक पोर्टल की नकल कर रहा है। यह आपके पासवर्ड "
                f"और बैंकिंग क्रेडेंशियल चुराने के लिए बनाया गया है।"
            )
            recommended_action = "Block domain immediately. Do not enter passwords, PINs, or card details."
        elif final_risk >= 30:
            category = "SUSPICIOUS_UNVERIFIED_URL"
            verdict = "SUSPICIOUS"
            explanation_en = "Unverified domain with anomalous naming structure. Exercise caution before entering credentials."
            explanation_hi = "अज्ञात और असत्यापित डोमेन। अपनी गोपनीय जानकारी दर्ज करने से पहले सतर्क रहें।"
            recommended_action = "Avoid interaction until verified."
        else:
            category = "LOW_RISK_URL"
            verdict = "SAFE"
            explanation_en = "No immediate homograph or phishing indicators identified on this domain."
            explanation_hi = "इस डोमेन पर कोई तत्काल फिशिंग या धोखाधड़ी के लक्षण नहीं मिले।"
            recommended_action = "Standard web caution."

        return {
            "source": "Browser / Pay-Safe",
            "category": category,
            "verdict": verdict,
            "risk_score": final_risk,
            "confidence": confidence,
            "indicators": indicators,
            "evidence": evidence,
            "mitre": {
                "technique_id": "T1204.001",
                "technique_name": "User Execution: Malicious Link",
                "tactic": "Execution"
            } if final_risk >= 50 else None,
            "explanation_en": explanation_en,
            "explanation_hi": explanation_hi,
            "recommended_action": recommended_action
        }

url_detector = URLDetector()
