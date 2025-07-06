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
            
        async def score_lead(self, lead, context=None):
            """Mock ASI-1 Mini lead scoring"""
            # In a real implementation, this would call the ASI-1 Mini API
            await asyncio.sleep(0.5)  # Simulate API call latency
            
            # Intelligent scoring based on multiple factors
            # In reality, ASI-1 Mini would use sophisticated analysis
            
            # Extract lead attributes
            industry = lead.get("industry", "").lower()
            employees = lead.get("employees", 0)
            funding = lead.get("funding", "")
            growth = lead.get("growth", "")
            alignment_score = lead.get("alignment", {}).get("score", 0.5)
            
            # Base score is influenced by alignment
            base_score = alignment_score * 50
            
            # Company size factor (0-20)
            size_score = min(20, employees / 10)
            
            # Funding stage factor (0-15)
            funding_map = {"Seed": 5, "Series A": 10, "Series B": 12, "Series C": 15}
            funding_score = funding_map.get(funding, 0)
            
            # Growth factor (0-15)
            growth_score = 0
            if "x" in growth:
                try:
                    multiplier = float(growth.split("x")[0])
                    growth_score = min(15, multiplier * 5)
                except ValueError:
                    growth_score = 5
            elif "%" in growth:
                try:
                    percentage = float(growth.split("%")[0])
                    growth_score = min(15, percentage / 10)
                except ValueError:
                    growth_score = 5
            
            # Calculate total score (0-100)
            total_score = base_score + size_score + funding_score + growth_score
            total_score = min(100, max(0, total_score))  # Ensure between 0-100
            
            # Calculate price based on score
            price = total_score * 10  # $10 per point
            
            # Generate reasoning
            factors = [
                f"Alignment with sales spec: {alignment_score:.2f} ({base_score:.1f} points)",
                f"Company size: {employees} employees ({size_score:.1f} points)",
                f"Funding stage: {funding} ({funding_score:.1f} points)",
                f"Growth rate: {growth} ({growth_score:.1f} points)"
            ]
            
            reasoning = "\n".join(factors)
            
            return {
                "score": total_score,
                "price": price,
                "reasoning": reasoning,
                "factors": factors
            }

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ScoringAgent")

# Define message models
class FilteredLeadMessage(Model):
    """Message containing filtered leads with alignment scores"""
    leads: list
    metadata: dict
    alignment_results: dict

class ScoredLeadMessage(Model):
    """Message containing scored leads"""
    leads: list
    metadata: dict
    alignment_results: dict
    scoring_results: dict

# Create the agent
agent = Agent(
    name="ScoringAgent",
    port=8003,
    seed="scoring_agent_unique_seed_phrase",
    endpoint=["http://127.0.0.1:8003/submit"],
)

# Define the summary agent address that we'll send scored leads to
SUMMARY_AGENT_ADDRESS = "agent1qf9d0nkpvr2gvj4qwj0p2hnnsm83wq7z0vt7dxnrxnlx3z2xqf6j7qyxdh"

# Initialize ASI-1 Mini client
asi1_client = ASI1MiniClient(api_key=os.getenv("ASI1_API_KEY"))

@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    logger.info("Scoring Agent started successfully")
    
    # Register the agent with ASI:One and Agentverse.ai
    registration_helper = get_registration_helper()
    registration_info = registration_helper.register_agent(
        agent_name="Lead Generation Scoring Agent",
        agent_address=agent.address,
        agent_type="scoring",
        capabilities=["lead_scoring", "price_calculation", "asi1_mini_integration"],
        description="Scoring agent that evaluates leads based on multiple factors using ASI-1 Mini",
        protocols=["http"]
    )
    
    logger.info(f"Agent registered with ASI:One and Agentverse.ai: {agent.address}")
    ctx.storage.set("registration_info", registration_info)

@agent.on_message(model=FilteredLeadMessage)
async def handle_filtered_leads(ctx: Context, sender: str, msg: FilteredLeadMessage):
    """Handle incoming filtered leads from alignment agent"""
    logger.info(f"Received {len(msg.leads)} filtered leads from {sender}")
    
    # Process each lead with ASI-1 Mini for scoring
    scoring_results = {}
    
    for lead in msg.leads:
        company_name = lead.get("company_name", "Unknown")
        logger.info(f"Scoring lead: {company_name}")
        
        # Get context from previous agents
        context = {
            "sales_spec": msg.metadata.get("sales_spec", ""),
            "alignment": msg.alignment_results.get(company_name, {})
        }
        
        # Use ASI-1 Mini to score the lead
        score_data = await asi1_client.score_lead(lead, context)
        
        # Add scoring data to the lead
        lead["scoring"] = score_data
        scoring_results[company_name] = score_data
        
        logger.info(f"Lead {company_name} scored {score_data['score']:.1f}/100 with price ${score_data['price']:.2f}")
    
    # Sort leads by score (highest first)
    msg.leads.sort(key=lambda x: x.get("scoring", {}).get("score", 0), reverse=True)
    
    # Prepare metadata for next agent
    metadata = msg.metadata.copy()
    metadata.update({
        "source": "scoring_agent",
        "timestamp": datetime.now().isoformat(),
        "lead_count": len(msg.leads)
    })
    
    # Send scored leads to summary agent
    if msg.leads:
        scored_msg = ScoredLeadMessage(
            leads=msg.leads,
            metadata=metadata,
            alignment_results=msg.alignment_results,
            scoring_results=scoring_results
        )
        logger.info(f"Sending {len(msg.leads)} scored leads to summary agent")
        await ctx.send(SUMMARY_AGENT_ADDRESS, scored_msg)
    else:
        logger.warning("No leads to send to summary agent")

if __name__ == "__main__":
    agent.run()
