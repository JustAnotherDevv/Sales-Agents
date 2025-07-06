#!/usr/bin/env python3
import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MockServices")

class MockSelfAuth:
    """Mock implementation of Self authentication"""
    
    def __init__(self):
        self.users = {}
        logger.info("Mock Self authentication service initialized")
    
    def authenticate(self, username: str, password: str = None) -> str:
        """Authenticate a user and return a user ID"""
        if not username:
            raise ValueError("Username cannot be empty")
        
        # For demo purposes, accept any password for demo_company/password123
        if username == "demo_company" and password != "password123":
            logger.warning(f"Authentication failed for user {username}: incorrect password")
            return None
        
        # Generate a deterministic user ID based on username
        user_id = f"user_{hash(username) % 10000:04d}"
        
        # Store user info
        self.users[user_id] = {
            "username": username,
            "authenticated_at": datetime.now().isoformat(),
            "active": True
        }
        
        logger.info(f"User {username} authenticated with ID {user_id}")
        return user_id
    
    def is_authenticated(self, user_id: str) -> bool:
        """Check if a user is authenticated"""
        return user_id in self.users and self.users[user_id]["active"]
    
    def get_username(self, user_id: str) -> Optional[str]:
        """Get username for a user ID"""
        if user_id in self.users:
            return self.users[user_id]["username"]
        return None

class MockStorage:
    """Mock implementation of Walrus storage"""
    
    def __init__(self, filename: str = "mock_storage.json"):
        self.filename = filename
        self.data = {}
        self._load()
        logger.info(f"Mock storage initialized with file {filename}")
    
    def _load(self):
        """Load data from file"""
        try:
            if os.path.exists(self.filename):
                with open(self.filename, 'r') as f:
                    self.data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error loading storage: {str(e)}")
            self.data = {}
    
    def _save(self):
        """Save data to file"""
        try:
            with open(self.filename, 'w') as f:
                json.dump(self.data, f, indent=2)
        except IOError as e:
            logger.error(f"Error saving storage: {str(e)}")
    
    def set(self, key: str, value: Any):
        """Set a value in storage"""
        self.data[key] = value
        self._save()
        logger.debug(f"Stored value for key: {key}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a value from storage"""
        return self.data.get(key, default)
    
    def delete(self, key: str):
        """Delete a value from storage"""
        if key in self.data:
            del self.data[key]
            self._save()
            logger.debug(f"Deleted key: {key}")
    
    def list_keys(self) -> List[str]:
        """List all keys in storage"""
        return list(self.data.keys())

class MockBlockchain:
    """Mock implementation of OG Network blockchain"""
    
    def __init__(self):
        self.transactions = []
        self.blocks = []
        self.current_block_height = 0
        logger.info("Mock blockchain initialized")
    
    def create_transaction(self, sender: str, recipient: str, amount: float) -> str:
        """Create a mock transaction and return transaction hash"""
        tx_hash = f"0x{os.urandom(32).hex()}"
        
        transaction = {
            "hash": tx_hash,
            "sender": sender,
            "recipient": recipient,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "block": None,
            "status": "pending"
        }
        
        self.transactions.append(transaction)
        logger.info(f"Created transaction {tx_hash}: {sender} -> {recipient}, ${amount}")
        
        # Simulate transaction confirmation
        self._confirm_transaction(tx_hash)
        
        return tx_hash
    
    def _confirm_transaction(self, tx_hash: str):
        """Simulate transaction confirmation"""
        for tx in self.transactions:
            if tx["hash"] == tx_hash:
                # Create a new block
                self.current_block_height += 1
                block = {
                    "height": self.current_block_height,
                    "hash": f"0x{os.urandom(32).hex()}",
                    "timestamp": datetime.now().isoformat(),
                    "transactions": [tx_hash]
                }
                
                self.blocks.append(block)
                
                # Update transaction
                tx["block"] = block["height"]
                tx["status"] = "confirmed"
                
                logger.info(f"Transaction {tx_hash} confirmed in block {block['height']}")
                break
    
    def get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Get transaction details"""
        for tx in self.transactions:
            if tx["hash"] == tx_hash:
                return tx
        return None
    
    def get_balance(self, address: str) -> float:
        """Get balance for an address"""
        balance = 1000.0  # Default starting balance
        
        # Calculate balance based on transactions
        for tx in self.transactions:
            if tx["status"] == "confirmed":
                if tx["sender"] == address:
                    balance -= tx["amount"]
                if tx["recipient"] == address:
                    balance += tx["amount"]
        
        return balance

# Singleton instances for easy access
self_auth = MockSelfAuth()
storage = MockStorage()
blockchain = MockBlockchain()

def get_self_auth() -> MockSelfAuth:
    """Get the Self authentication service instance"""
    return self_auth

def get_storage() -> MockStorage:
    """Get the storage service instance"""
    return storage

def get_blockchain() -> MockBlockchain:
    """Get the blockchain service instance"""
    return blockchain

# Example usage
if __name__ == "__main__":
    # Test Self authentication
    user_id = self_auth.authenticate("TestCompany")
    print(f"Authenticated with user ID: {user_id}")
    
    # Test storage
    storage.set("test_key", {"value": "test_value"})
    value = storage.get("test_key")
    print(f"Retrieved value: {value}")
    
    # Test blockchain
    tx_hash = blockchain.create_transaction("user_address", "agent_address", 100.0)
    tx = blockchain.get_transaction(tx_hash)
    print(f"Transaction details: {tx}")
    
    balance = blockchain.get_balance("user_address")
    print(f"User balance: ${balance}")
