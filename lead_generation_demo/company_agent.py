#!/usr/bin/env python3
import asyncio
import logging
from typing import List, Dict, Any

from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("CompanyAgent")

# Constants
COMPANY_AGENT_PORT = 8000

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

# Create the company agent
company_agent = Agent(
    name="company",
    port=COMPANY_AGENT_PORT,
    seed="company_agent_seed",  # Use a fixed seed for demo purposes
    endpoint=[f"http://localhost:{COMPANY_AGENT_PORT}/submit"],
)

# Define the scraper agent address that we'll send sales spec to
SCRAPER_AGENT_ADDRESS = "agent1qvzpt2ydrcxgpp8jnj6zy7zusl4qwcgq4pjnhe7use3mwzmtdcvgqnj9wj3"
ALIGNMENT_AGENT_ADDRESS = "agent1qwrxcxjdxphz6lytpvdt4rqh7ywmghp3fdpv2kqvj0vn0l3nrw5gqgm5hgz"
SCORING_AGENT_ADDRESS = "agent1qfkpy9qk6mh8mnqvtpk7kvvh94rjdhkxs3e7r0y4u0jnvjjyw2vqqgxdkqz"
SUMMARY_AGENT_ADDRESS = "agent1qwzwlp5q0000gn_demo_summary"

# Export company agent address for CLI
COMPANY_AGENT_ADDRESS = company_agent.address

# Function to get the company agent instance
def get_company_agent():
    return company_agent

# Function to get agent addresses
def get_agent_addresses():
    return {
        "scraper": SCRAPER_AGENT_ADDRESS,
        "summary": SUMMARY_AGENT_ADDRESS
    }

# Message handler to receive responses
@company_agent.on_message(model=LeadSummaryResponse)
async def handle_summary_response(ctx: Context, sender: str, msg: LeadSummaryResponse):
    """Handle summary response from summary agent"""
    logger.info(f"Received summary response from {sender}")
    logger.info(f"Summaries: {len(msg.summaries)}")
    
    # Store the summaries for the CLI to access
    ctx.storage.set("lead_summaries", msg.summaries)

# Message handler for the company agent
@company_agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    logger.info("="*80)
    logger.info("COMPANY AGENT: STARTING UP")
    logger.info("="*80)
    
    # Fund the agent if needed - no need to await this
    fund_agent_if_low(company_agent.wallet.address())
    
    # Skip registration for now as it's causing issues
    logger.info(f"Company agent address: {company_agent.address}")
    logger.info("="*80)

# REST endpoints for CLI to communicate with the company agent
@company_agent.on_query(model=SalesSpec)
async def handle_sales_spec(ctx: Context, sender: str, msg: SalesSpec):
    """Handle sales spec from CLI and forward to scraper agent"""
    logger.info(f"Received sales spec from CLI: {msg.spec}")
    logger.info(f"Forwarding sales spec to scraper agent: {msg.spec}")
    await ctx.send(SCRAPER_AGENT_ADDRESS, msg)
    logger.info("Sales spec sent successfully")
    return {"status": "success", "message": "Sales spec sent to scraper agent"}

@company_agent.on_query(model=SummaryRequestMessage)
async def handle_summary_request(ctx: Context, sender: str, msg: SummaryRequestMessage):
    """Handle summary request from CLI and forward to summary agent"""
    logger.info(f"Received summary request from CLI: {msg.request_id}")
    logger.info(f"Forwarding summary request to summary agent: {msg.request_id}")
    await ctx.send(SUMMARY_AGENT_ADDRESS, msg)
    logger.info("Summary request sent successfully")
    return {"status": "success", "message": "Summary request sent to summary agent"}

if __name__ == "__main__":
    # Start the company agent if this file is run directly
    company_agent.run()
