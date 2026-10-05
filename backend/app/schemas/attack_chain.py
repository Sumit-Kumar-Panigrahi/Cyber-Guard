from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class AttackChainEdgeOut(BaseModel):
    id: str
    source: str  # source event id
    target: str  # target event id
    relation_type: str
    confidence: float
    is_predicted: bool = False

class AttackChainNodeOut(BaseModel):
    id: str
    title: str
    source: str
    category: str
    stage: str
    risk_score: int
    confidence: float
    timestamp: str
    mitre_technique_id: Optional[str] = None
    mitre_technique_name: Optional[str] = None
    mitre_tactic: Optional[str] = None
    indicators: List[str] = []
    evidence: Dict[str, Any] = {}
    is_predicted: bool = False
    is_contained: bool = False
    position: Dict[str, float] = {"x": 0, "y": 0}

class MarkovPredictionOut(BaseModel):
    current_stage: str
    predicted_next_stage: str
    confidence: float
    threat_window: str
    stage_probabilities: Dict[str, float]
    recommended_mitigation: str
    mitre_prediction_id: Optional[str] = None
    mitre_prediction_name: Optional[str] = None

class AttackStoryStepOut(BaseModel):
    step_number: int
    total_steps: int
    title: str
    stage: str
    severity: str
    summary_en: str
    summary_hi: str
    attacker_action: str
    victim_impact: str
    mitre_id: str
    mitre_technique: str
    mitre_tactic: str
    speech_text_en: str
    speech_text_hi: str
    human_risk_score: int
    tech_risk_score: int
    node_id: str
    source: str

class AttackStoryStateOut(BaseModel):
    current_step: int
    total_steps: int
    is_completed: bool
    step_detail: AttackStoryStepOut
    nodes: List[AttackChainNodeOut]
    edges: List[AttackChainEdgeOut]
    prediction: MarkovPredictionOut
    overall_human_risk: int
    overall_tech_risk: int
    status: str
    explanation_en: str
    explanation_hi: str

class AttackChainOut(BaseModel):
    id: str
    user_id: str
    title: str
    status: str
    severity: str
    human_risk_score: int
    tech_risk_score: int
    current_stage: str
    predicted_next_stage: str
    prediction_confidence: float
    explanation_en: str
    explanation_hi: str
    nodes: List[AttackChainNodeOut] = []
    edges: List[AttackChainEdgeOut] = []
    prediction: Optional[MarkovPredictionOut] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContainmentRequest(BaseModel):
    chain_id: str
    action_type: str = "REVOKE_SESSION_AND_BLOCK_ORIGIN"
    notes: Optional[str] = "Immediate user-authorized containment of multi-stage attack chain"

class ContainmentResult(BaseModel):
    chain_id: str
    incident_id: str
    status: str
    actions_taken: List[str]
    executed_at: str
    message: str
