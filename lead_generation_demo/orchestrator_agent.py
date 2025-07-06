#!/usr/bin/env python3
import asyncio
import logging
from typing import List, Dict, Any

from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("OrchestratorAgent")

# Constants
ORCHESTRATOR_AGENT_PORT = 8000

# Define message models
class SalesSpec(Model):
    """Sales specification from company"""
    company_name: str
    spec: str
    bounty_amount: float

class LeadSummaryResponse(Model):
    """Response containing lead summaries"""
    summaries: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class SummaryRequestMessage(Model):
    """Request for lead summaries"""
    request_id: str

# Create the orchestrator agent
orchestrator_agent = Agent(
    name="orchestrator",
    port=ORCHESTRATOR_AGENT_PORT,
    seed="orchestrator_agent_seed",  # Use a fixed seed for demo purposes
    endpoint=[f"http://localhost:{ORCHESTRATOR_AGENT_PORT}/submit"],
    # Enable Almanac registration for remote agent discovery
    enable_registration=True
)

# Define the scraper agent address that we'll send sales spec to
SCRAPER_AGENT_ADDRESS = "agent1qvzpt2ydrcxgpp8jnj6zy7zusl4qwcgq4pjnhe7use3mwzmtdcvgqnj9wj3"
ALIGNMENT_AGENT_ADDRESS = "agent1qwrxcxjdxphz6lytpvdt4rqh7ywmghp3fdpv2kqvj0vn0l3nrw5gqgm5hgz"
SCORING_AGENT_ADDRESS = "agent1qfkpy9qk6mh8mnqvtpk7kvvh94rjdhkxs3e7r0y4u0jnvjjyw2vqqgxdkqz"
SUMMARY_AGENT_ADDRESS = "agent1qwzwlp5q0000gn_demo_summary"

# Export orchestrator agent address for CLI
ORCHESTRATOR_AGENT_ADDRESS = orchestrator_agent.address

# Function to get the orchestrator agent instance
def get_orchestrator_agent():
    return orchestrator_agent

# Function to get agent addresses
def get_agent_addresses():
    return {
        "scraper": SCRAPER_AGENT_ADDRESS,
        "summary": SUMMARY_AGENT_ADDRESS
    }

# Message handler to receive responses
@orchestrator_agent.on_message(model=LeadSummaryResponse)
async def handle_summary_response(ctx: Context, sender: str, msg: LeadSummaryResponse):
    """Handle summary response from summary agent"""
    logger.info(f"Received summary response from {sender}")
    logger.info(f"Summaries: {len(msg.summaries)}")
    
    # Store the summaries for monitoring purposes
    ctx.storage.set("lead_summaries", msg.summaries)
    
    # Forward to CLI bridge agent if it was the original requester
    if msg.metadata and "requester" in msg.metadata:
        requester = msg.metadata["requester"]
        logger.info(f"Forwarding summary response to original requester: {requester}")
        await ctx.send(requester, msg)

# Message handler for the orchestrator agent
@orchestrator_agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    logger.info("="*80)
    logger.info("ORCHESTRATOR AGENT: STARTING UP")
    logger.info("="*80)
    
    # Fund the agent if needed - no need to await this
    fund_agent_if_low(orchestrator_agent.wallet.address())
    
    # Log agent addresses for reference
    logger.info(f"Orchestrator agent address: {orchestrator_agent.address}")
    logger.info(f"Scraper agent address: {SCRAPER_AGENT_ADDRESS}")
    logger.info(f"Alignment agent address: {ALIGNMENT_AGENT_ADDRESS}")
    logger.info(f"Scoring agent address: {SCORING_AGENT_ADDRESS}")
    logger.info(f"Summary agent address: {SUMMARY_AGENT_ADDRESS}")
    logger.info("="*80)

# REST endpoints for CLI to communicate with the orchestrator agent
@orchestrator_agent.on_query("/submit", decode_bytes=True)
async def handle_submit(ctx: Context, sender: str, data: Dict[str, Any]):
    """Handle envelope submission from CLI"""
    logger.info(f"Received envelope from {sender}")
    logger.info(f"Envelope data: {data}")
    
    try:
        # For demo purposes, just extract the payload and process it
        # In a real implementation, we would verify the signature
        import base64
        import json
        
        # Decode the payload
        payload_base64 = data.get('payload', '')
        payload_json = base64.b64decode(payload_base64).decode('utf-8')
        payload = json.loads(payload_json)
        
        logger.info(f"Decoded payload: {payload}")
        
        # Process the payload based on the schema
        schema = data.get('schema_digest', '')
        
        if schema == 'sales_spec':
            # Forward to scraper agent directly
            await process_sales_spec(ctx, payload, sender=data.get('sender'))
            return {"status": "success", "message": "Sales spec received and processing started"}
        
        elif schema == 'summary_request':
            # Forward to summary agent directly
            await request_lead_summaries(ctx, payload, sender=data.get('sender'))
            return {"status": "success", "message": "Summary request received and processing started"}
        
        else:
            logger.warning(f"Unknown schema: {schema}")
            return {"status": "error", "message": f"Unknown schema: {schema}"}
    
    except Exception as e:
        logger.error(f"Error processing envelope: {e}")
        return {"status": "error", "message": f"Failed to process envelope: {str(e)}"}

if __name__ == "__main__":
    # Start the orchestrator agent if this file is run directly
    orchestrator_agent.run()
