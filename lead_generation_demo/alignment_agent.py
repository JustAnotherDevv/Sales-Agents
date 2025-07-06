from uagents import Agent, Context, Model
import json
import logging
from datetime import datetime
import os
import asyncio

# Import agent registration helper
from agent_registration import get_registration_helper

# Import for ASI-1 Mini integration
# Note: This is a placeholder for the actual ASI-1 Mini client
try:
    from asi1_mini_client import ASI1MiniClient
except ImportError:
    # Mock ASI-1 Mini client for demo purposes
    class ASI1MiniClient:
        def __init__(self, api_key=None):
            self.api_key = api_key or "mock_api_key"
            
        async def analyze_alignment(self, lead, sales_spec):
            """Mock ASI-1 Mini alignment analysis"""
            # In a real implementation, this would call the ASI-1 Mini API
            await asyncio.sleep(0.5)  # Simulate API call latency
            
            # Simple keyword matching for demo
            # In reality, ASI-1 Mini would do sophisticated semantic matching
            keywords = sales_spec.lower().split()
            description = lead.get("description", "").lower()
            industry = lead.get("industry", "").lower()
            
            # Count matches
            matches = 0
            for keyword in keywords:
                if keyword in description or keyword in industry:
                    matches += 1
            
            # Calculate alignment score (0-1)
            alignment_score = min(1.0, matches / max(1, len(keywords)))
            
            # Generate reasoning
            if alignment_score > 0.7:
                reasoning = f"Strong alignment with {matches} keywords matching the sales spec"
            elif alignment_score > 0.3:
                reasoning = f"Moderate alignment with {matches} keywords matching the sales spec"
            else:
                reasoning = f"Low alignment with only {matches} keywords matching the sales spec"
                
            return {
                "score": alignment_score,
                "reasoning": reasoning,
                "matches": matches,
                "total_keywords": len(keywords)
            }

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AlignmentAgent")

# Define message models
class LeadMessage(Model):
    """Message containing leads"""
    leads: list
    metadata: dict

class FilteredLeadMessage(Model):
    """Message containing filtered leads with alignment scores"""
    leads: list
    metadata: dict
    alignment_results: dict

# Create the agent
agent = Agent(
    name="AlignmentAgent",
    port=8002,
    seed="alignment_agent_unique_seed_phrase",
    endpoint=["http://127.0.0.1:8002/submit"],
)

# Define the scoring agent address that we'll send filtered leads to
SCORING_AGENT_ADDRESS = "agent1qg975tnvpvqpfgj5qz4whtx0qf3v6n3dw2h0lq69y3j8dg3z0fhj9qnx3p"

# Initialize ASI-1 Mini client
asi1_client = ASI1MiniClient(api_key=os.getenv("ASI1_API_KEY"))

@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    logger.info("Alignment Agent started successfully")
    
    # Register the agent with ASI:One and Agentverse.ai
    registration_helper = get_registration_helper()
    registration_info = registration_helper.register_agent(
        agent_name="Lead Generation Alignment Agent",
        agent_address=agent.address,
        agent_type="alignment",
        capabilities=["intent_matching", "lead_filtering", "asi1_mini_integration"],
        description="Alignment agent that filters leads based on sales specifications using ASI-1 Mini",
        protocols=["http"]
    )
    
    logger.info(f"Agent registered with ASI:One and Agentverse.ai: {agent.address}")
    ctx.storage.set("registration_info", registration_info)

@agent.on_message(model=LeadMessage)
async def handle_leads(ctx: Context, sender: str, msg: LeadMessage):
    """Handle incoming leads from scraper agent"""
    logger.info(f"Received {len(msg.leads)} leads from {sender}")
    
    # Extract sales spec from metadata
    sales_spec = msg.metadata.get("sales_spec", "")
    if not sales_spec:
        logger.error("No sales specification found in metadata")
        return
    
    logger.info(f"Analyzing alignment with sales spec: {sales_spec}")
    
    # Process each lead with ASI-1 Mini
    filtered_leads = []
    alignment_results = {}
    
    for lead in msg.leads:
        company_name = lead.get("company_name", "Unknown")
        logger.info(f"Analyzing alignment for {company_name}")
        
        # Use ASI-1 Mini to determine alignment
        alignment = await asi1_client.analyze_alignment(lead, sales_spec)
        
        # Store alignment results
        alignment_results[company_name] = alignment
        
        # Filter leads based on alignment score
        # For demo purposes, we use a threshold of 0.3
        if alignment["score"] >= 0.3:
            # Add alignment data to the lead
            lead["alignment"] = alignment
            filtered_leads.append(lead)
            logger.info(f"Lead {company_name} passed alignment filter with score {alignment['score']}")
        else:
            logger.info(f"Lead {company_name} filtered out with low alignment score {alignment['score']}")
    
    # Prepare metadata for next agent
    metadata = msg.metadata.copy()
    metadata.update({
        "source": "alignment_agent",
        "timestamp": datetime.now().isoformat(),
        "original_lead_count": len(msg.leads),
        "filtered_lead_count": len(filtered_leads)
    })
    
    # Send filtered leads to scoring agent
    if filtered_leads:
        filtered_msg = FilteredLeadMessage(
            leads=filtered_leads,
            metadata=metadata,
            alignment_results=alignment_results
        )
        logger.info(f"Sending {len(filtered_leads)} filtered leads to scoring agent")
        await ctx.send(SCORING_AGENT_ADDRESS, filtered_msg)
    else:
        logger.warning("No leads passed alignment filtering")

if __name__ == "__main__":
    agent.run()
