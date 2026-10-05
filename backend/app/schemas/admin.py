from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class FleetOverviewResponse(BaseModel):
    total_identities: int
    active_chains: int
    critical_threats: int
    contained_incidents: int
    mttc_seconds: float
    zero_trust_compliance_percent: float
    mitre_coverage_percent: float
    total_security_signals: int
    recent_incidents: List[Dict[str, Any]]
    active_chains_summary: List[Dict[str, Any]]
    geo_threat_hotspots: List[Dict[str, Any]]

class IncidentActionRequest(BaseModel):
    action: str = Field(..., description="CONTAIN | RESOLVE | DISMISS | ESCALATE")
    notes: Optional[str] = "SOC Analyst authorized response action"
    admin_name: Optional[str] = "SOC Commander (Level 2)"

class IncidentActionResponse(BaseModel):
    success: bool
    incident_id: str
    status: str
    action_executed: str
    action_target: str
    message: str
    executed_at: str

class IdentityItem(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    status: str
    active_chains_count: int
    total_incidents_count: int
    signals_count: int
    sms_guard: bool
    call_guard: bool
    login_guard: bool
    identity_guard: bool
    created_at: str

class ThreatIntelItem(BaseModel):
    id: str
    indicator_type: str  # DOMAIN | PHONE | IP | APK_HASH | SOCIAL_HANDLE
    indicator_value: str
    threat_actor_or_hub: str  # Jamtara Vishing Node | Mewat Ring | Russian Banking Proxy | Fake SBI Phish
    target_institution: str
    mitre_technique: str
    confidence: float
    status: str  # ACTIVE | SINKHOLED | BLOCKED
    first_detected: str
    total_reports: int

class MitreTechnique(BaseModel):
    id: str
    name: str
    detected_count: int
    status: str
    description: Optional[str] = None
    severity: Optional[str] = "HIGH"

class MitreTacticGroup(BaseModel):
    tactic: str
    tactic_id: str
    description: str
    techniques: List[MitreTechnique]
