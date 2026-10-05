import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

class AnomalyDetector:
    def __init__(self):
        # Initialize an Isolation Forest baseline model
        # Features: [geo_distance_km, hours_since_last_login, is_new_device (0/1), ip_reputation_score (0-10)]
        np.random.seed(42)
        # Synthetic baseline of normal user behaviors: low distance, regular devices, trusted IPs
        normal_samples = np.array([
            [5.0, 4.0, 0.0, 0.0],
            [12.0, 8.0, 0.0, 0.0],
            [0.0, 24.0, 0.0, 0.0],
            [25.0, 12.0, 0.0, 1.0],
            [2.0, 1.0, 0.0, 0.0],
            [18.0, 16.0, 0.0, 0.0],
            [8.0, 6.0, 0.0, 0.0],
            [40.0, 72.0, 1.0, 0.0], # Occasional new device in same metro
            [15.0, 2.0, 0.0, 0.0],
            [3.0, 0.5, 0.0, 0.0],
        ])
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.model.fit(normal_samples)

    def evaluate_login(
        self,
        device_fingerprint: str,
        known_fingerprints: List[str],
        current_geo: str,
        previous_geo: str,
        ip_address: str,
        device_name: str
    ) -> Dict[str, Any]:
        indicators: List[str] = []
        evidence: Dict[str, Any] = {
            "device_name": device_name,
            "ip_address": ip_address,
            "current_geo": current_geo,
            "previous_geo": previous_geo,
            "is_new_device": False,
            "geo_leap_detected": False
        }

        # 1. Device familiarity
        is_new_device = device_fingerprint not in known_fingerprints if known_fingerprints else False
        evidence["is_new_device"] = is_new_device

        # 2. Approximate Geo Leap (e.g. Delhi to foreign / anomalous location)
        current_lower = current_geo.lower()
        prev_lower = previous_geo.lower() if previous_geo else "new delhi, india"

        geo_distance_km = 10.0
        if "delhi" in prev_lower and ("lagos" in current_lower or "frankfurt" in current_lower or "moscow" in current_lower or "unknown" in current_lower or "russia" in current_lower):
            geo_distance_km = 6500.0
            indicators.append("IMPOSSIBLE_GEOGRAPHICAL_TRAVEL_LEAP")
            evidence["geo_leap_detected"] = True

        if is_new_device:
            indicators.append("UNKNOWN_UNRECOGNIZED_DEVICE_FINGERPRINT")

        # 3. Isolation Forest prediction
        feature_vector = np.array([[
            geo_distance_km,
            1.0, # Recent activity window
            1.0 if is_new_device else 0.0,
            8.0 if evidence["geo_leap_detected"] else 0.0
        ]])

        if_score = float(self.model.decision_function(feature_vector)[0])
        is_if_anomaly = if_score < 0

        # Calculate composite risk
        risk_score = 0
        if is_new_device:
            risk_score += 45
        if evidence["geo_leap_detected"]:
            risk_score += 45
        if is_if_anomaly:
            indicators.append("ISOLATION_FOREST_BEHAVIORAL_ANOMALY")
            risk_score += 15

        final_risk = min(risk_score, 100)
        confidence = 0.95 if final_risk >= 80 else 0.85

        if final_risk >= 70:
            category = "ACCOUNT_TAKEOVER_ATTEMPT"
            verdict = "CRITICAL_THREAT"
            explanation_en = (
                f"Critical Security Alert: An unknown device '{device_name}' logged in from {current_geo} "
                f"via IP {ip_address}, exhibiting an impossible travel jump from your regular location. High probability of stolen credentials."
            )
            explanation_hi = (
                f"अति-संवेदनशील सुरक्षा चेतावनी: एक अज्ञात डिवाइस '{device_name}' ने {current_geo} से आपके खाते "
                f"में लॉगिन किया है। यह अनधिकृत खाता अधिग्रहण (Account Takeover) का गंभीर संकेत है।"
            )
            recommended_action = "Revoke session immediately, block device, and trigger password reset."
        elif final_risk >= 40:
            category = "NEW_DEVICE_LOGIN"
            verdict = "SUSPICIOUS"
            explanation_en = f"New unrecognized device '{device_name}' accessed your account. Verify identity."
            explanation_hi = f"आपके खाते में एक नए अज्ञात डिवाइस '{device_name}' से लॉगिन किया गया है।"
            recommended_action = "Confirm if this login was initiated by you."
        else:
            category = "AUTHORIZED_RECOGNIZED_DEVICE"
            verdict = "SAFE"
            explanation_en = "Device and login location match known profile baseline."
            explanation_hi = "डिवाइस और लॉगिन स्थान सुरक्षित और सत्यापित हैं।"
            recommended_action = "No action needed."

        return {
            "source": "Login & Device Guard",
            "category": category,
            "verdict": verdict,
            "risk_score": final_risk,
            "confidence": confidence,
            "indicators": indicators,
            "evidence": evidence,
            "mitre": {
                "technique_id": "T1078",
                "technique_name": "Valid Accounts: Cloud / Web Sessions",
                "tactic": "Defense Evasion / Initial Access"
            } if final_risk >= 50 else None,
            "explanation_en": explanation_en,
            "explanation_hi": explanation_hi,
            "recommended_action": recommended_action
        }

anomaly_detector = AnomalyDetector()
