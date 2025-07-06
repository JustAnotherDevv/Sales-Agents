# Multi-Agent Lead Generation Demo

A hackathon demo showcasing the power of decentralized AI agents using the uAgents framework and ASI-1 Mini LLM. This proof-of-concept demonstrates agent collaboration and Web3-native AI capabilities.

## Project Overview

This demo features four autonomous AI agents that collaborate to find, filter, score, and summarize leads for companies:

1. **Scraper Agent**: Acquires lead data (uses mock data for the demo)
2. **Alignment Agent**: Filters leads based on sales specifications using ASI-1 Mini
3. **Scoring Agent**: Assigns quality scores to leads using ASI-1 Mini
4. **Summary Agent**: Creates intelligent summaries using ASI-1 Mini

## ASI-1 Mini Showcase Features

This demo highlights these key capabilities of ASI-1 Mini:

- **Autonomous Agentic Workflows**: Agents make independent decisions without human intervention
- **Think, Adapt, and Collaborate**: Agents reason about lead quality and adapt summaries based on context
- **Knowledge Graph Integration**: Connects leads to industry relationships and market knowledge
- **Context-Aware, Adaptive Interactions**: Maintains conversation history and adapts based on context

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone this repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. (Optional) Set up environment variables for ASI-1 Mini API key:

```bash
export ASI1_API_KEY=your_api_key_here
```

### Running the Demo

1. Start all four agents in separate terminal windows:

```bash
# Terminal 1
python scraper_agent.py

# Terminal 2
python alignment_agent.py

# Terminal 3
python scoring_agent.py

# Terminal 4
python summary_agent.py
```

2. Start the company CLI interface in a fifth terminal window:

```bash
python recursive_cli.py
```

3. Follow the prompts in the CLI to:
   - Enter your company name
   - Specify what kind of leads you're looking for (e.g., "Looking for B2B SaaS companies in fintech")
   - Set a bounty amount

4. Watch as the agents process your request and return lead summaries

5. Choose to pay for detailed information about promising leads

## Demo Flow

1. **Company Input**: Enter company details and sales specification
2. **Agent Processing**:
   - Scraper Agent finds potential leads
   - Alignment Agent filters leads based on sales spec
   - Scoring Agent assigns quality scores
   - Summary Agent creates intelligent summaries
3. **Lead Review**: View TLDR summaries of matching leads
4. **Lead Purchase**: Pay to reveal detailed information

## Technical Implementation

- **Framework**: uAgents from Fetch.ai/ASI Alliance
- **Primary LLM**: ASI-1 Mini (showcasing agentic workflow capabilities)
- **Authentication**: Self
- **Blockchain**: OG Network

## Hackathon Notes

This demo focuses on showcasing the "wow factor" of multi-agent collaboration powered by ASI-1 Mini. For the hackathon, we've mocked several components that would be fully implemented in a production system:

- Authentication is simulated
- Blockchain transactions are mocked
- Lead data is pre-populated

The core agent communication and ASI-1 Mini integration are fully functional.

## Future Enhancements

- Web UI instead of CLI
- Real blockchain integration
- Actual web scraping for lead generation
- Full Self authentication
- Walrus storage integration
