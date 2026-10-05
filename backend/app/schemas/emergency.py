from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FIRGenerationRequest(BaseModel):
    incident_type: str = Field("BANKING_FRAUD", description="BANKING_FRAUD | VISHING_OTP | DIGITAL_ARREST | SEXTORTION")
    suspect_phone: Optional[str] = "+91 91234 56789"
    suspect_upi: Optional[str] = "scam.mule99@ybl"
    suspect_url: Optional[str] = "https://sbi-kyc-update.online/login"
    loss_amount_inr: Optional[float] = 0.0
    bank_name: Optional[str] = "State Bank of India"
    account_last4: Optional[str] = "4921"
    narrative: Optional[str] = "Citizen received fraudulent call impersonating bank manager demanding OTP under duress."

class FIRGenerationResponse(BaseModel):
    fir_reference_id: str
    timestamp: str
    statutory_sections: List[str]
    cybercrime_portal_url: str
    helpline_number: str
    complainant_name: str
    suspect_profile: Dict[str, Any]
    evidence_bundle: Dict[str, Any]
    formal_complaint_letter: str

class BankFreezeNoticeRequest(BaseModel):
    bank_name: str = "State Bank of India"
    account_number: Optional[str] = "39481029384"
    ifsc_code: Optional[str] = "SBIN0001234"
    suspect_mule_account: Optional[str] = "918237465012"
    suspect_upi_id: Optional[str] = "mule.payout@icici"
    disputed_amount: float = 25000.0
    transaction_ref: Optional[str] = "UPI/20260404/99182746"

class BankFreezeNoticeResponse(BaseModel):
    notice_id: str
    generated_at: str
    urgent_bank_email: str
    sms_freeze_code: str
    bank_nodal_officer: str
    formal_notice_text: str

class AdvisoryBotRequest(BaseModel):
    query: str
    language: Optional[str] = "en"  # en | hi | hinglish

class AdvisoryBotResponse(BaseModel):
    answer_en: str
    answer_hi: str
    speech_text_en: str
    speech_text_hi: str
    urgency_level: str  # CRITICAL | WARNING | ADVISORY
    immediate_actions: List[str]
    helpline_actions: List[str]
