#!/usr/bin/env python3
import asyncio
import logging
import json
import uuid
from typing import List, Dict, Any, Optional

from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low

# Import agent registration helper
from agent_registration import get_registration_helper

# Define message models directly (no dependency on company/orchestrator agent)
class SalesSpec(Model):
    """Sales specification for a company"""
    company_name: str
    spec: str
    bounty_amount: float
    metadata: Dict[str, Any] = {}

class SummaryRequestMessage(Model):
    """Request for lead summaries"""
    request_id: str
    metadata: Dict[str, Any] = {}

class LeadSummaryResponse(Model):
    """Response with lead summaries"""
    summaries: List[Dict[str, Any]]
    metadata: Dict[str, Any] = {}

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("CLIAgent")

# Constants
CLI_AGENT_PORT = 8010  # Different port from company agent

# Create the CLI agent
cli_agent = Agent(
    name="cli",
    port=CLI_AGENT_PORT,
    seed="cli_agent_seed",  # Use a fixed seed for demo purposes
    endpoint=[f"http://localhost:{CLI_AGENT_PORT}/submit"]
    # Almanac registration is handled through agent_registration helper
)

# Define agent addresses directly
# These are the addresses of the specialized agents
# Using the actual addresses from the agent files
SCRAPER_AGENT_ADDRESS = "agent1qvzptptr3vsdcqhytwlr4ym6z43mveef3fw4t38dxs6hqtqz27zs9mqpk2"
ALIGNMENT_AGENT_ADDRESS = "agent1qvzptptr3vsdcqhytwlr4ym6z43mveef3fw4t38dxs6hqtqz27zs9mqpk2"
SCORING_AGENT_ADDRESS = "agent1qvzptptr3vsdcqhytwlr4ym6z43mveef3fw4t38dxs6hqtqz27zs9mqpk2"
# We'll get the summary agent address dynamically during startup
SUMMARY_AGENT_ADDRESS = None

# Store for pending requests and responses
pending_requests = {}
received_responses = {}

# Message handler for the CLI agent
@cli_agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    global SUMMARY_AGENT_ADDRESS
    
    logger.info("="*80)
    logger.info("CLI AGENT: STARTING UP")
    logger.info("="*80)
    
    # Fund the agent if needed - no need to await this
    fund_agent_if_low(cli_agent.wallet.address())
    
    # Register the agent with ASI:One and Agentverse.ai
    registration_helper = get_registration_helper()
    registration_info = registration_helper.register_agent(
        agent_name="Lead Generation CLI Agent",
        agent_address=cli_agent.address,
        agent_type="cli_bridge",
        capabilities=["user_interface", "agent_communication", "request_tracking"],
        description="CLI bridge agent that enables direct communication between the CLI and specialized agents",
        protocols=["http"]
    )
    
    logger.info(f"Agent registered with ASI:One and Agentverse.ai: {cli_agent.address}")
    ctx.storage.set("registration_info", registration_info)
    
    # Set the summary agent address
    SUMMARY_AGENT_ADDRESS = "agent1qvzptptr3vsdcqhytwlr4ym6z43mveef3fw4t38dxs6hqtqz27zs9mqpk2"
    logger.info(f"Using summary agent address: {SUMMARY_AGENT_ADDRESS}")
    
    logger.info(f"CLI agent address: {cli_agent.address}")
    logger.info("="*80)

# Handle responses directly from specialized agents
@cli_agent.on_message(model=LeadSummaryResponse)
async def handle_summary_response(ctx: Context, sender: str, msg: LeadSummaryResponse):
    """Handle summary response directly from summary agent"""
    logger.info(f"Received summary response directly from {sender}")
    logger.info(f"Summaries: {len(msg.summaries)}")
    
    # Store the summaries for the CLI to access
    request_id = msg.metadata.get("request_id", "unknown")
    received_responses[request_id] = msg.summaries
    
    logger.info(f"Stored response for request {request_id}")

# Message sender that processes the outgoing message queue
@cli_agent.on_interval(1.0)  # Run every second
async def process_outgoing_messages(ctx: Context):
    """Process any queued outgoing messages"""
    global outgoing_messages
    
    if not outgoing_messages:
        return
    
    # Get the next message to send
    message_data = outgoing_messages.pop(0)
    destination = message_data["destination"]
    message = message_data["message"]
    message_type = message_data["type"]
    
    # Send the message
    try:
        logger.info(f"Sending {message_type} to {destination}")
        await ctx.send(destination, message)
        logger.info(f"Message sent successfully")
    except Exception as e:
        logger.error(f"Failed to send message: {str(e)}")
        # Put the message back in the queue to retry
        outgoing_messages.append(message_data)

# Queue for outgoing messages
outgoing_messages = []

# External API for the CLI to use
async def send_sales_spec(company_name: str, spec: str, bounty_amount: float) -> str:
    """Queue a sales specification to be sent to the scraper agent"""
    global outgoing_messages
    
    # Generate a request ID
    request_id = str(uuid.uuid4())
    
    # Create sales spec message with metadata
    sales_spec = SalesSpec(
        company_name=company_name,
        spec=spec,
        bounty_amount=bounty_amount,
        metadata={
            "request_id": request_id,
            "requester": cli_agent.address
        }
    )
    
    # Store the request
    pending_requests[request_id] = {
        "type": "sales_spec",
        "data": sales_spec.dict(),
        "status": "pending"
    }
    
    # Queue the message to be sent by the message_sender handler
    outgoing_messages.append({
        "destination": SCRAPER_AGENT_ADDRESS,
        "message": sales_spec,
        "type": "sales_spec"
    })
    
    logger.info(f"Queued sales spec for sending to scraper agent: {spec}")
    logger.info(f"Request ID: {request_id}")
    
    return request_id

async def request_lead_summaries() -> str:
    """Queue a lead summary request to be sent to the summary agent"""
    global outgoing_messages
    
    # Generate a request ID
    request_id = str(uuid.uuid4())
    
    # Create summary request message with metadata
    summary_request = SummaryRequestMessage(
        request_id=request_id,
        metadata={
            "request_id": request_id,
            "requester": cli_agent.address
        }
    )
    
    # Store the request
    pending_requests[request_id] = {
        "type": "summary_request",
        "data": {"request_id": request_id},
        "status": "pending"
    }
    
    # Queue the message to be sent by the message_sender handler
    outgoing_messages.append({
        "destination": SUMMARY_AGENT_ADDRESS,
        "message": summary_request,
        "type": "summary_request"
    })
    
    logger.info(f"Queued summary request for sending to summary agent: {request_id}")
    
    return request_id

async def get_response(request_id: str, timeout: int = 10) -> Optional[Any]:
    """Wait for and return a response for the given request ID"""
    start_time = asyncio.get_event_loop().time()
    
    while (asyncio.get_event_loop().time() - start_time) < timeout:
        if request_id in received_responses:
            response = received_responses[request_id]
            # Clean up
            del received_responses[request_id]
            if request_id in pending_requests:
                del pending_requests[request_id]
            return response
        
        # Wait a bit before checking again
        await asyncio.sleep(0.5)
    
    # Timeout reached
    logger.warning(f"Timeout waiting for response to request {request_id}")
    if request_id in pending_requests:
        pending_requests[request_id]["status"] = "timeout"
    
    return None

# Function to get the CLI agent instance
def get_cli_agent():
    return cli_agent

if __name__ == "__main__":
    # Start the CLI agent if this file is run directly
    cli_agent.run()
