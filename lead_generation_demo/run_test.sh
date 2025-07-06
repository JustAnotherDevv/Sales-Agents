#!/bin/bash

# Multi-Agent Lead Generation Demo Test Script
echo "Starting Multi-Agent Lead Generation Demo Test..."

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "Checking dependencies..."
pip install -r requirements.txt

# Create mock data directory if it doesn't exist
mkdir -p mock_data

# Run the agents in separate terminals
echo "Starting agents in separate terminals..."
echo "Note: You may need to grant terminal permissions"

# Open new terminal windows for each agent
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'\" && source venv/bin/activate && python3 scraper_agent.py"'
sleep 2
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'\" && source venv/bin/activate && python3 alignment_agent.py"'
sleep 2
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'\" && source venv/bin/activate && python3 scoring_agent.py"'
sleep 2
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'\" && source venv/bin/activate && python3 summary_agent.py"'
sleep 2

# Run the company CLI in the current terminal
echo "Starting company CLI..."
python3 recursive_cli.py
