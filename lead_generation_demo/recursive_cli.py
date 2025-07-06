#!/usr/bin/env python3
import asyncio
import json
import logging
import os
import subprocess
import sys
import time
import hashlib
import base64
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
# We'll use a simpler approach for demo purposes

# Import mock services
from mock_services import get_self_auth, get_storage, get_blockchain

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("RecursiveCLI")

# Initialize mock services
self_auth = get_self_auth()
storage = get_storage()
blockchain = get_blockchain()

# For demo purposes, we'll use a mock CLI address and signature
CLI_ADDRESS = "agent1qcli0000000000000000000000000000000000000000000000"

# Function to create a mock signature
def create_mock_signature(digest):
    # For demo purposes, create a hex-encoded signature
    # This matches the format expected by uAgents
    import binascii
    # Create a fixed 64-byte value (typical for Ed25519 signatures)
    mock_bytes = bytes([0x42] * 64)  # 64 bytes of 0x42
    # Return as hex string
    return binascii.hexlify(mock_bytes).decode('utf-8')

async def submit_sales_spec(company_name: str, spec: str, bounty_amount: float = 100.0):
    """Submit a sales specification directly to the scraper agent via CLI agent"""
    logger.info(f"Submitting sales spec for {company_name}: {spec}")
    
    # Ensure CLI agent is running
    ensure_cli_agent_running()
    
    # Use CLI agent to send the sales spec directly to the scraper agent
    from cli_agent import send_sales_spec
    request_id = await send_sales_spec(company_name, spec, bounty_amount)
    
    logger.info(f"Sales spec submitted with request ID: {request_id}")
    
    # In a real implementation, we might wait for a response
    # await get_response(request_id)
    
    # In a real implementation, we would wait for a response
    # For the demo, we'll just wait a bit to simulate processing time
    logger.info("Waiting for agents to process leads...")
    await asyncio.sleep(5)  # Wait for agents to process

# No need for company/orchestrator agent anymore - removed function

def ensure_cli_agent_running():
    """Ensure the CLI agent is running in a separate process"""
    # Check if the CLI agent is already running
    try:
        # Simple check - try to see if there's a process listening on port 8010
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = s.connect_ex(('127.0.0.1', 8010))
        s.close()
        
        if result == 0:
            # Port is open, agent is likely running
            logger.info("CLI agent already running")
            return
    except:
        pass
    
    # Start the CLI agent in a separate process
    logger.info("Starting CLI agent in a separate process")
    try:
        # Use subprocess to start the CLI agent
        import subprocess
        process = subprocess.Popen(
            [sys.executable, "cli_agent.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        logger.info(f"CLI agent process started with PID {process.pid}")
        
        # Wait a bit for the agent to start up
        import time
        time.sleep(2)
    except Exception as e:
        logger.error(f"Error starting CLI agent: {e}")
        raise

async def get_lead_summaries():
    """Request lead summaries directly from summary agent using CLI agent"""
    logger.info("Requesting lead summaries directly from summary agent")
    
    # Ensure CLI agent is running
    ensure_cli_agent_running()
    
    # Import CLI agent functions
    from cli_agent import request_lead_summaries, get_response
    
    # Send summary request via CLI agent directly to summary agent
    logger.info(f"Sending summary request directly to summary agent via CLI agent")
    request_id = await request_lead_summaries()
    
    # Wait for response with a timeout
    logger.info(f"Waiting for summary response with request ID: {request_id}")
    summaries = await get_response(request_id, timeout=10)
    
    if summaries:
        logger.info(f"Retrieved {len(summaries)} lead summaries")
        return summaries
    else:
        logger.warning("No summaries received within timeout period")
        # For demo purposes, return empty list if no response received
        return []

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
