from uagents import Agent, Context, Model
import asyncio
import json
import logging
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low

# Import agent registration helper
from agent_registration import get_registration_helper

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ScraperAgent")

# Define message models
class SalesSpec(Model):
    """Sales specification from company"""
    company_name: str
    spec: str
    bounty_amount: float

class LeadMessage(Model):
    """Message containing leads to be sent to alignment agent"""
    leads: list
    metadata: dict

# Create the agent
agent = Agent(
    name="ScraperAgent",
    port=8001,
    seed="scraper_agent_unique_seed_phrase",
    endpoint=["http://127.0.0.1:8001/submit"],
)

# Define the alignment agent address that we'll send leads to
ALIGNMENT_AGENT_ADDRESS = "agent1qvzptptr3vsdcqhytwlr4ym6z43mveef3fw4t38dxs6hqtqz27zs9mqpk2"

# Mock data loading function
def load_mock_data():
    """Load mock lead data from JSON file"""
    try:
        with open('mock_data.json', 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        # If file doesn't exist or is invalid, return empty data
        logger.warning("Mock data file not found or invalid. Using default data.")
        # Return some default mock data
        return [
            {
                "company_name": "TechCorp",
                "industry": "fintech",
                "description": "B2B SaaS company offering payment API solutions",
                "employees": 50,
                "funding": "Series A",
                "investors": ["InvestorX", "VentureY"],
                "growth": "2x YoY",
                "website": "techcorp.io",
                "contact": "info@techcorp.io"
            },
            {
                "company_name": "HealthAI",
                "industry": "healthcare",
                "description": "AI diagnostics platform for hospitals",
                "employees": 120,
                "funding": "Series B",
                "investors": ["MedFund", "HealthVentures"],
                "growth": "80% YoY",
                "website": "healthai.com",
                "contact": "contact@healthai.com"
            },
            {
                "company_name": "DataFlow",
                "industry": "data analytics",
                "description": "B2B data pipeline solutions for enterprise",
                "employees": 75,
                "funding": "Series A",
                "investors": ["DataCapital", "InvestorX"],
                "growth": "1.5x YoY",
                "website": "dataflow.tech",
                "contact": "sales@dataflow.tech"
            },
            {
                "company_name": "CloudSecure",
                "industry": "cybersecurity",
                "description": "B2B cloud security platform",
                "employees": 60,
                "funding": "Seed",
                "investors": ["SecureVentures"],
                "growth": "3x YoY",
                "website": "cloudsecure.dev",
                "contact": "hello@cloudsecure.dev"
            },
            {
                "company_name": "FinanceApp",
                "industry": "fintech",
                "description": "Consumer banking application with B2B API",
                "employees": 200,
                "funding": "Series C",
                "investors": ["FinCapital", "VentureY"],
                "growth": "70% YoY",
                "website": "financeapp.com",
                "contact": "partnerships@financeapp.com"
            }
        ]

# For larger data volumes, we could use Gemini 2.5
# This is a placeholder for that functionality
async def process_large_data(data_chunk):
    """Process large data volumes using Gemini 2.5
    
    This is a placeholder for the hackathon. In a real implementation,
    this would use Gemini's API to process large text data.
    """
    # Mock implementation
    logger.info("Processing large data with Gemini 2.5 (simulated)")
    await asyncio.sleep(1)  # Simulate API call
    return data_chunk  # Just return the same data for demo

@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    logger.info("Scraper Agent started successfully")
    ctx.storage.set("is_running", False)
    
    # Register the agent with ASI:One and Agentverse.ai
    registration_helper = get_registration_helper()
    registration_info = registration_helper.register_agent(
        agent_name="Lead Generation Scraper Agent",
        agent_address=agent.address,
        agent_type="scraper",
        capabilities=["lead_scraping", "data_collection", "mock_data_processing"],
        description="Scraper agent that collects lead data for the multi-agent lead generation system",
        protocols=["http"]
    )
    
    logger.info(f"Agent registered with ASI:One and Agentverse.ai: {agent.address}")
    ctx.storage.set("registration_info", registration_info)

@agent.on_message(model=SalesSpec)
async def handle_sales_spec(ctx: Context, sender: str, msg: SalesSpec):
    """Handle incoming sales specification from company"""
    logger.info(f"Received sales spec from {sender}: {msg.spec}")
    
    # Store the sales spec in agent's storage
    ctx.storage.set("sales_spec", msg.dict())
    
    # Log the bounty amount
    logger.info(f"Bounty amount: {msg.bounty_amount}")
    
    # Check if we're already running a scraping job
    if ctx.storage.get("is_running"):
        logger.info("Already processing a scraping job. Ignoring request.")
        return
    
    # Set running flag
    ctx.storage.set("is_running", True)
    
    try:
        # Load mock lead data
        logger.info("Starting lead scraping process")
        leads = load_mock_data()
        
        # For demo purposes, we're using mock data
        # In a real implementation, this would scrape actual data sources
        logger.info(f"Found {len(leads)} potential leads")
        
        # If we had a large dataset, we could use Gemini 2.5
        # leads = await process_large_data(leads)
        
        # Prepare metadata
        metadata = {
            "source": "scraper_agent",
            "timestamp": datetime.now().isoformat(),
            "sales_spec": msg.spec,
            "company_name": msg.company_name
        }
        
        # Send leads to alignment agent
        lead_message = LeadMessage(leads=leads, metadata=metadata)
        logger.info(f"Sending {len(leads)} leads to alignment agent")
        await ctx.send(ALIGNMENT_AGENT_ADDRESS, lead_message)
        
    except Exception as e:
        logger.error(f"Error in scraping process: {str(e)}")
    finally:
        # Reset running flag
        ctx.storage.set("is_running", False)

if __name__ == "__main__":
    agent.run()
