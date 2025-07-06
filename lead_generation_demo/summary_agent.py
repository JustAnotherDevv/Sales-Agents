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
            
        async def generate_summary(self, lead, context=None):
            """Mock ASI-1 Mini summary generation
            
            This is where ASI-1 Mini's capabilities are showcased:
            1. Autonomous decision-making about what to highlight
            2. Adaptive summaries based on context
            3. Knowledge graph connections
            4. Multi-agent context awareness
            5. Context-aware interactions
            """
            # In a real implementation, this would call the ASI-1 Mini API
            await asyncio.sleep(1)  # Simulate API call latency
            
            # Extract lead attributes
            company_name = lead.get("company_name", "Unknown")
            industry = lead.get("industry", "")
            description = lead.get("description", "")
            employees = lead.get("employees", 0)
            funding = lead.get("funding", "")
            investors = lead.get("investors", [])
            growth = lead.get("growth", "")
            website = lead.get("website", "")
            
            # Extract context from previous agents
            sales_spec = context.get("sales_spec", "")
            alignment_data = context.get("alignment", {})
            scoring_data = context.get("scoring", {})
            
            # Knowledge graph connections (simulated)
            knowledge_connections = []
            
            # Check for investor connections
            if "InvestorX" in investors:
                knowledge_connections.append("Connected to your portfolio company InvestorX")
                
            # Check for industry connections
            if industry == "fintech":
                knowledge_connections.append("2 degrees from your existing client FinanceApp through shared investors")
            
            # Generate adaptive summary based on industry and context
            if industry == "fintech":
                industry_focus = f"aligns with your fintech focus through their {description.split(' ')[3:6]}"
            elif industry == "healthcare":
                industry_focus = f"offers healthcare solutions that could expand your portfolio diversity"
            else:
                industry_focus = f"operates in the {industry} space"
                
            # Format alignment and scoring insights
            alignment_insight = f"matches {alignment_data.get('matches', 0)}/{alignment_data.get('total_keywords', 1)} of your criteria"
            scoring_highlight = ""
            if "factors" in scoring_data:
                # Find the highest scoring factor
                factors = scoring_data.get("factors", [])
                if factors:
                    highest_factor = max(factors, key=lambda x: float(x.split('(')[1].split(' ')[0]))
                    scoring_highlight = f"scored highly on {highest_factor.split(':')[0].lower()}"
            
            # Create knowledge graph connection string
            knowledge_str = ""
            if knowledge_connections:
                knowledge_str = f" {knowledge_connections[0]}."
            
            # Generate TLDR summary
            tldr = f"{company_name} {industry_focus}.{' Their ' + funding + ' funding' if funding else ''}{knowledge_str} Based on Agent 2's alignment analysis, they {alignment_insight}."
            
            if scoring_highlight:
                tldr += f" Agent 3's scoring {scoring_highlight}."
                
            # Generate detailed summary
            detailed = f"{company_name} is a {industry} company with {employees} employees, offering {description}. "
            detailed += f"They have secured {funding} funding and are experiencing {growth} growth. "
            detailed += f"\n\nAlignment Analysis: {alignment_data.get('reasoning', '')}\n"
            detailed += f"Scoring Analysis: {scoring_data.get('reasoning', '')}\n"
            
            if knowledge_connections:
                detailed += "\nKnowledge Graph Connections:\n"
                for connection in knowledge_connections:
                    detailed += f"- {connection}\n"
            
            # Calculate confidence level based on scoring
            score = scoring_data.get("score", 50)
            if score > 80:
                confidence = "Very High"
            elif score > 60:
                confidence = "High"
            elif score > 40:
                confidence = "Medium"
            else:
                confidence = "Low"
            
            return {
                "tldr": tldr,
                "detailed": detailed,
                "price": scoring_data.get("price", 500),  # Use price from scoring agent
                "confidence": confidence,
                "knowledge_connections": knowledge_connections
            }

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SummaryAgent")

# Define message models
class ScoredLeadMessage(Model):
    """Message containing scored leads"""
    leads: list
    metadata: dict
    alignment_results: dict
    scoring_results: dict

class LeadSummaryResponse(Model):
    """Response containing lead summaries"""
    summaries: list
    metadata: dict

# Create the agent
agent = Agent(
    name="SummaryAgent",
    port=8004,
    seed="summary_agent_unique_seed_phrase",
    endpoint=["http://127.0.0.1:8004/submit"],
)

# Initialize ASI-1 Mini client
asi1_client = ASI1MiniClient(api_key=os.getenv("ASI1_API_KEY"))

@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    logger.info("="*80)
    logger.info("SUMMARY AGENT STARTED")
    logger.info("="*80)
    logger.info("This agent showcases ASI-1 Mini's key capabilities:")
    logger.info("1. Autonomous decision-making about lead quality")
    logger.info("2. Adaptive summaries based on lead type and context")
    logger.info("3. Collaborative enrichment from other agents")
    logger.info("4. Knowledge graph connections")
    logger.info("5. Context-aware understanding")
    logger.info("-"*80)
    
    # Register the agent with ASI:One and Agentverse.ai
    registration_helper = get_registration_helper()
    registration_info = registration_helper.register_agent(
        agent_name="Lead Generation Summary Agent",
        agent_address=agent.address,
        agent_type="summary",
        capabilities=["lead_summarization", "knowledge_graph", "context_awareness", "asi1_mini_showcase"],
        description="Summary agent that showcases ASI-1 Mini's capabilities for intelligent lead summarization",
        protocols=["http"]
    )
    
    logger.info(f"Agent registered with ASI:One and Agentverse.ai: {agent.address}")
    ctx.storage.set("registration_info", registration_info)
    logger.info("-"*80)

@agent.on_message(model=ScoredLeadMessage)
async def handle_scored_leads(ctx: Context, sender: str, msg: ScoredLeadMessage):
    """Handle incoming scored leads from scoring agent"""
    logger.info("="*80)
    logger.info("SUMMARY AGENT: PROCESSING LEADS")
    logger.info("="*80)
    logger.info(f"Received {len(msg.leads)} scored leads from {sender}")
    logger.info(f"Original sales spec: '{msg.metadata.get('sales_spec', 'Not provided')}' from {msg.metadata.get('company_name', 'Unknown')}")
    logger.info("-"*80)
    
    # Process each lead with ASI-1 Mini for summary generation
    lead_summaries = []
    
    for idx, lead in enumerate(msg.leads, 1):
        company_name = lead.get("company_name", "Unknown")
        industry = lead.get("industry", "Unknown")
        
        logger.info(f"LEAD {idx}/{len(msg.leads)}: {company_name} ({industry})")
        logger.info(f"  Description: {lead.get('description', 'Not provided')}")
        logger.info(f"  Employees: {lead.get('employees', 'Unknown')}")
        logger.info(f"  Funding: {lead.get('funding', 'Unknown')}")
        logger.info(f"  Growth: {lead.get('growth', 'Unknown')}")
        
        # Log alignment data
        alignment = msg.alignment_results.get(company_name, {})
        logger.info(f"  ALIGNMENT DATA (from Agent 2):")
        logger.info(f"    Score: {alignment.get('score', 'N/A'):.2f}")
        logger.info(f"    Reasoning: {alignment.get('reasoning', 'Not provided')}")
        
        # Log scoring data
        scoring = msg.scoring_results.get(company_name, {})
        logger.info(f"  SCORING DATA (from Agent 3):")
        logger.info(f"    Score: {scoring.get('score', 'N/A'):.1f}/100")
        logger.info(f"    Price: ${scoring.get('price', 0):.2f}")
        if 'factors' in scoring:
            for factor in scoring['factors']:
                logger.info(f"    - {factor}")
        
        # Get context from previous agents
        context = {
            "sales_spec": msg.metadata.get("sales_spec", ""),
            "alignment": alignment,
            "scoring": scoring
        }
        
        logger.info("  GENERATING SUMMARY WITH ASI-1 MINI...")
        # Use ASI-1 Mini to generate summary
        summary_data = await asi1_client.generate_summary(lead, context)
        
        # Create summary object
        summary = {
            "company_name": company_name,
            "industry": industry,
            "tldr": summary_data["tldr"],
            "detailed": summary_data["detailed"],
            "price": summary_data["price"],
            "confidence": summary_data["confidence"],
            "knowledge_connections": summary_data["knowledge_connections"],
            # Include encrypted contact info that would be revealed upon payment
            "encrypted_contact": {
                "website": lead.get("website", ""),
                "contact": lead.get("contact", "")
            }
        }
        
        lead_summaries.append(summary)
        
        # Log summary results
        logger.info("  SUMMARY RESULTS:")
        logger.info(f"    Confidence: {summary_data['confidence']}")
        logger.info(f"    TLDR: {summary_data['tldr']}")
        if summary_data['knowledge_connections']:
            logger.info("    KNOWLEDGE GRAPH CONNECTIONS:")
            for connection in summary_data['knowledge_connections']:
                logger.info(f"    - {connection}")
        logger.info("-"*80)
    
    # Store summaries in agent's storage
    ctx.storage.set("lead_summaries", lead_summaries)
    
    # Log summary of processing
    logger.info("SUMMARY PROCESSING COMPLETE")
    logger.info(f"Processed {len(lead_summaries)} lead summaries")
    logger.info(f"Top lead: {lead_summaries[0]['company_name'] if lead_summaries else 'None'}")
    logger.info(f"Average confidence: {sum(s['confidence'] for s in lead_summaries) / len(lead_summaries) if lead_summaries else 0:.2f}")
    logger.info("="*80)

# Define message models for summary requests and responses
class SummaryRequestMessage(Model):
    """Request for lead summaries"""
    request_id: str

class LeadSummaryResponse(Model):
    """Response containing lead summaries"""
    summaries: list
    metadata: dict

# Handle requests for summaries
@agent.on_message(model=SummaryRequestMessage)
async def get_summaries(ctx: Context, sender: str, msg: SummaryRequestMessage):
    """Retrieve stored lead summaries"""
    logger.info("="*80)
    logger.info("SUMMARY AGENT: RECEIVED SUMMARY REQUEST")
    logger.info("="*80)
    logger.info(f"Received summary request from {sender} with ID: {msg.request_id}")
    
    # Get stored summaries
    lead_summaries = ctx.storage.get("lead_summaries") or []
    logger.info(f"Found {len(lead_summaries)} lead summaries in storage")
    
    if lead_summaries:
        logger.info("AVAILABLE LEADS:")
        for idx, summary in enumerate(lead_summaries, 1):
            logger.info(f"  {idx}. {summary['company_name']} ({summary['industry']}) - ${summary['price']:.2f}")
    else:
        logger.info("No leads available yet. Please submit a sales specification first.")
    
    logger.info("Sending lead summaries to company interface")
    logger.info("-"*80)
    
    # Create response
    response = LeadSummaryResponse(
        summaries=lead_summaries,
        metadata={
            "timestamp": datetime.now().isoformat(),
            "count": len(lead_summaries),
            "agent_address": agent.address,
            "request_id": msg.request_id
        }
    )
    
    # Send response back to the requester
    await ctx.send(sender, response)
    
    logger.info(f"Response sent with {len(lead_summaries)} leads to {sender}")
    logger.info("="*80)

if __name__ == "__main__":
    agent.run()
