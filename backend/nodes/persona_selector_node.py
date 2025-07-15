"""
Persona Selector Node for LLM Persona Routing
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any

from .base_node import BaseNode


logger = logging.getLogger(__name__)


class PersonaSelectorNode(BaseNode):
    """Persona selector node that prepares a system message for the selected persona."""
    
    def __init__(self):
        super().__init__("persona_selector")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare a system message based on the selected persona."""
        
        # Validate input
        self.validate_input(input_data, ["query", "persona"])
        
        persona = input_data["persona"]
        
        self.log_processing_step("Preparing persona system message", f"Persona: {persona}")
        
        # Add processing delay for realism
        await self.simulate_processing_delay(50, 150)
        
        # Validate persona exists (lazy import to avoid circular dependency)
        from services.llm_service import llm_service
        persona_info = llm_service.get_persona_info(persona)
        if not persona_info:
            raise ValueError(f"Unknown persona: {persona}")
            
        # Get the full, combined system message for the persona
        system_message = llm_service.get_full_system_prompt(persona)
        if not system_message:
            # This should not happen if persona_info was found, but as a safeguard:
            raise ValueError(f"Could not construct system message for persona: {persona}")

        self.log_processing_step("Persona system message created", f"Persona: {persona}")
        
        return {
            **input_data,
            "system_message": system_message,
            "selected_persona": {
                "name": persona,
                "info": persona_info
            }
        }
    
    def get_persona_summary(self) -> Dict[str, Any]:
        """Get summary of persona processing"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "Persona validation",
                "LLM provider routing",
                "Context preparation",
                "Response generation"
            ]
        } 