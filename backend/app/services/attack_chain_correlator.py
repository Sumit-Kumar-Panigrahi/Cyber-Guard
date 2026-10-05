import networkx as nx
from typing import List, Dict, Any, Tuple
from app.services.markov_predictor import markov_predictor
from app.services.bilingual_explainer import bilingual_explainer

class AttackChainCorrelator:
    """
    NetworkX-based Directed Acyclic Graph (DAG) correlation engine that connects
    disparate security events (SMS, Web, Call, Device, OTP) into an explainable attack chain.
    """

    RELATION_MAP = {
        ("SMS", "URL"): "DELIVERED_SUSPICIOUS_LINK",
        ("EMAIL", "URL"): "DELIVERED_SUSPICIOUS_LINK",
        ("WHATSAPP", "URL"): "FORWARDED_MALICIOUS_LINK",
        ("URL", "LOGIN"): "HARVESTED_LOGIN_CREDENTIALS",
        ("URL", "CREDS"): "HARVESTED_LOGIN_CREDENTIALS",
        ("LOGIN", "CALL"): "TRIGGERED_VOIP_VISHING_CALL",
        ("LOGIN", "OTP"): "TRIGGERED_BANK_OTP_DISPATCH",
        ("CALL", "OTP"): "COERCING_VICTIM_FOR_OTP",
        ("OTP", "TRANSFER"): "UNAUTHORIZED_IMPS_EXFILTRATION",
        ("DEVICE", "TRANSFER"): "DEVICE_IMPERSONATION_TRANSFER",
    }

    def correlate_events(
        self,
        events: List[Dict[str, Any]],
        include_prediction_node: bool = True
    ) -> Dict[str, Any]:
        """
        Builds a NetworkX DiGraph from a list of security events, performs topological
        sorting, assigns visual graph coordinates for React Flow, and attaches Markov predictions.
        """
        G = nx.DiGraph()

        if not events:
            return {
                "nodes": [],
                "edges": [],
                "prediction": markov_predictor.predict_next("Initial Recon & Phishing Lure"),
                "human_risk": 0,
                "tech_risk": 0,
                "current_stage": "Initial Recon & Phishing Lure",
                "predicted_next_stage": "Malicious URL & Typosquatting Access",
                "explanation_en": "No active threat signals detected.",
                "explanation_hi": "कोई सक्रिय खतरा नहीं मिला है।",
            }

        # Sort events by timestamp or natural progression
        sorted_events = sorted(events, key=lambda x: str(x.get("timestamp", "")))

        # Add nodes to NetworkX graph
        for idx, evt in enumerate(sorted_events):
            node_id = evt.get("id", f"node-{idx+1}")
            G.add_node(
                node_id,
                title=evt.get("category", f"Threat Signal {idx+1}"),
                source=evt.get("source", "General"),
                category=evt.get("category", "SUSPICIOUS_ACTIVITY"),
                stage=evt.get("stage", "Initial Recon & Phishing Lure"),
                risk_score=evt.get("risk_score", 50),
                confidence=evt.get("confidence", 0.9),
                timestamp=str(evt.get("timestamp", "")),
                mitre_technique_id=evt.get("mitre_technique_id"),
                mitre_technique_name=evt.get("mitre_technique_name"),
                mitre_tactic=evt.get("mitre_tactic"),
                indicators=evt.get("indicators", []),
                evidence=evt.get("evidence", {}),
                is_predicted=False,
                is_contained=False,
            )

        # Establish edges between consecutive and causally related events
        edges_out = []
        for i in range(len(sorted_events) - 1):
            src_evt = sorted_events[i]
            tgt_evt = sorted_events[i + 1]
            src_id = src_evt.get("id", f"node-{i+1}")
            tgt_id = tgt_evt.get("id", f"node-{i+2}")

            src_type = self._classify_event_type(src_evt)
            tgt_type = self._classify_event_type(tgt_evt)
            relation = self.RELATION_MAP.get((src_type, tgt_type), "PROGRESSES_TO_NEXT_STAGE")

            G.add_edge(src_id, tgt_id, relation=relation, confidence=0.95)
            edges_out.append({
                "id": f"e-{src_id}-{tgt_id}",
                "source": src_id,
                "target": tgt_id,
                "relation_type": relation,
                "confidence": 0.95,
                "is_predicted": False,
            })

        # Calculate current stage from last node
        last_evt = sorted_events[-1]
        current_stage = last_evt.get("stage") or self._infer_stage(last_evt)

        # Compute Markov next-stage prediction
        prediction = markov_predictor.predict_next(current_stage, sorted_events)
        predicted_stage = prediction["predicted_next_stage"]
        pred_confidence = prediction["confidence"]

        # Append futuristic 'Predicted Next Step' node to NetworkX graph if requested
        pred_node_id = "node-predicted-next"
        if include_prediction_node and prediction["predicted_next_stage"] != "Attack Contained & Neutralized":
            mitre_id = prediction.get("mitre_prediction_id", "T1567")
            mitre_name = prediction.get("mitre_prediction_name", "Exfiltration")

            G.add_node(
                pred_node_id,
                title=f"PREDICTED: {predicted_stage}",
                source="AI Markov Forecaster",
                category="FORECASTED_NEXT_ATTACK_STEP",
                stage=predicted_stage,
                risk_score=min(100, int(last_evt.get("risk_score", 70) * 1.25)),
                confidence=pred_confidence,
                timestamp="Predicted within " + prediction["threat_window"],
                mitre_technique_id=mitre_id,
                mitre_technique_name=mitre_name,
                mitre_tactic="Predicted Threat Impact",
                indicators=[f"CONFIDENCE_{int(pred_confidence*100)}PCT", "MARKOV_TRANSITION_RISK"],
                evidence={"threat_window": prediction["threat_window"], "recommended_mitigation": prediction["recommended_mitigation"]},
                is_predicted=True,
                is_contained=False,
            )

            last_id = sorted_events[-1].get("id", f"node-{len(sorted_events)}")
            G.add_edge(last_id, pred_node_id, relation="PREDICTED_NEXT_ATTACKER_STEP", confidence=pred_confidence)
            edges_out.append({
                "id": f"e-{last_id}-{pred_node_id}",
                "source": last_id,
                "target": pred_node_id,
                "relation_type": "PREDICTED_NEXT_ATTACKER_STEP",
                "confidence": pred_confidence,
                "is_predicted": True,
            })

        # Calculate coordinates for React Flow (DAG tier layout)
        nodes_out = self._layout_nodes(G, sorted_events, pred_node_id if include_prediction_node else None)

        # Risk aggregation
        human_risk = self._compute_human_risk(sorted_events)
        tech_risk = self._compute_tech_risk(sorted_events)

        # Generate bilingual explanation narrative
        narrative = bilingual_explainer.generate_narrative(
            current_stage=current_stage,
            predicted_stage=predicted_stage,
            confidence=pred_confidence,
            events=sorted_events,
            human_risk=human_risk,
            tech_risk=tech_risk,
            is_contained=False
        )

        return {
            "nodes": nodes_out,
            "edges": edges_out,
            "prediction": prediction,
            "human_risk": human_risk,
            "tech_risk": tech_risk,
            "current_stage": current_stage,
            "predicted_next_stage": predicted_stage,
            "explanation_en": narrative["en"],
            "explanation_hi": narrative["hi"],
            "speech_text_en": narrative["speech_en"],
            "speech_text_hi": narrative["speech_hi"],
        }

    def _classify_event_type(self, evt: Dict[str, Any]) -> str:
        src = (evt.get("source") or "").upper()
        cat = (evt.get("category") or "").upper()
        if "SMS" in src or "SMS" in cat: return "SMS"
        if "URL" in src or "URL" in cat or "LINK" in cat: return "URL"
        if "LOGIN" in src or "LOGIN" in cat or "AUTH" in cat: return "LOGIN"
        if "CALL" in src or "VISHING" in cat or "CALL" in cat: return "CALL"
        if "OTP" in cat or "OTP" in src: return "OTP"
        if "DEVICE" in src or "DEVICE" in cat: return "DEVICE"
        return "GENERAL"

    def _infer_stage(self, evt: Dict[str, Any]) -> str:
        src = (evt.get("source") or "").upper()
        cat = (evt.get("category") or "").upper()
        if "SMS" in src or "SMS" in cat: return "Initial Recon & Phishing Lure"
        if "URL" in src or "URL" in cat: return "Malicious URL & Typosquatting Access"
        if "LOGIN" in cat or "CREDS" in cat: return "Credential Harvesting & Phishing Submission"
        if "CALL" in src or "CALL" in cat or "VISHING" in cat: return "2FA Interception & Vishing Pressure"
        if "DEVICE" in src or "LOGIN" in src: return "Rogue Device Login & Account Takeover"
        return "Initial Recon & Phishing Lure"

    def _layout_nodes(
        self,
        G: nx.DiGraph,
        sorted_events: List[Dict[str, Any]],
        pred_node_id: str = None
    ) -> List[Dict[str, Any]]:
        """
        Positions nodes in a multi-tier horizontal layout for React Flow.
        x spacing = 320px per tier, y staggered to create an aesthetic cyber DAG flow.
        """
        nodes_out = []
        x_step = 340
        base_y = 180

        for i, evt in enumerate(sorted_events):
            n_id = evt.get("id", f"node-{i+1}")
            if not G.has_node(n_id):
                continue
            data = G.nodes[n_id]
            # Stagger vertical positions slightly for visual dynamism
            y_offset = -60 if (i % 2 == 1) else 40
            node_dict = dict(data)
            node_dict["id"] = n_id
            node_dict["position"] = {"x": 50 + (i * x_step), "y": base_y + y_offset}
            nodes_out.append(node_dict)

        # Position the prediction node at the end
        if pred_node_id and G.has_node(pred_node_id):
            pred_data = dict(G.nodes[pred_node_id])
            pred_data["id"] = pred_node_id
            pred_data["position"] = {
                "x": 50 + (len(sorted_events) * x_step),
                "y": base_y - 20
            }
            nodes_out.append(pred_data)

        return nodes_out

    def _compute_human_risk(self, events: List[Dict[str, Any]]) -> int:
        if not events: return 15
        social_events = [e for e in events if any(k in (e.get("category", "") + e.get("source", "")).upper() for k in ["SMS", "CALL", "VISHING", "WHATSAPP", "URGENCY"])]
        if not social_events: return 25
        avg_score = sum(e.get("risk_score", 50) for e in social_events) / len(social_events)
        # Scale with count
        return min(98, int(avg_score * (1 + 0.15 * len(social_events))))

    def _compute_tech_risk(self, events: List[Dict[str, Any]]) -> int:
        if not events: return 10
        tech_events = [e for e in events if any(k in (e.get("category", "") + e.get("source", "")).upper() for k in ["URL", "LOGIN", "DEVICE", "EXFIL", "CREDS", "TYPO"])]
        if not tech_events: return 20
        avg_score = sum(e.get("risk_score", 50) for e in tech_events) / len(tech_events)
        return min(96, int(avg_score * (1 + 0.18 * len(tech_events))))

attack_chain_correlator = AttackChainCorrelator()
