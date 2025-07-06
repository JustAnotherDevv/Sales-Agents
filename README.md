# Sales-Agents

## Overview

### Walrus SQL Database

#### Features

- **SQL Databases** storing data as blobs on Walrus
- **Onchain** Database creation, management, permissions and blob pointers stored in Solidity smart contracts
- **Privacy:** End-To-End encryption using for either single or multiple users

#### Example User flow

- **[Alice]** Registers new database in smart contract
- **[Alice]** Creates new table with schema and gives write permission to Bob
- **[Bob]** Creates data formatted according to new table schema
- **[Bob]** Encrypts the data using shared key with Alice
- **[Bob]** Upploads encrypted data to Walrus as a blob
- **[Bob]** Shares blob id in a smart contract by attaching it to specified database
- **[Alice]** Fetches new blob from the smart contract, fetches the data from Walrus and decrypts it client-side

### uAgents

### Dapp

## Deployments

**DatabaseManager:**
- **Ethereum Sepolia:** 0xB7ae8A2482700BB708B42fC0CAAA72D64b05Cf84

## Setup
