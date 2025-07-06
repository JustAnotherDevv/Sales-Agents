#!/usr/bin/env python3
import asyncio
import json
import logging
import os
import subprocess
import time
from datetime import datetime
from typing import List, Dict, Any

# Import mock services
from mock_services import get_self_auth, get_storage, get_blockchain

# Import company agent models and functions
from company_agent import SalesSpec, SummaryRequestMessage, LeadSummaryResponse

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("RecursiveCLI")

# Initialize mock services
self_auth = get_self_auth()
storage = get_storage()
blockchain = get_blockchain()

async def submit_sales_spec(company_name: str, spec: str, bounty_amount: float):
    """Submit sales specification to the scraper agent"""
    # Start the company agent process if not already running
    ensure_company_agent_running()
    
    # Create sales spec message
    sales_spec = SalesSpec(
        company_name=company_name,
        spec=spec,
        bounty_amount=bounty_amount
    )
    
    # Import here to avoid circular imports
    from company_agent import COMPANY_AGENT_PORT, COMPANY_AGENT_ADDRESS
    import aiohttp
    
    # Send to company agent via REST endpoint
    logger.info(f"Sending sales spec to company agent via REST: {spec}")
    async with aiohttp.ClientSession() as session:
        url = f"http://localhost:{COMPANY_AGENT_PORT}/submit"
        payload = {
            "destination": COMPANY_AGENT_ADDRESS,
            "message": sales_spec.dict(),
            "sender": "cli"
        }
        async with session.post(url, json=payload) as response:
            result = await response.json()
            logger.info(f"Response from company agent: {result}")
    
    # In a real implementation, we would wait for a response
    # For the demo, we'll just wait a bit to simulate processing time
    logger.info("Waiting for agents to process leads...")
    await asyncio.sleep(5)  # Wait for agents to process

def ensure_company_agent_running():
    """Ensure the company agent is running in a separate process"""
    # Check if the company agent is already running
    try:
        # Simple check - try to see if there's a process listening on port 8000
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = s.connect_ex(('127.0.0.1', 8000))
        s.close()
        
        if result == 0:
            # Port is open, agent is likely running
            logger.info("Company agent already running")
            return
    except:
        pass
    
    # Start the company agent in a separate process
    logger.info("Starting company agent process...")
    subprocess.Popen(["python", "company_agent.py"], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE)
    
    # Wait a moment for the agent to start
    logger.info("Waiting for company agent to start...")
    time.sleep(3)
    logger.info("Company agent should be running now")

async def get_lead_summaries():
    """Request lead summaries from summary agent using message"""
    logger.info("Requesting lead summaries from summary agent")
    
    # Ensure company agent is running
    ensure_company_agent_running()
    
    # Import here to avoid circular imports
    from company_agent import COMPANY_AGENT_PORT, COMPANY_AGENT_ADDRESS
    import aiohttp
    
    # Create a request message
    request = SummaryRequestMessage(
        request_id=f"req_{datetime.now().timestamp()}"
    )
    
    # Send to company agent via REST endpoint
    logger.info(f"Sending summary request to company agent via REST")
    async with aiohttp.ClientSession() as session:
        url = f"http://localhost:{COMPANY_AGENT_PORT}/submit"
        payload = {
            "destination": COMPANY_AGENT_ADDRESS,
            "message": request.dict(),
            "sender": "cli"
        }
        async with session.post(url, json=payload) as response:
            result = await response.json()
            logger.info(f"Response from company agent: {result}")
    
    # In a real implementation, we would wait for a response message
    # For the demo, we'll simulate receiving summaries after a short delay
    await asyncio.sleep(2)  # Wait for response
    
    # For demo purposes, let's create some mock summaries
    # In a real implementation, these would come from the summary agent's response
    mock_summaries = storage.get("mock_lead_summaries")
    
    if not mock_summaries:
        logger.warning("No lead summaries available yet")
        return []
    
    logger.info(f"Received {len(mock_summaries)} lead summaries")
    return mock_summaries

async def display_lead_summary(summary):
    """Display a lead summary to the company"""
    print("\n" + "=" * 50)
    print(f"COMPANY: {summary['company_name']} ({summary['industry']})")
    print(f"CONFIDENCE: {summary['confidence']}")
    print(f"PRICE: ${summary['price']:.2f}")
    print("-" * 50)
    print("TLDR SUMMARY:")
    print(summary['tldr'])
    print("-" * 50)
    
    # Ask if user wants to pay to reveal full details
    choice = input("Pay to reveal full details? (y/n): ").strip().lower()
    if choice == 'y':
        # Use mock blockchain for transaction
        user_address = storage.get("user_address", "user_default_address")
        tx_hash = blockchain.create_transaction(user_address, "agent_pool", summary['price'])
        tx = blockchain.get_transaction(tx_hash)
        
        print("\nTransaction successful!")
        print(f"Transaction hash: {tx_hash}")
        print(f"Remaining balance: ${blockchain.get_balance(user_address):.2f}")
        print("-" * 50)
        print("DETAILED SUMMARY:")
        print(summary['detailed'])
        print("-" * 50)
        print("CONTACT INFO:")
        print(f"Website: {summary['encrypted_contact']['website']}")
        print(f"Contact: {summary['encrypted_contact']['contact']}")
    
    print("=" * 50)

async def authenticate():
    """Authenticate user with Self"""
    print("\nAuthenticating with Self...")
    username = input("Enter your username (demo_company): ") or "demo_company"
    password = input("Enter your password (password123): ") or "password123"
    
    user_id = self_auth.authenticate(username, password)
    if user_id:
        print(f"Authentication successful! User ID: {user_id}")
        
        # Store user address for blockchain transactions
        user_address = f"user_{hash(username) % 10000:04d}_address"
        storage.set("user_address", user_address)
        storage.set("current_user_id", user_id)
        
        # Show initial balance
        balance = blockchain.get_balance(user_address)
        print(f"Your wallet balance: ${balance:.2f}")
        return True
    else:
        print("Authentication failed. Please try again.")
        return False

async def submit_spec():
    """Submit sales specification"""
    user_id = storage.get("current_user_id")
    if not user_id:
        print("Please authenticate first.")
        return
    
    # Get company information
    company_name = input("Enter your company name (TechCorp): ") or "TechCorp"
    
    # Store company info
    storage.set(f"company_{user_id}", {
        "name": company_name,
        "created_at": datetime.now().isoformat()
    })
    
    # Get sales specification
    print("\nEnter your sales specification:")
    print("Example: 'Looking for B2B SaaS companies in fintech'")
    spec = input("> ") or "Looking for fintech startups with payment processing solutions"
    
    # Get bounty amount
    bounty_amount = 0
    while bounty_amount <= 0:
        try:
            bounty_input = input("\nEnter bounty amount in USD (5000): $") or "5000"
            bounty_amount = float(bounty_input)
            if bounty_amount <= 0:
                print("Bounty amount must be greater than zero.")
        except ValueError:
            print("Please enter a valid number.")
            
    # Store sales spec
    storage.set(f"sales_spec_{user_id}", {
        "spec": spec,
        "bounty_amount": bounty_amount,
        "timestamp": datetime.now().isoformat()
    })
    
    # Submit sales spec to agents
    print("\nSubmitting your request to the agent network...")
    await submit_sales_spec(company_name, spec, bounty_amount)
    print("Sales specification submitted successfully!")
    
    # Create mock lead summaries for demo purposes
    mock_summaries = [
        {
            "company_name": "PayFast",
            "industry": "fintech",
            "tldr": "PayFast offers innovative payment solutions with recent Series B funding. Their technology aligns with your payment processing focus.",
            "detailed": "PayFast is a rapidly growing fintech company specializing in secure payment processing solutions for small businesses. Their platform integrates with major e-commerce systems and offers competitive transaction fees. Recent expansion into blockchain-based payments shows forward-thinking approach.",
            "price": 1200.00,
            "confidence": 0.87,
            "knowledge_connections": ["Connected to your existing client FinanceApp", "Uses similar technology stack to your portfolio companies"],
            "encrypted_contact": {
                "website": "www.payfast.io",
                "contact": "sarah@payfast.io (Sarah Chen, Business Development)"
            }
        },
        {
            "company_name": "BlockWallet",
            "industry": "fintech",
            "tldr": "BlockWallet is developing next-gen digital wallets with blockchain integration, perfectly matching your digital wallets keyword.",
            "detailed": "BlockWallet combines traditional digital wallet functionality with advanced blockchain features. Their solution allows seamless transitions between fiat and crypto payments while maintaining regulatory compliance. Early traction shows strong product-market fit in the SMB segment.",
            "price": 950.00,
            "confidence": 0.92,
            "knowledge_connections": ["Shares investors with your portfolio company CryptoSecure"],
            "encrypted_contact": {
                "website": "www.blockwallet.com",
                "contact": "michael@blockwallet.com (Michael Rodriguez, CEO)"
            }
        },
        {
            "company_name": "ChainPay",
            "industry": "fintech",
            "tldr": "ChainPay is building blockchain payment infrastructure for businesses, directly relevant to your blockchain keyword.",
            "detailed": "ChainPay provides enterprise-grade blockchain payment infrastructure that enables businesses to accept cryptocurrency payments while receiving fiat settlements. Their solution addresses volatility concerns while providing the benefits of blockchain technology. Currently serving 50+ businesses with growing transaction volume.",
            "price": 1500.00,
            "confidence": 0.89,
            "knowledge_connections": ["Technology complements your existing payment solutions", "Potential strategic partnership opportunity"],
            "encrypted_contact": {
                "website": "www.chainpay.tech",
                "contact": "alex@chainpay.tech (Alex Johnson, Partnerships)"
            }
        }
    ]
    
    storage.set("mock_lead_summaries", mock_summaries)

async def view_summaries():
    """View lead summaries"""
    user_id = storage.get("current_user_id")
    if not user_id:
        print("Please authenticate first.")
        return
    
    # Get lead summaries
    print("\nRetrieving lead summaries...")
    summaries = await get_lead_summaries()
    
    if not summaries:
        print("\nNo leads found matching your criteria. Please submit a sales specification first.")
        return
    
    # Display lead summaries one by one
    print(f"\nFound {len(summaries)} potential leads matching your criteria!")
    
    for i, summary in enumerate(summaries):
        print("\n" + "=" * 50)
        print(f"LEAD {i+1}/{len(summaries)}")
        print(f"COMPANY: {summary['company_name']} ({summary['industry']})")
        print(f"CONFIDENCE: {summary['confidence']}")
        print(f"PRICE: ${summary['price']:.2f}")
        print("-" * 50)
        print("TLDR SUMMARY:")
        print(summary['tldr'])
        print("=" * 50)
        
        # If not the last summary, ask if user wants to continue
        if i < len(summaries) - 1:
            choice = input("\nView next lead? (y/n): ").strip().lower()
            if choice != 'y':
                break

async def purchase_lead():
    """Purchase lead details"""
    user_id = storage.get("current_user_id")
    if not user_id:
        print("Please authenticate first.")
        return
    
    # Get lead summaries
    summaries = await get_lead_summaries()
    
    if not summaries:
        print("\nNo leads found matching your criteria. Please submit a sales specification first.")
        return
    
    # Display available leads
    print("\nAvailable leads:")
    for i, summary in enumerate(summaries):
        print(f"{i+1}. {summary['company_name']} - ${summary['price']:.2f}")
    
    # Ask which lead to purchase
    try:
        choice = int(input("\nEnter lead number to purchase (or 0 to cancel): "))
        if choice == 0:
            return
        if choice < 1 or choice > len(summaries):
            print("Invalid choice.")
            return
        
        summary = summaries[choice-1]
        
        # Use mock blockchain for transaction
        user_address = storage.get("user_address", "user_default_address")
        tx_hash = blockchain.create_transaction(user_address, "agent_pool", summary['price'])
        tx = blockchain.get_transaction(tx_hash)
        
        print("\nTransaction successful!")
        print(f"Transaction hash: {tx_hash}")
        print(f"Remaining balance: ${blockchain.get_balance(user_address):.2f}")
        print("-" * 50)
        print("DETAILED SUMMARY:")
        print(summary['detailed'])
        print("-" * 50)
        print("CONTACT INFO:")
        print(f"Website: {summary['encrypted_contact']['website']}")
        print(f"Contact: {summary['encrypted_contact']['contact']}")
        print("=" * 50)
    except ValueError:
        print("Please enter a valid number.")
        return

async def view_balance():
    """View wallet balance"""
    user_id = storage.get("current_user_id")
    if not user_id:
        print("Please authenticate first.")
        return
    
    user_address = storage.get("user_address", "user_default_address")
    balance = blockchain.get_balance(user_address)
    print(f"\nYour wallet balance: ${balance:.2f}")

async def main():
    """Main CLI function"""
    print("\n" + "=" * 50)
    print("MULTI-AGENT LEAD GENERATION DEMO")
    print("=" * 50)
    print("This demo showcases a multi-agent system using uAgents and ASI-1 Mini LLM")
    
    authenticated = False
    
    while True:
        print("\n" + "-" * 50)
        print("MENU OPTIONS:")
        print("1. Authenticate with Self")
        print("2. Submit sales specification")
        print("3. View lead summaries")
        print("4. Purchase lead details")
        print("5. View wallet balance")
        print("6. Exit")
        print("-" * 50)
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == "1":
            authenticated = await authenticate()
        elif choice == "2":
            await submit_spec()
        elif choice == "3":
            await view_summaries()
        elif choice == "4":
            await purchase_lead()
        elif choice == "5":
            await view_balance()
        elif choice == "6":
            print("\nThank you for using the Multi-Agent Lead Generation Demo!")
            break
        else:
            print("Invalid choice. Please try again.")
            
        await asyncio.sleep(1)  # Small delay for better UX

if __name__ == "__main__":
    # Run the main CLI function
    # The company agent will be started as needed by ensure_company_agent_running()
    asyncio.run(main())
