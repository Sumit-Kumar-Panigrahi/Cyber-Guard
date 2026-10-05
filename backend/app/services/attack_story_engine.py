from typing import List, Dict, Any
from app.services.attack_chain_correlator import attack_chain_correlator
from app.services.markov_predictor import markov_predictor

class AttackStoryEngine:
    """
    Simulates the realistic 15-step connected cyber attack story modeled on
    Indian financial cybercrime (SBI YONO KYC lure, lookalike domain, fake NetBanking login,
    Jamtara rogue device login, VoIP vishing call for OTP, Markov correlation & containment).
    """

    STORY_STEPS: List[Dict[str, Any]] = [
        {
            "step_number": 1,
            "title": "Target Reconnaissance & Dark Web Profiling",
            "stage": "Initial Recon & Phishing Lure",
            "severity": "LOW",
            "source": "Dark Web Telemetry",
            "category": "RECON_DATA_BREACH",
            "summary_en": "Attacker acquires leaked mobile number (+91 98765-43210) and full name from a past telecom database breach.",
            "summary_hi": "जालसाज ने पुराने डेटा लीक से पीड़ित का फोन नंबर (+91 98765-43210) और नाम हासिल किया।",
            "attacker_action": "Harvested victim identity and banking affiliation from illicit underground forum.",
            "victim_impact": "Zero visible impact yet; attacker is preparing targeted social engineering lure.",
            "mitre_id": "T1596",
            "mitre_technique": "Search Open Technical Databases",
            "mitre_tactic": "Reconnaissance",
            "human_risk_score": 15,
            "tech_risk_score": 12,
            "speech_text_en": "Step 1: Attacker completes initial reconnaissance from leaked telecom datasets.",
            "speech_text_hi": "पहला चरण: धोखेबाज ने लीक हुए डेटा से पीड़ित की जानकारी एकत्र की।",
            "node": {
                "id": "story-node-1",
                "category": "Target Identity Profiling",
                "source": "Dark Web Intel",
                "stage": "Initial Recon & Phishing Lure",
                "risk_score": 25,
                "confidence": 0.88,
                "indicators": ["DATA_BREACH_MATCH", "PHONE_PROFILED"],
                "evidence": {"target_phone": "+91 98765-43210", "dataset": "2025_Telecom_Dump"},
                "mitre_technique_id": "T1596",
                "mitre_technique_name": "Search Open Technical Databases",
                "mitre_tactic": "Reconnaissance"
            }
        },
        {
            "step_number": 2,
            "title": "Hinglish Spoofed Phishing SMS Dispatched",
            "stage": "Initial Recon & Phishing Lure",
            "severity": "MEDIUM",
            "source": "SMS Gateway",
            "category": "PHISHING_SMS",
            "summary_en": "Attacker sends high-urgency SMS: 'Dear customer your SBI account will be blocked today update your KYC immediately at sbi-kyc-update.online'.",
            "summary_hi": "जालसाज ने नकली एसएमएस भेजा: 'प्रिय ग्राहक, आपका एसबीआई खाता आज बंद हो जाएगा, तुरंत sbi-kyc-update.online पर केवाईसी करें'।",
            "attacker_action": "Dispatched bulk spoofed SMS masquerading as SBI NetBanking notifications using deceptive sender header.",
            "victim_impact": "SMS lands on victim device with urgency trigger designed to provoke panic.",
            "mitre_id": "T1566.002",
            "mitre_technique": "Spearphishing Link",
            "mitre_tactic": "Initial Access",
            "human_risk_score": 48,
            "tech_risk_score": 35,
            "speech_text_en": "Step 2: Attacker delivers deceptive SBI KYC suspension SMS to victim phone.",
            "speech_text_hi": "दूसरा चरण: जालसाज ने बैंक खाता बंद होने का फर्जी एसएमएस भेजा।",
            "node": {
                "id": "story-node-2",
                "category": "Spoofed SBI KYC SMS",
                "source": "SMS Shield",
                "stage": "Initial Recon & Phishing Lure",
                "risk_score": 58,
                "confidence": 0.94,
                "indicators": ["URGENCY_BLOCK_TRIGGER", "SBI_HEADER_SPOOF", "EMBEDDED_SUSPICIOUS_LINK"],
                "evidence": {"sender": "VK-SBIINB", "message_sample": "Dear customer your SBI account will be blocked today..."},
                "mitre_technique_id": "T1566.002",
                "mitre_technique_name": "Spearphishing Link",
                "mitre_tactic": "Initial Access"
            }
        },
        {
            "step_number": 3,
            "title": "Victim Views Urgent Notification",
            "stage": "Initial Recon & Phishing Lure",
            "severity": "MEDIUM",
            "source": "Device Notification",
            "category": "USER_INTERACTION",
            "summary_en": "Victim opens notification on mobile. High psychological stress triggered by fear of account suspension.",
            "summary_hi": "पीड़ित ने फोन पर मैसेज खोला और खाता बंद होने के डर से तनाव में आ गया।",
            "attacker_action": "Exploiting cognitive bias and loss aversion through artificial urgency deadline.",
            "victim_impact": "Victim believes official bank alert has been received.",
            "mitre_id": "T1204",
            "mitre_technique": "User Execution",
            "mitre_tactic": "Execution",
            "human_risk_score": 62,
            "tech_risk_score": 38,
            "speech_text_en": "Step 3: User reads the message and experiences high psychological urgency.",
            "speech_text_hi": "तीसरा चरण: पीड़ित ने मैसेज पढ़ा और खाता ब्लॉक होने की आशंका से घबरा गया।",
            "node": {
                "id": "story-node-3",
                "category": "SMS Notification Interaction",
                "source": "Notification Monitor",
                "stage": "Initial Recon & Phishing Lure",
                "risk_score": 62,
                "confidence": 0.90,
                "indicators": ["NOTIFICATION_OPENED", "HIGH_PANIC_INDEX"],
                "evidence": {"dwell_time_seconds": 14, "screen": "SMS_App"},
                "mitre_technique_id": "T1204",
                "mitre_technique_name": "User Execution",
                "mitre_tactic": "Execution"
            }
        },
        {
            "step_number": 4,
            "title": "Victim Clicks Malicious Link",
            "stage": "Malicious URL & Typosquatting Access",
            "severity": "HIGH",
            "source": "Browser Telemetry",
            "category": "LINK_CLICK",
            "summary_en": "User taps 'http://sbi-kyc-update.online/netbanking/login' in the SMS. Pay-Safe DNS sandbox intercepts connection.",
            "summary_hi": "पीड़ित ने एसएमएस में दिए लिंक पर क्लिक किया। साइबरगार्ड पे-सेफ शील्ड ने कनेक्शन ट्रैक किया।",
            "attacker_action": "Redirected victim traffic towards attacker-controlled spoofed infrastructure.",
            "victim_impact": "Browser navigates to unauthorized landing page outside the official onlinesbi.sbi perimeter.",
            "mitre_id": "T1204.001",
            "mitre_technique": "Malicious Link",
            "mitre_tactic": "Execution",
            "human_risk_score": 74,
            "tech_risk_score": 65,
            "speech_text_en": "Step 4: Victim clicks the suspicious link. Pay-Safe shield activates browser inspection.",
            "speech_text_hi": "चौथा चरण: पीड़ित ने लिंक पर क्लिक किया। पे-सेफ शील्ड ने लिंक की जांच शुरू की।",
            "node": {
                "id": "story-node-4",
                "category": "Pay-Safe URL Click",
                "source": "Pay-Safe Browser",
                "stage": "Malicious URL & Typosquatting Access",
                "risk_score": 75,
                "confidence": 0.98,
                "indicators": ["UNTRUSTED_TLD_ONLINE", "TYPOSQUAT_BRAND_SBI"],
                "evidence": {"url": "http://sbi-kyc-update.online/netbanking/login", "user_agent": "Mobile_Chrome"},
                "mitre_technique_id": "T1204.001",
                "mitre_technique_name": "Malicious Link",
                "mitre_tactic": "Execution"
            }
        },
        {
            "step_number": 5,
            "title": "Typosquatting & Entropy Heuristics Flag Domain",
            "stage": "Malicious URL & Typosquatting Access",
            "severity": "HIGH",
            "source": "URL Detection Engine",
            "category": "DOMAIN_ANALYSIS",
            "summary_en": "Engine flags 'sbi-kyc-update.online': Shannon entropy 3.82, registered 48 hours ago, hosted in Moscow datacenter.",
            "summary_hi": "एआई मॉडल ने डोमेन पकड़ा: यह वेबसाइट सिर्फ 48 घंटे पहले रूस के सर्वर पर बनाई गई थी।",
            "attacker_action": "Operating bulletproof hosted phishing server configured with wildcard TLS certificates.",
            "victim_impact": "Hostile domain identified with 99% accuracy; pre-emptive block recommendation triggered.",
            "mitre_id": "T1584",
            "mitre_technique": "Compromise Infrastructure",
            "mitre_tactic": "Resource Development",
            "human_risk_score": 76,
            "tech_risk_score": 82,
            "speech_text_en": "Step 5: Artificial intelligence confirms fake domain registered 48 hours ago.",
            "speech_text_hi": "पांचवां चरण: सुरक्षा इंजन ने पुष्टि की कि वेबसाइट पूरी तरह फर्जी है।",
            "node": {
                "id": "story-node-5",
                "category": "Fake Banking Domain Flagged",
                "source": "Pay-Safe Intelligence",
                "stage": "Malicious URL & Typosquatting Access",
                "risk_score": 88,
                "confidence": 0.99,
                "indicators": ["NEW_DOMAIN_AGE_2D", "LOOKALIKE_SBI_BRAND", "HIGH_ENTROPY_NAME"],
                "evidence": {"domain": "sbi-kyc-update.online", "ip": "185.220.101.5", "geo": "Moscow, RU"},
                "mitre_technique_id": "T1584",
                "mitre_technique_name": "Compromise Infrastructure",
                "mitre_tactic": "Resource Development"
            }
        },
        {
            "step_number": 6,
            "title": "Cloned NetBanking Login Portal Displayed",
            "stage": "Credential Harvesting & Phishing Submission",
            "severity": "HIGH",
            "source": "Web DOM Inspector",
            "category": "CLONED_PORTAL",
            "summary_en": "Phishing portal renders exact cloned replica of SBI NetBanking with blue banners and official emblem.",
            "summary_hi": "फर्जी पेज पर स्टेट बैंक ऑफ इंडिया का हूबहू लोगो और नेटबैंकिंग लॉगिन बॉक्स दिखाई दिया।",
            "attacker_action": "Serving cloned frontend assets stolen from official portal to deceive victim eye.",
            "victim_impact": "User visual verification bypassed; appearance matches genuine bank experience.",
            "mitre_id": "T1056.003",
            "mitre_technique": "Web Portal Capture",
            "mitre_tactic": "Credential Access",
            "human_risk_score": 80,
            "tech_risk_score": 84,
            "speech_text_en": "Step 6: Cloned NetBanking interface loaded on victim browser.",
            "speech_text_hi": "छठा चरण: पीड़ित की स्क्रीन पर बैंक का नकली लॉगिन पेज खुला।",
            "node": {
                "id": "story-node-6",
                "category": "Cloned NetBanking Page",
                "source": "DOM Analyzer",
                "stage": "Credential Harvesting & Phishing Submission",
                "risk_score": 84,
                "confidence": 0.96,
                "indicators": ["ASSET_CLONING_DETECTED", "PASSWORD_INPUT_PRESENT"],
                "evidence": {"title": "State Bank of India - Online NetBanking", "forms": ["user_login_form"]},
                "mitre_technique_id": "T1056.003",
                "mitre_technique_name": "Web Portal Capture",
                "mitre_tactic": "Credential Access"
            }
        },
        {
            "step_number": 7,
            "title": "Victim Enters NetBanking Username & Password",
            "stage": "Credential Harvesting & Phishing Submission",
            "severity": "CRITICAL",
            "source": "Form Submission Watcher",
            "category": "CREDENTIAL_LEAK",
            "summary_en": "Victim enters username 'sumit_kumar_26' and banking password into the fake portal form.",
            "summary_hi": "पीड़ित ने झांसे में आकर अपना बैंक यूजरनेम और पासवर्ड फर्जी फॉर्म में भर दिया।",
            "attacker_action": "Capturing keystrokes via websocket listener deployed on phishing server.",
            "victim_impact": "Primary authentication factor compromised to adversary.",
            "mitre_id": "T1056",
            "mitre_technique": "Input Capture",
            "mitre_tactic": "Credential Access",
            "human_risk_score": 88,
            "tech_risk_score": 86,
            "speech_text_en": "Step 7: Victim enters banking credentials into phishing form.",
            "speech_text_hi": "सातवां चरण: पीड़ित ने यूजरनेम और पासवर्ड दर्ज कर दिया।",
            "node": {
                "id": "story-node-7",
                "category": "Form Credential Input",
                "source": "Identity Shield",
                "stage": "Credential Harvesting & Phishing Submission",
                "risk_score": 90,
                "confidence": 0.97,
                "indicators": ["CREDENTIAL_TRANSMISSION_CLEARTEXT", "PRIMARY_AUTH_LEAK"],
                "evidence": {"field_types": ["username", "password"], "endpoint": "/api/submit_kyc"},
                "mitre_technique_id": "T1056",
                "mitre_technique_name": "Input Capture",
                "mitre_tactic": "Credential Access"
            }
        },
        {
            "step_number": 8,
            "title": "Attacker Harvests Credentials in Real-time",
            "stage": "Credential Harvesting & Phishing Submission",
            "severity": "CRITICAL",
            "source": "Threat Intel Feed",
            "category": "HARVESTED_DATABASE",
            "summary_en": "Attacker command & control bot instantly logs the plain credentials into a Telegram exfiltration channel.",
            "summary_hi": "जालसाज के बॉट ने पीड़ित का पासवर्ड तुरंत अपने कंट्रोल चैनल पर कॉपी कर लिया।",
            "attacker_action": "Automated exfiltration script relays credentials to fraud syndicate operations center.",
            "victim_impact": "Attacker now holds valid username and password for victim's account.",
            "mitre_id": "T1556",
            "mitre_technique": "Modify Authentication Process",
            "mitre_tactic": "Credential Access",
            "human_risk_score": 89,
            "tech_risk_score": 89,
            "speech_text_en": "Step 8: Attacker C2 server harvests username and password in real time.",
            "speech_text_hi": "आठवां चरण: जालसाज के पास बैंक खाते का सही पासवर्ड पहुंच गया।",
            "node": {
                "id": "story-node-8",
                "category": "Credential Exfiltration to C2",
                "source": "Threat Intel",
                "stage": "Credential Harvesting & Phishing Submission",
                "risk_score": 92,
                "confidence": 0.98,
                "indicators": ["TELEGRAM_BOT_EXFIL", "CREDENTIALS_COMPROMISED"],
                "evidence": {"c2_protocol": "HTTPS_POST", "telegram_bot_id": "681920192"},
                "mitre_technique_id": "T1556",
                "mitre_technique_name": "Modify Authentication Process",
                "mitre_tactic": "Credential Access"
            }
        },
        {
            "step_number": 9,
            "title": "Attacker Initiates Real Login Attempt from Jamtara",
            "stage": "Rogue Device Login & Account Takeover",
            "severity": "CRITICAL",
            "source": "Login Anomaly Detector",
            "category": "UNKNOWN_DEVICE_LOGIN",
            "summary_en": "Attacker uses harvested credentials to initiate authentic login on genuine SBI portal from IP 103.224.182.12 (Jamtara, Jharkhand).",
            "summary_hi": "धोखेबाज ने जामताड़ा (झारखंड) से असली एसबीआई पोर्टल पर पीड़ित के खाते में लॉगिन किया।",
            "attacker_action": "Initiating live web session using stolen legitimate credentials.",
            "victim_impact": "Account accessed from unapproved geography and brand-new device fingerprint.",
            "mitre_id": "T1078.004",
            "mitre_technique": "Cloud/Web Accounts",
            "mitre_tactic": "Defense Evasion",
            "human_risk_score": 90,
            "tech_risk_score": 94,
            "speech_text_en": "Step 9: Attacker logs into real bank portal from an unrecognized device in Jamtara.",
            "speech_text_hi": "नौवां चरण: जालसाज ने जामताड़ा से नए डिवाइस से खाते में लॉगिन करने की कोशिश की।",
            "node": {
                "id": "story-node-9",
                "category": "Rogue Jamtara Login Attempt",
                "source": "Isolation Forest Anomaly",
                "stage": "Rogue Device Login & Account Takeover",
                "risk_score": 94,
                "confidence": 0.99,
                "indicators": ["NEW_DEVICE_FINGERPRINT", "IMPOSSIBLE_TRAVEL_JAMATARA", "ANOMALOUS_SUBNET"],
                "evidence": {"ip": "103.224.182.12", "location": "Jamtara, Jharkhand", "device": "Linux_Python_Automator"},
                "mitre_technique_id": "T1078.004",
                "mitre_technique_name": "Cloud/Web Accounts",
                "mitre_tactic": "Defense Evasion"
            }
        },
        {
            "step_number": 10,
            "title": "Bank Dispatches 2FA High-Value Login OTP",
            "stage": "2FA Interception & Vishing Pressure",
            "severity": "CRITICAL",
            "source": "SMS / 2FA Engine",
            "category": "OTP_DISPATCH",
            "summary_en": "Genuine SBI Core Banking sends OTP: '582910 is your secret OTP for NetBanking login on unknown device. Never share with anyone.'",
            "summary_hi": "बैंक ने पीड़ित के मोबाइल पर 6 अंकों का गुप्त ओटीपी (582910) भेजा।",
            "attacker_action": "Triggered second-factor authentication; now blocked pending OTP entry.",
            "victim_impact": "Only barrier standing between attacker and complete financial draining is the 6-digit OTP.",
            "mitre_id": "T1539",
            "mitre_technique": "Steal Web Session Cookie",
            "mitre_tactic": "Credential Access",
            "human_risk_score": 92,
            "tech_risk_score": 92,
            "speech_text_en": "Step 10: Bank dispatches genuine OTP to victim phone. Attacker is now blocked by two factor authentication.",
            "speech_text_hi": "दसवां चरण: बैंक ने ओटीपी भेजा। जालसाज अब ओटीपी के बिना आगे नहीं बढ़ सकता।",
            "node": {
                "id": "story-node-10",
                "category": "Bank 2FA OTP Dispatched",
                "source": "2FA Monitor",
                "stage": "2FA Interception & Vishing Pressure",
                "risk_score": 85,
                "confidence": 0.95,
                "indicators": ["GENUINE_BANK_OTP_GENERATED", "HIGH_VALUE_THRESHOLD"],
                "evidence": {"sender": "SBIINB", "content_type": "2FA_LOGIN_OTP"},
                "mitre_technique_id": "T1539",
                "mitre_technique_name": "Steal Web Session Cookie",
                "mitre_tactic": "Credential Access"
            }
        },
        {
            "step_number": 11,
            "title": "Attacker Initiates Spoofed VoIP Vishing Call",
            "stage": "2FA Interception & Vishing Pressure",
            "severity": "CRITICAL",
            "source": "Call Guard Shield",
            "category": "VISHING_CALL",
            "summary_en": "Victim's phone rings. Caller ID spoofed as '+91 22 2274 0000' (SBI Corporate Centre Mumbai). Attacker poses as Chief Security Officer.",
            "summary_hi": "पीड़ित के फोन पर कॉल आई। कॉलर आईडी पर एसबीआई मुख्यालय मुंबई का नंबर दिख रहा था।",
            "attacker_action": "VoIP SIP gateway spoofing bank official number to deceive truecaller and caller ID.",
            "victim_impact": "Victim answers call believing senior bank authority is reaching out.",
            "mitre_id": "T1566.004",
            "mitre_technique": "Spearphishing Voice",
            "mitre_tactic": "Initial Access",
            "human_risk_score": 95,
            "tech_risk_score": 90,
            "speech_text_en": "Step 11: Attacker calls victim phone, spoofing official SBI branch manager caller ID.",
            "speech_text_hi": "ग्यारहवां चरण: जालसाज ने बैंक मैनेजर बनकर पीड़ित को फोन किया।",
            "node": {
                "id": "story-node-11",
                "category": "Spoofed SBI Manager Vishing Call",
                "source": "Call Guard Audio",
                "stage": "2FA Interception & Vishing Pressure",
                "risk_score": 95,
                "confidence": 0.98,
                "indicators": ["CALLER_ID_SPOOFED_BANK", "VOIP_TERMINATION_DETECTED"],
                "evidence": {"display_caller": "+91 22 2274 0000", "impersonated_role": "Branch Manager"},
                "mitre_technique_id": "T1566.004",
                "mitre_technique_name": "Spearphishing Voice",
                "mitre_tactic": "Initial Access"
            }
        },
        {
            "step_number": 12,
            "title": "Call Guard Transcript Detects High Pressure & Coercion",
            "stage": "2FA Interception & Vishing Pressure",
            "severity": "CRITICAL",
            "source": "Call Analyzer Engine",
            "category": "AUDIO_TRANSCRIPT_ANALYSIS",
            "summary_en": "Call Guard analyzes live transcript: 'Turant 6-digit OTP bataiye warna cyber police FIR darj karegi aur account freeze ho jayega'.",
            "summary_hi": "कॉल गार्ड ने बातचीत का विश्लेषण किया: 'तुरंत 6 डिजिट ओटीपी बताइए वरना पुलिस एफआईआर होगी'।",
            "attacker_action": "Aggressive vocal intimidation applying maximum psychological urgency to force OTP reveal.",
            "victim_impact": "Victim is terrified and about to speak the 6-digit code.",
            "mitre_id": "T1621",
            "mitre_technique": "Multi-Factor Authentication Request Generation",
            "mitre_tactic": "Credential Access",
            "human_risk_score": 98,
            "tech_risk_score": 92,
            "speech_text_en": "Step 12: Call Guard detects extreme vocal coercion and urgent OTP extortion.",
            "speech_text_hi": "बारहवां चरण: कॉल गार्ड ने आवाज में धमकी और जबरन ओटीपी मांगने की पुष्टि की।",
            "node": {
                "id": "story-node-12",
                "category": "OTP Coercion Speech Analysis",
                "source": "Call Guard NLP",
                "stage": "2FA Interception & Vishing Pressure",
                "risk_score": 98,
                "confidence": 0.99,
                "indicators": ["OTP_COERCION_TRIGGER", "POLICE_FIR_THREAT", "HIGH_PRESSURE_LANGUAGE"],
                "evidence": {"transcript_match": ["6 digit OTP bataiye", "police FIR hogi", "turant account freeze"]},
                "mitre_technique_id": "T1621",
                "mitre_technique_name": "Multi-Factor Authentication Request Generation",
                "mitre_tactic": "Credential Access"
            }
        },
        {
            "step_number": 13,
            "title": "Victim at Immediate Breach Threshold",
            "stage": "2FA Interception & Vishing Pressure",
            "severity": "CRITICAL",
            "source": "Cognitive Risk Model",
            "category": "BREACH_THRESHOLD",
            "summary_en": "Victim has phone to ear, reading out '5... 8...'. Total financial loss is seconds away.",
            "summary_hi": "पीड़ित ओटीपी बोलने ही वाला था: '5... 8... 2...'। खाता खाली होने में सिर्फ 5 सेकंड बाकी थे।",
            "attacker_action": "Poised with finger on transfer authorization button to execute IMPS wire transfer.",
            "victim_impact": "Extreme imminent financial danger.",
            "mitre_id": "T1499",
            "mitre_technique": "Endpoint Denial of Service",
            "mitre_tactic": "Impact",
            "human_risk_score": 99,
            "tech_risk_score": 95,
            "speech_text_en": "Step 13: Victim is at immediate breach threshold, seconds away from speaking the full OTP.",
            "speech_text_hi": "तेरहवां चरण: पीड़ित ओटीपी बताने ही वाला था। खाता खाली होने में कुछ ही क्षण बाकी थे।",
            "node": {
                "id": "story-node-13",
                "category": "Imminent Breach Threshold",
                "source": "Human Risk Engine",
                "stage": "2FA Interception & Vishing Pressure",
                "risk_score": 99,
                "confidence": 0.99,
                "indicators": ["OTP_PARTIALLY_VOCALIZED", "IMMINENT_TOTAL_DRAIN"],
                "evidence": {"digits_uttered": "58", "remaining_time_seconds": 6},
                "mitre_technique_id": "T1499",
                "mitre_technique_name": "Endpoint Denial of Service",
                "mitre_tactic": "Impact"
            }
        },
        {
            "step_number": 14,
            "title": "Cyberguard NetworkX Correlator & Markov Interception",
            "stage": "Financial Exfiltration & Fund Draining",
            "severity": "CRITICAL",
            "source": "NetworkX DAG & Markov Engine",
            "category": "ATTACK_CORRELATION",
            "summary_en": "Cyberguard connects SMS + Fake URL + Stolen Password + Jamtara Login + Vishing Call into 1 DAG. Markov model predicts 96% probability of ₹2,50,000 exfiltration within 45 seconds!",
            "summary_hi": "साइबरगार्ड ने सभी कड़ियों (एसएमएस + लिंक + पासवर्ड + जामताड़ा लॉगिन + फर्जी कॉल) को जोड़ा। मॉडल ने भविष्यवाणी की: 45 सेकंड में पैसे चोरी होने वाले हैं!",
            "attacker_action": "Attacker's multi-stage kill-chain fully exposed across all 5 operational vectors.",
            "victim_impact": "Cyberguard automated defensive systems engage full pre-emptive lock.",
            "mitre_id": "T1567",
            "mitre_technique": "Exfiltration Over Web Service",
            "mitre_tactic": "Impact",
            "human_risk_score": 98,
            "tech_risk_score": 96,
            "speech_text_en": "Step 14: Cyberguard graph engine connects all five attack vectors into a single unified kill chain, predicting fund transfer.",
            "speech_text_hi": "चौदहवां चरण: साइबरगार्ड ने सभी 5 कड़ियों को जोड़कर पूर्ण हमले की पहचान की।",
            "node": {
                "id": "story-node-14",
                "category": "Unified DAG Attack Correlation",
                "source": "NetworkX & Markov AI",
                "stage": "Financial Exfiltration & Fund Draining",
                "risk_score": 98,
                "confidence": 0.99,
                "indicators": ["FULL_CHAIN_CORRELATED", "PREDICTED_EXFIL_96PCT", "IMMINENT_FINANCIAL_LOSS"],
                "evidence": {"correlated_nodes_count": 5, "predicted_stage": "Financial Exfiltration", "time_window": "45s"},
                "mitre_technique_id": "T1567",
                "mitre_technique_name": "Exfiltration Over Web Service",
                "mitre_tactic": "Impact"
            }
        },
        {
            "step_number": 15,
            "title": "Automated Voice Warning & 1-Click Attack Containment",
            "stage": "Attack Contained & Neutralized",
            "severity": "CONTAINED",
            "source": "Incident Response Engine",
            "category": "ATTACK_CONTAINED",
            "summary_en": "Cyberguard speaks high-volume voice warning in Hindi: 'सावधान! फोन काटें, ओटीपी बिल्कुल न दें!'. 1-Click containment revokes Jamtara session token, blacklists IP 103.224.182.12, and DNS-sinkholes the lookalike domain. Total savings: ₹2,50,000!",
            "summary_hi": "साइबरगार्ड ने जोर से चेतावनी दी: 'सावधान! फोन काटें, ओटीपी बिल्कुल न दें!'। 1-क्लिक कंटेनमेंट ने जामताड़ा का सेशन रद्द किया और फर्जी डोमेन को हमेशा के लिए ब्लॉक कर दिया। 2.5 लाख रुपये बचाए गए!",
            "attacker_action": "Attacker session forcefully terminated; authentication token invalidated; domain sinkholed.",
            "victim_impact": "Total protection achieved. Zero funds lost. Full cryptographic incident report logged.",
            "mitre_id": "M1049",
            "mitre_technique": "Antivirus / Endpoint Isolation",
            "mitre_tactic": "Mitigation",
            "human_risk_score": 0,
            "tech_risk_score": 0,
            "speech_text_en": "Warning! Hang up the phone immediately! Do not share OTP. Cyberguard has terminated the attacker session and blocked the fraudulent login.",
            "speech_text_hi": "सावधान! तुरंत फोन काटें! कोई ओटीपी न बताएं! साइबरगार्ड ने जालसाज का सेशन बंद कर दिया है और आपका खाता पूरी तरह सुरक्षित है।",
            "node": {
                "id": "story-node-15",
                "category": "Attack Chain Contained & Neutralized",
                "source": "Incident Response",
                "stage": "Attack Contained & Neutralized",
                "risk_score": 0,
                "confidence": 1.0,
                "indicators": ["SESSION_REVOKED", "IP_BLACKLISTED", "DOMAIN_SINKHOLED", "FUNDS_PRESERVED_INR_250K"],
                "evidence": {"revoked_session": "sess_8172910a", "blocked_ip": "103.224.182.12", "sinkholed_domain": "sbi-kyc-update.online"},
                "mitre_technique_id": "M1049",
                "mitre_technique_name": "Antivirus / Endpoint Isolation",
                "mitre_tactic": "Mitigation"
            }
        }
    ]

    def get_step_state(self, step_number: int) -> Dict[str, Any]:
        """
        Returns the accumulated NetworkX DAG state, nodes, edges, predictions,
        and explanations up to the specified step (1 through 15).
        """
        step_number = max(1, min(step_number, 15))
        current_step_info = self.STORY_STEPS[step_number - 1]

        # Accumulate events up to current step
        accumulated_events = []
        for i in range(step_number):
            s = self.STORY_STEPS[i]
            accumulated_events.append(s["node"])

        # If step 15 (contained), mark nodes as contained
        is_contained = (step_number == 15)

        # Run correlation on accumulated events
        # If at step 15, we do not need the forward prediction node because the attack is neutralized
        graph_result = attack_chain_correlator.correlate_events(
            accumulated_events,
            include_prediction_node=(not is_contained)
        )

        nodes = graph_result["nodes"]
        edges = graph_result["edges"]

        if is_contained:
            for n in nodes:
                n["is_contained"] = True

        prediction = graph_result["prediction"]
        if is_contained:
            prediction = markov_predictor.predict_next("Attack Contained & Neutralized")

        return {
            "current_step": step_number,
            "total_steps": 15,
            "is_completed": (step_number == 15),
            "step_detail": {
                "step_number": current_step_info["step_number"],
                "total_steps": 15,
                "title": current_step_info["title"],
                "stage": current_step_info["stage"],
                "severity": current_step_info["severity"],
                "summary_en": current_step_info["summary_en"],
                "summary_hi": current_step_info["summary_hi"],
                "attacker_action": current_step_info["attacker_action"],
                "victim_impact": current_step_info["victim_impact"],
                "mitre_id": current_step_info["mitre_id"],
                "mitre_technique": current_step_info["mitre_technique"],
                "mitre_tactic": current_step_info["mitre_tactic"],
                "speech_text_en": current_step_info["speech_text_en"],
                "speech_text_hi": current_step_info["speech_text_hi"],
                "human_risk_score": current_step_info["human_risk_score"],
                "tech_risk_score": current_step_info["tech_risk_score"],
                "node_id": current_step_info["node"]["id"],
                "source": current_step_info["source"]
            },
            "nodes": nodes,
            "edges": edges,
            "prediction": prediction,
            "overall_human_risk": 0 if is_contained else current_step_info["human_risk_score"],
            "overall_tech_risk": 0 if is_contained else current_step_info["tech_risk_score"],
            "status": "CONTAINED" if is_contained else ("CRITICAL" if step_number >= 7 else "ACTIVE"),
            "explanation_en": graph_result["explanation_en"] if not is_contained else (
                "ATTACK NEUTRALIZED: Cyberguard successfully contained the 15-step attack chain. "
                "The Jamtara login session has been killed, the rogue IP 103.224.182.12 blacklisted, "
                "and sbi-kyc-update.online sinkholed at DNS. ₹2,50,000 preserved."
            ),
            "explanation_hi": graph_result["explanation_hi"] if not is_contained else (
                "हमला पूरी तरह विफल: साइबरगार्ड ने 15 चरणों के इस बड़े हमले को विफल कर दिया। "
                "जामताड़ा का अनाधिकृत लॉगिन बंद किया गया, फर्जी आईपी और वेबसाइट ब्लॉक कर दी गई। "
                "आपके 2.5 लाख रुपये सुरक्षित बचा लिए गए।"
            ),
        }

attack_story_engine = AttackStoryEngine()
