#!/usr/bin/env python3
import os
import logging
from typing import Dict, Any, Optional, List

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AgentRegistration")

class AgentRegistration:
    """Helper class for registering agents on ASI:One and Agentverse.ai"""
    
    def __init__(self):
        self.registered_agents = {}
        logger.info("Agent registration helper initialized")
    
    def register_agent(self, agent_name: str, agent_address: str, agent_type: str, capabilities: List[str], 
                      description: str, protocols: List[str]) -> Dict[str, Any]:
        """
        Register an agent on ASI:One and Agentverse.ai
        
        Args:
            agent_name: Name of the agent
            agent_address: Address of the agent
            agent_type: Type of agent (e.g., 'scraper', 'alignment', 'scoring', 'summary')
            capabilities: List of capabilities the agent has
            description: Description of the agent
            protocols: List of protocols the agent supports
            
        Returns:
            Dictionary with registration information
        """
        logger.info(f"Registering agent {agent_name} with address {agent_address}")
        
        # In a real implementation, this would make API calls to ASI:One and Agentverse.ai
        # For the demo, we'll just log the registration
        
        registration_info = {
            "name": agent_name,
            "address": agent_address,
            "type": agent_type,
            "capabilities": capabilities,
            "description": description,
            "protocols": protocols,
            "registered_at": "2023-07-06T00:00:00Z",  # Mocked timestamp
            "status": "active"
        }
        
        # Store registration info
        self.registered_agents[agent_address] = registration_info
        
        logger.info(f"Agent {agent_name} registered successfully")
        logger.info(f"Agent would be visible on ASI:One and Agentverse.ai")
        
        return registration_info
    
    def update_agent_status(self, agent_address: str, status: str) -> Dict[str, Any]:
        """Update an agent's status"""
        if agent_address not in self.registered_agents:
            logger.error(f"Agent {agent_address} not registered")
            return {}
        
        self.registered_agents[agent_address]["status"] = status
        logger.info(f"Updated agent {agent_address} status to {status}")
        
        return self.registered_agents[agent_address]
    
    def get_agent_info(self, agent_address: str) -> Optional[Dict[str, Any]]:
        """Get information about a registered agent"""
        if agent_address not in self.registered_agents:
            logger.warning(f"Agent {agent_address} not registered")
            return None
        
        return self.registered_agents[agent_address]
    
    def list_registered_agents(self) -> Dict[str, Dict[str, Any]]:
        """List all registered agents"""
        return self.registered_agents

# Singleton instance for easy access
_instance = AgentRegistration()

def get_registration_helper() -> AgentRegistration:
    """Get the agent registration helper instance"""
    return _instance

# Example usage
if __name__ == "__main__":
    # Get registration helper
    registration = get_registration_helper()
    
    # Register a test agent
    agent_info = registration.register_agent(
        agent_name="TestAgent",
        agent_address="agent1q123456789abcdef",
        agent_type="test",
        capabilities=["testing"],
        description="A test agent",
        protocols=["http"]
    )
    
    print(f"Registered agent: {agent_info}")
    
    # List all registered agents
    agents = registration.list_registered_agents()
    print(f"All registered agents: {agents}")
