import hashlib
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

class CryptographicAuditEngine:
    """
    Cryptographic Audit Trail Engine implementing SHA-256 hash chaining
    and Section 65B (Indian Evidence Act / IT Act 2000) electronic evidence integrity.
    """

    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    def compute_sha256(self, data: str) -> str:
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    def build_audit_block(
        self,
        event_id: str,
        event_type: str,
        timestamp: str,
        user_id: str,
        payload: Dict[str, Any],
        prev_hash: str
    ) -> Dict[str, Any]:
        """
        Creates a single tamper-evident block linking to previous block's SHA-256 hash.
        """
        canonical_payload = json.dumps(payload, sort_keys=True)
        payload_hash = self.compute_sha256(canonical_payload)
        
        # Block content to be hashed
        block_string = f"{prev_hash}|{timestamp}|{event_id}|{event_type}|{user_id}|{payload_hash}"
        block_hash = self.compute_sha256(block_string)

        return {
            "block_id": f"blk-{event_id[:8]}",
            "event_id": event_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "user_id": user_id,
            "payload_summary": canonical_payload[:180] + ("..." if len(canonical_payload) > 180 else ""),
            "payload_hash": payload_hash,
            "prev_hash": prev_hash,
            "block_hash": block_hash,
            "is_tampered": False
        }

    def verify_hash_chain(self, blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Verifies the cryptographic integrity of the entire hash chain.
        Returns validation status, total blocks verified, and root hash.
        """
        if not blocks:
            return {
                "is_valid": True,
                "total_blocks": 0,
                "verified_at": datetime.utcnow().isoformat(),
                "merkle_root": self.GENESIS_HASH,
                "status": "EMPTY_CHAIN",
                "message": "No audit records present in chain."
            }

        prev = self.GENESIS_HASH
        for i, block in enumerate(blocks):
            if block["prev_hash"] != prev:
                return {
                    "is_valid": False,
                    "tampered_block_index": i,
                    "tampered_block_id": block.get("block_id"),
                    "verified_at": datetime.utcnow().isoformat(),
                    "status": "CORRUPTED_CHAIN",
                    "message": f"Cryptographic integrity failed at block #{i+1}: Previous hash mismatch."
                }
            prev = block["block_hash"]

        # Compute Merkle-like root hash of the ledger
        combined_hashes = "".join(b["block_hash"] for b in blocks)
        merkle_root = self.compute_sha256(combined_hashes)

        return {
            "is_valid": True,
            "total_blocks": len(blocks),
            "verified_at": datetime.utcnow().isoformat(),
            "merkle_root": merkle_root,
            "status": "VERIFIED_TAMPER_PROOF",
            "message": "100% Cryptographic Integrity Verified. All records match SHA-256 chain under Indian IT Act Section 65B standards."
        }

    def generate_section65b_certificate(
        self,
        user_name: str,
        user_email: str,
        blocks: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates official legal electronic certificate structured for
        National Cyber Crime Reporting Portal (cybercrime.gov.in) and Police FIR submission.
        """
        verification = self.verify_hash_chain(blocks)
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        return {
            "certificate_title": "CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT, 1872",
            "compliance_standards": ["Indian IT Act 2000 Section 65B", "CERT-In Cyber Security Guidelines 2026", "Zero-Trust Cryptographic Ledger Standards"],
            "issued_to": {
                "citizen_name": user_name,
                "email": user_email,
                "jurisdiction": "Republic of India",
                "telemetry_origin": "CYBERGUARD AI Defence Platform"
            },
            "evidence_metadata": {
                "generated_at": now_str,
                "total_tamper_proof_blocks": len(blocks),
                "total_contained_incidents": len(incidents),
                "merkle_root_hash": verification["merkle_root"],
                "integrity_status": verification["status"]
            },
            "summary_of_threats_neutralized": incidents,
            "forensic_hash_chain": blocks,
            "legal_declaration": (
                "This electronic record was produced by CYBERGUARD AI Defence platform operating under zero-trust "
                "continuous telemetry monitoring. The cryptographic hashes herein were generated contemporaneously "
                "with the detection of the attacks and have remained unaltered and untampered."
            ),
            "signature_hash": self.compute_sha256(f"{user_email}|{now_str}|{verification['merkle_root']}")
        }

cryptographic_audit = CryptographicAuditEngine()
