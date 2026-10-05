from typing import Dict, Any, List, Optional

class MarkovPredictor:
    """
    First-order Markov Chain model simulating attacker transition probabilities
    across the cyber kill-chain for multi-stage fraud and cyberthreats.
    Dynamically adjusts predictions and confidence based on actual observed events.
    """

    STAGES = [
        "Initial Recon & Phishing Lure",
        "Malicious URL & Typosquatting Access",
        "Credential Harvesting & Phishing Submission",
        "2FA Interception & Vishing Pressure",
        "Rogue Device Login & Account Takeover",
        "Financial Exfiltration & Fund Draining",
        "Attack Contained & Neutralized",
    ]

    STAGE_SHORT_MAP = {
        "RECON": "Initial Recon & Phishing Lure",
        "LURE": "Initial Recon & Phishing Lure",
        "SMS": "Initial Recon & Phishing Lure",
        "URL": "Malicious URL & Typosquatting Access",
        "WEB": "Malicious URL & Typosquatting Access",
        "CREDS": "Credential Harvesting & Phishing Submission",
        "HARVEST": "Credential Harvesting & Phishing Submission",
        "OTP": "2FA Interception & Vishing Pressure",
        "CALL": "2FA Interception & Vishing Pressure",
        "VISHING": "2FA Interception & Vishing Pressure",
        "DEVICE": "Rogue Device Login & Account Takeover",
        "LOGIN": "Rogue Device Login & Account Takeover",
        "SESSION": "Rogue Device Login & Account Takeover",
        "EXFIL": "Financial Exfiltration & Fund Draining",
        "TRANSFER": "Financial Exfiltration & Fund Draining",
        "CONTAINED": "Attack Contained & Neutralized",
    }

    # Baseline theoretical transition probabilities P(Next_Stage | Current_Stage)
    BASE_TRANSITIONS: Dict[str, Dict[str, float]] = {
        "Initial Recon & Phishing Lure": {
            "Malicious URL & Typosquatting Access": 0.55,
            "2FA Interception & Vishing Pressure": 0.25,
            "Credential Harvesting & Phishing Submission": 0.20,
        },
        "Malicious URL & Typosquatting Access": {
            "Credential Harvesting & Phishing Submission": 0.70,
            "2FA Interception & Vishing Pressure": 0.20,
            "Rogue Device Login & Account Takeover": 0.10,
        },
        "Credential Harvesting & Phishing Submission": {
            "Rogue Device Login & Account Takeover": 0.50,
            "2FA Interception & Vishing Pressure": 0.40,
            "Financial Exfiltration & Fund Draining": 0.10,
        },
        "Rogue Device Login & Account Takeover": {
            "2FA Interception & Vishing Pressure": 0.60,
            "Financial Exfiltration & Fund Draining": 0.35,
            "Attack Contained & Neutralized": 0.05,
        },
        "2FA Interception & Vishing Pressure": {
            "Financial Exfiltration & Fund Draining": 0.80,
            "Rogue Device Login & Account Takeover": 0.15,
            "Attack Contained & Neutralized": 0.05,
        },
        "Financial Exfiltration & Fund Draining": {
            "Attack Contained & Neutralized": 0.95,
            "Financial Exfiltration & Fund Draining": 0.05,
        },
        "Attack Contained & Neutralized": {
            "Attack Contained & Neutralized": 1.0,
        },
    }

    STAGE_MITRE_MAP = {
        "Initial Recon & Phishing Lure": ("T1566.002", "Spearphishing Link", "Initial Access"),
        "Malicious URL & Typosquatting Access": ("T1204.001", "Malicious Link", "Execution"),
        "Credential Harvesting & Phishing Submission": ("T1056.003", "Web Portal Capture", "Credential Access"),
        "Rogue Device Login & Account Takeover": ("T1078.004", "Cloud/Web Accounts", "Defense Evasion"),
        "2FA Interception & Vishing Pressure": ("T1621", "MFA Request Generation", "Credential Access"),
        "Financial Exfiltration & Fund Draining": ("T1567", "Exfiltration Over Web Service", "Impact"),
        "Attack Contained & Neutralized": ("M1049", "Antivirus / Endpoint Isolation", "Mitigation"),
    }

    MITIGATIONS = {
        "Malicious URL & Typosquatting Access": "Enable Pay-Safe DNS sinkhole, enforce zero-trust link sandbox, and alert user against clicking unverified links.",
        "Credential Harvesting & Phishing Submission": "Force immediate password reset on bank portal, invalidate cached browser cookies, and lock account temporarily.",
        "Rogue Device Login & Account Takeover": "Execute 1-click active session revocation, trigger device fingerprint ban, and enforce multi-factor re-authentication.",
        "2FA Interception & Vishing Pressure": "Activate Call Guard anti-coercion overlay. Warn victim in Hindi & English to NEVER share OTP over voice calls.",
        "Financial Exfiltration & Fund Draining": "CRITICAL EMERGENCY: Issue immediate freeze command, notify bank fraud cell, and revoke all authorization tokens.",
        "Attack Contained & Neutralized": "System safe. Audit logs sealed and cryptographic proof preserved for legal reporting.",
        "There is not enough evidence to confidently predict the next stage.": "Continue monitoring incoming communications and maintain standard zero-trust vigilance."
    }

    THREAT_WINDOWS = {
        "Initial Recon & Phishing Lure": "5 - 15 minutes",
        "Malicious URL & Typosquatting Access": "2 - 5 minutes",
        "Credential Harvesting & Phishing Submission": "1 - 3 minutes",
        "Rogue Device Login & Account Takeover": "60 - 120 seconds",
        "2FA Interception & Vishing Pressure": "30 - 60 seconds (HIGH URGENCY)",
        "Financial Exfiltration & Fund Draining": "< 30 seconds (IMMEDIATE LOSS)",
        "Attack Contained & Neutralized": "Contained",
    }

    def normalize_stage(self, stage_input: str) -> str:
        s = stage_input.upper()
        for key, canonical in self.STAGE_SHORT_MAP.items():
            if key in s:
                return canonical
        if stage_input in self.BASE_TRANSITIONS:
            return stage_input
        return "Initial Recon & Phishing Lure"

    def predict_next(
        self,
        current_stage_input: str,
        observed_events: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically predicts next attack stage.
        If there are insufficient events or risk is negligible, avoids fabricating confidence.
        """
        canonical_stage = self.normalize_stage(current_stage_input)

        # Handle contained
        if canonical_stage == "Attack Contained & Neutralized":
            return {
                "current_stage": canonical_stage,
                "predicted_next_stage": "Attack Contained & Neutralized",
                "confidence": 1.0,
                "threat_window": "Contained",
                "stage_probabilities": {"Attack Contained & Neutralized": 1.0},
                "recommended_mitigation": self.MITIGATIONS["Attack Contained & Neutralized"],
                "mitre_prediction_id": "M1049",
                "mitre_prediction_name": "Antivirus / Endpoint Isolation",
            }

        # Check evidence sufficiency
        if not observed_events or len(observed_events) == 0:
            # Insufficient evidence
            return {
                "current_stage": canonical_stage,
                "predicted_next_stage": "There is not enough evidence to confidently predict the next stage.",
                "confidence": 0.0,
                "threat_window": "N/A",
                "stage_probabilities": {},
                "recommended_mitigation": self.MITIGATIONS["There is not enough evidence to confidently predict the next stage."],
                "mitre_prediction_id": "INFO",
                "mitre_prediction_name": "Insufficient Evidence",
            }

        # Calculate max risk among observed events
        max_risk = max((e.get("risk_score", 0) for e in observed_events), default=0)
        if max_risk < 35:
            # Low threat events do not warrant high-confidence attack predictions
            return {
                "current_stage": canonical_stage,
                "predicted_next_stage": "There is not enough evidence to confidently predict the next stage.",
                "confidence": 0.15,
                "threat_window": "Low Threat",
                "stage_probabilities": {},
                "recommended_mitigation": "Standard security caution. No active attack chain detected.",
                "mitre_prediction_id": "INFO",
                "mitre_prediction_name": "Low Risk Activity",
            }

        # Check specific event patterns in observed events
        sources = [str(e.get("source", "")).upper() for e in observed_events]
        categories = [str(e.get("category", "")).upper() for e in observed_events]

        transitions = dict(self.BASE_TRANSITIONS.get(canonical_stage, {}))

        # Dynamically adjust weights based on actual evidence
        if any("OTP" in c for c in categories) or any("CALL" in s for s in sources):
            if "Financial Exfiltration & Fund Draining" in transitions:
                transitions["Financial Exfiltration & Fund Draining"] += 0.25
        elif any("URL" in s for s in sources) or any("LINK" in c for c in categories):
            if "Credential Harvesting & Phishing Submission" in transitions:
                transitions["Credential Harvesting & Phishing Submission"] += 0.20

        # Normalize probabilities
        total_p = sum(transitions.values())
        if total_p > 0:
            transitions = {k: round(v / total_p, 3) for k, v in transitions.items()}

        predicted_stage = max(transitions, key=transitions.get)
        confidence = transitions[predicted_stage]

        # Weight confidence with number of observed events and severity
        evidence_factor = min(1.0, 0.5 + (len(observed_events) * 0.1) + (max_risk / 200.0))
        effective_confidence = round(confidence * evidence_factor, 2)

        mitre_info = self.STAGE_MITRE_MAP.get(predicted_stage, ("T1059", "Execution", "Execution"))

        full_distribution = {}
        for s in self.STAGES:
            full_distribution[s] = transitions.get(s, 0.0)

        return {
            "current_stage": canonical_stage,
            "predicted_next_stage": predicted_stage,
            "confidence": effective_confidence,
            "threat_window": self.THREAT_WINDOWS.get(canonical_stage, "1 - 3 minutes"),
            "stage_probabilities": full_distribution,
            "recommended_mitigation": self.MITIGATIONS.get(predicted_stage, "Monitor security indicators continuously."),
            "mitre_prediction_id": mitre_info[0],
            "mitre_prediction_name": mitre_info[1],
        }

markov_predictor = MarkovPredictor()
