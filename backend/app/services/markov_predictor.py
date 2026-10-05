from typing import Dict, Any, List, Optional

class MarkovPredictor:
    """
    First-order Markov Chain model simulating attacker transition probabilities
    across the cyber kill-chain for Indian financial scams and multi-stage fraud.
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

    # Transition matrix P(Next_Stage | Current_Stage)
    TRANSITION_MATRIX: Dict[str, Dict[str, float]] = {
        "Initial Recon & Phishing Lure": {
            "Malicious URL & Typosquatting Access": 0.74,
            "2FA Interception & Vishing Pressure": 0.18,
            "Credential Harvesting & Phishing Submission": 0.08,
        },
        "Malicious URL & Typosquatting Access": {
            "Credential Harvesting & Phishing Submission": 0.86,
            "2FA Interception & Vishing Pressure": 0.09,
            "Rogue Device Login & Account Takeover": 0.05,
        },
        "Credential Harvesting & Phishing Submission": {
            "Rogue Device Login & Account Takeover": 0.54,
            "2FA Interception & Vishing Pressure": 0.41,
            "Financial Exfiltration & Fund Draining": 0.05,
        },
        "Rogue Device Login & Account Takeover": {
            "2FA Interception & Vishing Pressure": 0.68,
            "Financial Exfiltration & Fund Draining": 0.30,
            "Attack Contained & Neutralized": 0.02,
        },
        "2FA Interception & Vishing Pressure": {
            "Financial Exfiltration & Fund Draining": 0.88,
            "Rogue Device Login & Account Takeover": 0.10,
            "Attack Contained & Neutralized": 0.02,
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
        "Malicious URL & Typosquatting Access": "Enable Pay-Safe DNS sinkhole, enforce zero-trust link sandbox, and alert user against clicking lookalike domains.",
        "Credential Harvesting & Phishing Submission": "Force immediate password reset on bank portal, invalidate cached browser cookies, and lock NetBanking temporarily.",
        "Rogue Device Login & Account Takeover": "Execute 1-click active session revocation, trigger device fingerprint ban, and enforce multi-factor re-authentication.",
        "2FA Interception & Vishing Pressure": "Activate Call Guard anti-coercion overlay. Warn victim in Hindi & English to NEVER share OTP over voice calls.",
        "Financial Exfiltration & Fund Draining": "CRITICAL EMERGENCY: Issue immediate UPI/IMPS freeze command, notify bank fraud cell, and revoke all authorization tokens.",
        "Attack Contained & Neutralized": "System safe. Audit logs sealed and cryptographic proof preserved for legal reporting.",
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
        if stage_input in self.TRANSITION_MATRIX:
            return stage_input
        return "Initial Recon & Phishing Lure"

    def predict_next(self, current_stage_input: str, observed_events: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        canonical_stage = self.normalize_stage(current_stage_input)
        transitions = self.TRANSITION_MATRIX.get(canonical_stage, {})

        if not transitions:
            predicted_stage = "Attack Contained & Neutralized"
            confidence = 1.0
        else:
            predicted_stage = max(transitions, key=transitions.get)
            confidence = transitions[predicted_stage]

        mitre_info = self.STAGE_MITRE_MAP.get(predicted_stage, ("T1059", "Execution", "Execution"))

        # Build full probability distribution normalized to 100%
        full_distribution = {}
        for s in self.STAGES:
            full_distribution[s] = round(transitions.get(s, 0.0), 3)

        return {
            "current_stage": canonical_stage,
            "predicted_next_stage": predicted_stage,
            "confidence": round(confidence, 3),
            "threat_window": self.THREAT_WINDOWS.get(canonical_stage, "1 - 3 minutes"),
            "stage_probabilities": full_distribution,
            "recommended_mitigation": self.MITIGATIONS.get(predicted_stage, "Monitor security indicators continuously."),
            "mitre_prediction_id": mitre_info[0],
            "mitre_prediction_name": mitre_info[1],
        }

markov_predictor = MarkovPredictor()
