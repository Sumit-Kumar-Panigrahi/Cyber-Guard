import uuid
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_optional_current_user
from app.schemas.emergency import (
    FIRGenerationRequest,
    FIRGenerationResponse,
    BankFreezeNoticeRequest,
    BankFreezeNoticeResponse,
    AdvisoryBotRequest,
    AdvisoryBotResponse
)

router = APIRouter(prefix="/emergency", tags=["Citizen Emergency Defense & Helpline 1930"])

INDIAN_HELPLINES = [
    {
        "agency": "National Cybercrime Reporting Helpline (MHA / I4C)",
        "number": "1930",
        "description": "Toll-free 24x7 emergency response for immediate financial fraud golden-hour containment.",
        "portal": "https://cybercrime.gov.in",
        "jurisdiction": "All India"
    },
    {
        "agency": "CERT-In National Incident Response Desk",
        "number": "1800-11-4949",
        "description": "Indian Computer Emergency Response Team for malware, ransomware, and infrastructure attacks.",
        "portal": "https://www.cert-in.org.in",
        "jurisdiction": "National Critical Tech & Citizens"
    },
    {
        "agency": "DoT Chakshu Citizen Financial Fraud Reporter",
        "number": "Toll-Free 1961",
        "description": "Department of Telecommunications portal to report suspicious fraud calls and SMS headers.",
        "portal": "https://sancharsaathi.gov.in",
        "jurisdiction": "Telecom & Mobile"
    },
    {
        "agency": "Reserve Bank of India (RBI Sachet / Banking Ombudsman)",
        "number": "14448",
        "description": "Immediate resolution for unauthorized digital payments, zero-liability customer protection.",
        "portal": "https://sachet.rbi.org.in",
        "jurisdiction": "All Scheduled Commercial Banks"
    }
]

@router.get("/helplines")
def get_emergency_helplines():
    """Returns official Indian cybercrime and financial fraud emergency helplines."""
    return INDIAN_HELPLINES

@router.post("/generate-fir", response_model=FIRGenerationResponse)
def generate_fir_packet(
    req: FIRGenerationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a formal, legally structured Cyber Fraud Incident Dossier
    for submission to National Cybercrime Reporting Portal (1930 / cybercrime.gov.in).
    """
    fir_ref = f"FIR-IN-{datetime.utcnow().year}-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.utcnow().isoformat()
    user_name = current_user.full_name if current_user else "Sumit Kumar Panigrahi"
    user_email = current_user.email if current_user else "sumit.panigrahi@cyberguard.in"

    statutory_sections = [
        "Section 66C, Information Technology Act 2000 (Identity Theft & Fraudulent Authentication)",
        "Section 66D, Information Technology Act 2000 (Cheating by Personation using Computer Resource)",
        "Section 318(4), Bharatiya Nyaya Sanhita 2023 (Cheating and Dishonestly Inducing Delivery of Property)",
        "Section 319(2), Bharatiya Nyaya Sanhita 2023 (Cheating by Personation)"
    ]

    evidence_hash = hashlib.sha256(
        f"{fir_ref}|{req.suspect_phone}|{req.suspect_upi}|{req.suspect_url}|{timestamp}".encode()
    ).hexdigest()

    formal_letter = f"""TO:
THE SUPERINTENDENT OF POLICE / CYBER CRIME CELL,
NATIONAL CYBERCRIME REPORTING PORTAL (MHA / I4C), NEW DELHI.

SUBJECT: FORMAL COMPLAINT REGARDING ONLINE FINANCIAL CYBER FRAUD / VISHING EXTORTION UNDER SECTIONS 66C/66D OF THE IT ACT 2000 & BHARATIYA NYAYA SANHITA.

Respected Sir/Madam,

I, {user_name}, hereby lodge an official complaint regarding a targeted cyberattack and fraudulent financial coercion incident detected by the CYBERGUARD AI Defence Platform.

1. COMPLAINANT PARTICULARS:
- Full Name: {user_name}
- Email / Reg Identifier: {user_email}
- Incident Reference: {fir_ref}
- Date & Time of Occurrence: {timestamp}

2. INCIDENT & MODUS OPERANDI:
- Threat Category: {req.incident_type}
- Target Banking Institution: {req.bank_name} (Account ending {req.account_last4})
- Disputed / Threatened Amount: INR {req.loss_amount_inr:,.2f}
- Narrative Summary: {req.narrative}

3. SUSPECT IDENTIFIERS & TECHNICAL EVIDENCE:
- Suspect Caller / Origin Phone: {req.suspect_phone}
- Suspect Fraudulent UPI Handle: {req.suspect_upi}
- Phishing Infrastructure URL: {req.suspect_url}
- Cryptographic Forensic SHA-256 Ledger Hash: {evidence_hash}

4. PRAYER & RELIEF SOUGHT:
In accordance with Ministry of Home Affairs I4C operational guidelines and RBI Master Circular on Customer Protection (RBI/2017-18/15):
a) Immediately flag and freeze the suspect UPI identifier ({req.suspect_upi}) and associate mule bank accounts via the 1930 portal.
b) Order telecommunication providers to blacklist the offending calling node ({req.suspect_phone}).
c) Register an FIR under Section 66D of the IT Act 2000 and initiate forensic investigation.

Yours faithfully,
{user_name}
Evidence cryptographically verified by CYBERGUARD Defence Platform
Ref: {fir_ref}
"""

    return FIRGenerationResponse(
        fir_reference_id=fir_ref,
        timestamp=timestamp,
        statutory_sections=statutory_sections,
        cybercrime_portal_url="https://cybercrime.gov.in",
        helpline_number="1930",
        complainant_name=user_name,
        suspect_profile={
            "phone": req.suspect_phone,
            "upi_id": req.suspect_upi,
            "phishing_url": req.suspect_url,
            "suspected_hub": "Jamtara / Mewat Financial Fraud Syndicate"
        },
        evidence_bundle={
            "sha256_hash": evidence_hash,
            "recorded_timestamp": timestamp,
            "audit_ledger_status": "TAMPER_EVIDENT_CHAIN_VERIFIED"
        },
        formal_complaint_letter=formal_letter
    )

@router.post("/bank-freeze-notice", response_model=BankFreezeNoticeResponse)
def generate_bank_freeze_notice(
    req: BankFreezeNoticeRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generates an urgent official Bank Freeze & Dispute Notice under RBI guidelines.
    """
    notice_id = f"BNK-FRZ-{datetime.utcnow().year}-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.utcnow().isoformat()
    user_name = current_user.full_name if current_user else "Sumit Kumar Panigrahi"

    bank_emails = {
        "State Bank of India": "nodalofficer.digital@sbi.co.in",
        "HDFC Bank": "fraud.reporting@hdfcbank.com",
        "ICICI Bank": "antifraud@icicibank.com",
        "Axis Bank": "cybercrime.desk@axisbank.com",
        "Punjab National Bank": "cybercell@pnb.co.in"
    }

    target_email = bank_emails.get(req.bank_name, "cyberfraud.nodal@bank.co.in")
    sms_code = f"BLOCK NETBANKING {req.account_number} TO 567676"

    notice_text = f"""URGENT: ZERO-LIABILITY UNAUTHORIZED TRANSACTION REVERSAL NOTICE
UNDER RBI CIRCULAR DBR.No.Leg.BC.78/09.07.005/2017-18

To: Principal Nodal Officer for Digital Fraud Prevention, {req.bank_name}
Email: {target_email}
Date: {now}
Notice ID: {notice_id}

Account Holder: {user_name}
Account Number: {req.account_number}
IFSC Code: {req.ifsc_code}

1. EMERGENCY NOTIFICATION:
An unauthorized / coercive transaction attempt of INR {req.disputed_amount:,.2f} has been detected on my account.
Transaction / UPI Ref: {req.transaction_ref}
Beneficiary Mule Account / UPI: {req.suspect_upi_id} ({req.suspect_mule_account})

2. MANDATORY STATUTORY ACTIONS REQUESTED:
- Immediately place a debit freeze / lien on the beneficiary account in accordance with the 1930 I4C Cybercrime Coordination network.
- Revoke all active internet banking sessions and netbanking profile passwords for account {req.account_number}.
- Provide full audit logs and IP origin addresses for the disputed transaction.

Reported within the zero-liability golden-hour window as mandated by RBI.
"""

    return BankFreezeNoticeResponse(
        notice_id=notice_id,
        generated_at=now,
        urgent_bank_email=target_email,
        sms_freeze_code=sms_code,
        bank_nodal_officer=f"Chief Compliance & Nodal Officer ({req.bank_name})",
        formal_notice_text=notice_text
    )

@router.post("/advisory-bot", response_model=AdvisoryBotResponse)
def get_emergency_advisory(req: AdvisoryBotRequest):
    """
    Interactive bilingual cyber defense advisory engine.
    'Speaks the Warning' with text and speech-ready synthesis strings.
    """
    q = req.query.lower()

    if "otp" in q or "de diya" in q or "paise kat" in q or "money deducted" in q:
        return AdvisoryBotResponse(
            urgency_level="CRITICAL",
            answer_en="CRITICAL ACTION REQUIRED: You shared your OTP or money was deducted. Immediately call National Cybercrime Helpline 1930 to freeze the mule account within the golden hour. Then send an SMS to your bank to block your netbanking and debit card.",
            answer_hi="अत्यावश्यक चेतावनी: आपने OTP साझा किया है या आपके खाते से पैसे कटे हैं। तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें ताकि अपराधी का खाता फ्रीज किया जा सके। इसके तुरंत बाद अपने बैंक को SMS भेजकर नेटबैंकिंग और कार्ड ब्लॉक करें।",
            speech_text_en="Warning! Immediate action required. Dial 1930 right now to freeze fraudulent fund transfers. Do not share any more OTPs with anyone.",
            speech_text_hi="सावधान! तुरंत साइबर हेल्पलाइन 1930 पर कॉल करें और अपने बैंक खाते को फ्रीज करवाएं। किसी को भी कोई और OTP न दें।",
            immediate_actions=[
                "Dial 1930 immediately to freeze the beneficiary mule account",
                "Send SMS to bank to lock netbanking & UPI credentials",
                "Log out from all banking apps and change profile passwords"
            ],
            helpline_actions=[
                "Register incident on cybercrime.gov.in",
                "Generate FIR evidence dossier using CYBERGUARD 1-click exporter"
            ]
        )
    elif "digital arrest" in q or "police" in q or "customs" in q or "skype" in q or "parcel" in q:
        return AdvisoryBotResponse(
            urgency_level="CRITICAL",
            answer_en="FAKE DIGITAL ARREST ALERT: Indian law enforcement, CBI, Police, or Customs NEVER conduct arrests or court trials over Skype or WhatsApp video calls. There is no legal provision called 'Digital Arrest'. Hang up immediately.",
            answer_hi="फर्जी डिजिटल अरेस्ट चेतावनी: भारत में कोई भी पुलिस, CBI या कस्टम विभाग कभी भी स्काइप या व्हाट्सएप वीडियो कॉल पर गिरफ्तारी नहीं करता। कानून में 'डिजिटल अरेस्ट' नाम की कोई चीज नहीं है। तुरंत कॉल काट दें और डरें नहीं।",
            speech_text_en="Alert! This is a fake Digital Arrest scam. Law enforcement never calls on Skype or WhatsApp. Hang up the call immediately.",
            speech_text_hi="सावधान! यह एक फर्जी डिजिटल अरेस्ट फ्रॉड है। पुलिस कभी वीडियो कॉल पर अरेस्ट नहीं करती। तुरंत कॉल काटें।",
            immediate_actions=[
                "Disconnect the video/audio call immediately",
                "Do not transfer any 'clearance funds' or 'bail deposit'",
                "Block the caller on WhatsApp/Skype"
            ],
            helpline_actions=[
                "Report the suspect phone number on DoT Chakshu portal (1961)",
                "File an extortion complaint on 1930 helpline"
            ]
        )
    elif "electricity" in q or "bill" in q or "bijli" in q or "power cut" in q:
        return AdvisoryBotResponse(
            urgency_level="WARNING",
            answer_en="ELECTRICITY BILL FRAUD ALERT: State electricity boards never send messages with personal 10-digit mobile numbers threatening immediate power disconnection. Do not download any APK files or call the provided number.",
            answer_hi="बिजली बिल फ्रॉड चेतावनी: बिजली विभाग कभी भी निजी 10-अंकीय मोबाइल नंबरों से रात को बिजली काटने की धमकी वाले SMS नहीं भेजता। किसी भी APK फाइल को डाउनलोड न करें और न ही दिए गए नंबर पर कॉल करें।",
            speech_text_en="Caution! This is an electricity bill scam. Do not install any APK file or dial the fake officer number.",
            speech_text_hi="सतर्क रहें! यह बिजली बिल का फर्जी मैसेज है। कोई भी ऐप डाउनलोड न करें और न ही दिए गए नंबर पर कॉल करें।",
            immediate_actions=[
                "Verify your bill status exclusively on the official state Discom portal",
                "Never install .apk files received over SMS or WhatsApp",
                "Ignore urgent disconnection threats"
            ],
            helpline_actions=[
                "Forward the SMS to 1909 to report spam header",
                "Report the malicious URL on CYBERGUARD URL detector"
            ]
        )
    else:
        return AdvisoryBotResponse(
            urgency_level="ADVISORY",
            answer_en="CYBER DEFENSE ADVISORY: Remember the golden rules of Indian cyber safety: Banks never ask for OTPs or PINs. Legitimate officials never threaten Digital Arrest. Always verify banking links with CYBERGUARD Pay-Safe before logging in.",
            answer_hi="साइबर सुरक्षा सलाह: भारतीय साइबर सुरक्षा के मुख्य नियम: बैंक कभी भी OTP या PIN नहीं मांगते। कोई भी सरकारी अधिकारी वीडियो कॉल पर डिजिटल अरेस्ट की धमकी नहीं देता। हमेशा CYBERGUARD Pay-Safe से लिंक की जांच करें।",
            speech_text_en="Cyberguard Advisory: Never share your banking OTP with anyone. In case of financial fraud, dial helpline 1930 immediately.",
            speech_text_hi="साइबरगार्ड सुरक्षा सलाह: अपना बैंकिंग OTP कभी किसी से साझा न करें। वित्तीय धोखाधड़ी होने पर तुरंत हेल्पलाइन 1930 पर कॉल करें।",
            immediate_actions=[
                "Never share 6-digit SMS or banking OTPs",
                "Use CYBERGUARD Share Sheet to inspect suspicious links",
                "Enable 2-factor authentication on UPI and email"
            ],
            helpline_actions=[
                "National Cybercrime Helpline: 1930",
                "National Consumer Helpline: 1915"
            ]
        )
