#!/usr/bin/env node

const {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  formatEther,
  parseEther,
  decodeEventLog,
} = require("viem");
const { anvil, localhost, mainnet, sepolia } = require("viem/chains");
const { generatePrivateKey, privateKeyToAccount } = require("viem/accounts");
const crypto = require("crypto");
require("dotenv").config();

// Mock IPFS hash generation
function generateMockIPFSHash(data) {
  return (
    "Qm" +
    crypto.createHash("sha256").update(data).digest("hex").substring(0, 44)
  );
}

// Logging utilities 🗿
const log = {
  info: (msg) => console.log(`\n📋 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  section: (title) =>
    console.log(`\n${"🗿".repeat(20)}\n${title}\n${"🗿".repeat(20)}`),
  subsection: (title) => console.log(`\n--- ${title} ---`),
  data: (label, value) => console.log(`📊 ${label}: ${value}`),
  address: (label, addr) => console.log(`🏠 ${label}: ${addr}`),
  hash: (label, hash) => console.log(`🔗 ${label}: ${hash}`),
  tx: (label, hash) => console.log(`📝 ${label}: ${hash}`),
  gas: (label, amount) =>
    console.log(`⛽ ${label}: ${amount.toLocaleString()}`),
  balance: (label, amount) =>
    console.log(`💰 ${label}: ${formatEther(amount)} ETH`),
  moai: () => console.log("🗿🗿🗿"),
  contract: (label, addr) => console.log(`📜 ${label}: ${addr}`),
  event: (name, args) => console.log(`🔔 Event ${name}:`, args),
};

// Contract ABI - Fixed tuple syntax for Viem
const contractABI = [
  {
    type: "function",
    name: "createDatabase",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_metadataHash", type: "string" },
      { name: "_isPublic", type: "bool" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createTable",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
      { name: "_schemaHash", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitData",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
      { name: "_dataHash", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "grantWritePermission",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "grantAdminPermission",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeWritePermission",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeAdminPermission",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateDatabaseMetadata",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_metadataHash", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDatabasePublic",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_isPublic", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateTableSchema",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
      { name: "_schemaHash", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getDatabase",
    inputs: [{ name: "_dbId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "owner", type: "address" },
          { name: "exists", type: "bool" },
          { name: "metadataHash", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "isPublic", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTable",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "schemaHash", type: "string" },
          { name: "dataHashes", type: "string[]" },
          { name: "contributors", type: "address[]" },
          { name: "exists", type: "bool" },
          { name: "createdAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserPermissions",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [
      { name: "canWrite", type: "bool" },
      { name: "canAdmin", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDatabaseTables",
    inputs: [{ name: "_dbId", type: "uint256" }],
    outputs: [{ type: "string[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTableDataHashes",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
    ],
    outputs: [{ type: "string[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTableContributors",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
    ],
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserDatabases",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalDatabases",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifyDataSubmission",
    inputs: [
      { name: "_dbId", type: "uint256" },
      { name: "_tableName", type: "string" },
      { name: "_index", type: "uint256" },
    ],
    outputs: [
      { name: "dataHash", type: "string" },
      { name: "contributor", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "DatabaseCreated",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TableCreated",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "tableName", type: "string", indexed: true },
      { name: "schemaHash", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DataSubmitted",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "tableName", type: "string", indexed: true },
      { name: "dataHash", type: "string", indexed: false },
      { name: "submitter", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "WritePermissionGranted",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "AdminPermissionGranted",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "WritePermissionRevoked",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "AdminPermissionRevoked",
    inputs: [
      { name: "dbId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
    ],
  },
];

// Configuration
const CONFIG = {
  // Set your deployed contract address here
  CONTRACT_ADDRESS:
    process.env.CONTRACT_ADDRESS ||
    "0xB7ae8A2482700BB708B42fC0CAAA72D64b05Cf84",
  // Set your RPC URL here
  RPC_URL:
    process.env.RPC_URL || "https://eth-sepolia.api.onfinality.io/public",
  // Private keys for testing (use environment variables in production)
  //   PRIVATE_KEYS: {
  //     OWNER: process.env.OWNER_KEY || generatePrivateKey(),
  //     USER1: process.env.USER1_KEY || generatePrivateKey(),
  //     USER2: process.env.USER2_KEY || generatePrivateKey(),
  //     USER3: process.env.USER3_KEY || generatePrivateKey(),
  //   },
  PRIVATE_KEYS: {
    OWNER: process.env.OWNER_KEY || generatePrivateKey(),
    USER1: process.env.OWNER_KEY || generatePrivateKey(),
    USER2: process.env.OWNER_KEY || generatePrivateKey(),
    USER3: process.env.OWNER_KEY || generatePrivateKey(),
  },
};

async function setupClients() {
  log.section("🔧 SETTING UP CLIENTS AND ACCOUNTS");

  // Create public client for reading
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(CONFIG.RPC_URL),
  });

  // Test connection first
  try {
    const blockNumber = await publicClient.getBlockNumber();
    log.success(`Connected to blockchain at block ${blockNumber}`);
  } catch (error) {
    log.error(`Failed to connect to RPC: ${error.message}`);
    throw error;
  }

  // Check if contract exists at the address
  try {
    const code = await publicClient.getCode({
      address: CONFIG.CONTRACT_ADDRESS,
    });
    if (!code || code === "0x") {
      log.error(`No contract found at address ${CONFIG.CONTRACT_ADDRESS}`);
      log.warning(
        "Make sure you have deployed the contract and set the correct address"
      );
      throw new Error("Contract not found at specified address");
    } else {
      log.success(`Contract found at ${CONFIG.CONTRACT_ADDRESS}`);
      log.data("Contract code size", `${code.length} bytes`);
    }
  } catch (error) {
    log.error(`Error checking contract: ${error.message}`);
    throw error;
  }

  // Create accounts from private keys
  const accounts = {
    owner: privateKeyToAccount(CONFIG.PRIVATE_KEYS.OWNER),
    user1: privateKeyToAccount(CONFIG.PRIVATE_KEYS.USER1),
    user2: privateKeyToAccount(CONFIG.PRIVATE_KEYS.USER2),
    user3: privateKeyToAccount(CONFIG.PRIVATE_KEYS.USER3),
  };

  // Create wallet clients for each account
  const walletClients = {};
  for (const [name, account] of Object.entries(accounts)) {
    walletClients[name] = createWalletClient({
      account,
      chain: sepolia,
      transport: http(CONFIG.RPC_URL),
    });
  }

  log.subsection("Account Information");
  for (const [name, account] of Object.entries(accounts)) {
    log.address(`${name.toUpperCase()}`, account.address);
    try {
      const balance = await publicClient.getBalance({
        address: account.address,
      });
      log.balance(`${name.toUpperCase()} Balance`, balance);

      // Check if account has enough balance for transactions
      if (balance < parseEther("0.01")) {
        log.warning(
          `${name} has low balance - may not be able to send transactions`
        );
      }
    } catch (error) {
      log.warning(`Could not fetch balance for ${name}: ${error.message}`);
    }
  }

  log.contract("Contract Address", CONFIG.CONTRACT_ADDRESS);

  return { publicClient, walletClients, accounts };
}

async function validateContract(contracts) {
  log.section("🔍 VALIDATING CONTRACT");

  try {
    // Test basic contract connectivity
    log.info("Testing contract connectivity...");

    // Try to call a simple view function
    const totalDatabases = await contracts.public.read.getTotalDatabases();
    log.success(`✅ Contract is accessible`);
    log.data("Total databases", totalDatabases.toString());

    // Test if we can read any existing data
    if (totalDatabases > 0n) {
      log.info("Testing data retrieval...");
      for (let i = 1n; i <= totalDatabases && i <= 3n; i++) {
        try {
          const dbInfo = await contracts.public.read.getDatabase([i]);
          log.success(`✅ Can read database ${i}: ${dbInfo.name}`);
        } catch (readError) {
          log.warning(`❌ Cannot read database ${i}: ${readError.message}`);
        }
      }
    }

    log.success("Contract validation completed successfully");
    return true;
  } catch (error) {
    log.error(`Contract validation failed: ${error.message}`);

    // Provide debugging suggestions
    log.warning("🔧 Debugging suggestions:");
    log.warning("1. Verify the contract address is correct");
    log.warning("2. Check if the contract is deployed on the correct network");
    log.warning("3. Ensure the ABI matches the deployed contract");
    log.warning("4. Check network connectivity");

    return false;
  }
}

async function debugContractState(contracts) {
  log.section("🔍 DEBUGGING CONTRACT STATE");

  try {
    // Get total databases
    const totalDatabases = await contracts.public.read.getTotalDatabases();
    log.data("Total Databases", totalDatabases.toString());

    if (totalDatabases > 0n) {
      log.subsection("Existing Databases");

      for (let i = 1n; i <= totalDatabases; i++) {
        try {
          const dbInfo = await contracts.public.read.getDatabase([i]);
          log.data(`Database ${i} ID`, dbInfo.id.toString());
          log.data(`Database ${i} Name`, dbInfo.name);
          log.address(`Database ${i} Owner`, dbInfo.owner);
          log.data(`Database ${i} Public`, dbInfo.isPublic.toString());
          log.hash(`Database ${i} Metadata Hash`, dbInfo.metadataHash);
          log.data(
            `Database ${i} Created At`,
            new Date(Number(dbInfo.createdAt) * 1000).toISOString()
          );

          // Get tables for this database
          try {
            const tables = await contracts.public.read.getDatabaseTables([i]);
            log.data(
              `Database ${i} Tables`,
              tables.length > 0 ? tables.join(", ") : "No tables"
            );

            // Get table details
            for (const tableName of tables) {
              try {
                const tableInfo = await contracts.public.read.getTable([
                  i,
                  tableName,
                ]);
                log.subsection(`Table: ${tableName} (DB ${i})`);
                log.hash(`  Schema Hash`, tableInfo.schemaHash);
                log.data(
                  `  Data Records`,
                  tableInfo.dataHashes.length.toString()
                );
                log.data(
                  `  Contributors`,
                  tableInfo.contributors.length.toString()
                );
                log.data(
                  `  Created At`,
                  new Date(Number(tableInfo.createdAt) * 1000).toISOString()
                );
                log.data(
                  `  Updated At`,
                  new Date(Number(tableInfo.updatedAt) * 1000).toISOString()
                );

                if (tableInfo.dataHashes.length > 0) {
                  log.info(`  Recent data hashes:`);
                  const recentHashes = tableInfo.dataHashes.slice(-3); // Last 3 entries
                  recentHashes.forEach((hash, index) => {
                    const actualIndex =
                      tableInfo.dataHashes.length - recentHashes.length + index;
                    log.hash(`    Record ${actualIndex + 1}`, hash);
                    log.address(
                      `    Contributor ${actualIndex + 1}`,
                      tableInfo.contributors[actualIndex]
                    );
                  });
                }
              } catch (error) {
                log.warning(
                  `Could not read table ${tableName}: ${error.message}`
                );
              }
            }
          } catch (error) {
            log.warning(
              `Could not read tables for database ${i}: ${error.message}`
            );
          }
        } catch (error) {
          log.warning(`Could not read database ${i}: ${error.message}`);
        }
      }
    } else {
      log.info("No databases found in the contract");
    }
  } catch (error) {
    log.error(`Error debugging contract state: ${error.message}`);
    throw error;
  }
}

async function testDatabaseCreation(contracts, accounts, publicClient) {
  log.section("📚 TESTING DATABASE CREATION");

  const dbMetadata = {
    name: "Test E-Commerce DB",
    description: "Test database for e-commerce application",
    version: "1.0.0",
    schema_version: "1.0",
    created_by: "debug_script",
    timestamp: new Date().toISOString(),
  };

  const metadataHash = generateMockIPFSHash(JSON.stringify(dbMetadata));

  log.info("Creating new database...");
  log.data("Database Name", dbMetadata.name);
  log.hash("Metadata Hash", metadataHash);
  log.data("Is Public", "true");

  // Test if the function exists first by calling it as a view function (dry run)
  try {
    log.info("Testing contract function availability...");

    // First, let's try to call a simple view function to test contract connectivity
    const totalDbs = await contracts.public.read.getTotalDatabases();
    log.success(`Contract is responsive. Current total databases: ${totalDbs}`);
  } catch (error) {
    log.error(`Contract connectivity test failed: ${error.message}`);
    log.warning("This might indicate:");
    log.warning("1. Wrong contract address");
    log.warning("2. Contract not deployed");
    log.warning("3. ABI mismatch");
    log.warning("4. Network connectivity issues");
    throw error;
  }

  try {
    // Check account balance first
    const balance = await publicClient.getBalance({
      address: accounts.owner.address,
    });
    log.balance("Owner balance before transaction", balance);

    if (balance < parseEther("0.001")) {
      throw new Error("Insufficient balance for transaction");
    }

    // Estimate gas with more detailed error handling
    log.info("Estimating gas for database creation...");
    let gasEstimate;
    try {
      gasEstimate = await contracts.public.estimateGas.createDatabase(
        [dbMetadata.name, metadataHash, true],
        {
          account: accounts.owner.address,
          value: 0n,
        }
      );
      log.gas("Estimated Gas", gasEstimate);
    } catch (gasError) {
      log.error(`Gas estimation failed: ${gasError.message}`);
      if (gasError.cause) {
        log.error(`Cause: ${gasError.cause.message}`);
      }

      // Try with a manual gas limit
      log.warning("Attempting with manual gas limit...");
      gasEstimate = 500000n; // 500k gas limit
    }

    // Execute transaction with explicit gas settings
    log.info("Executing database creation transaction...");
    const txHash = await contracts.owner.write.createDatabase(
      [dbMetadata.name, metadataHash, true],
      {
        gas: gasEstimate,
        gasPrice: parseEther("0.000000020"), // 20 gwei
      }
    );

    log.tx("Transaction Hash", txHash);
    log.info("Waiting for transaction confirmation...");

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60000, // 60 second timeout
    });

    log.success("Database created successfully!");
    log.gas("Gas Used", receipt.gasUsed);
    log.data("Block Number", receipt.blockNumber.toString());
    log.data(
      "Transaction Status",
      receipt.status === "success" ? "Success" : "Failed"
    );

    // Parse events
    const logs = parseContractLogs(receipt.logs, "DatabaseCreated");
    if (logs.length > 0) {
      const dbId = logs[0].args.dbId;
      log.data("New Database ID", dbId.toString());
      return dbId;
    } else {
      // Fallback: get the latest database ID
      const totalDatabases = await contracts.public.read.getTotalDatabases();
      log.data("New Database ID (estimated)", totalDatabases.toString());
      return totalDatabases;
    }
  } catch (error) {
    log.error(`Database creation failed: ${error.message}`);

    // Provide detailed error information
    if (error.shortMessage) {
      log.error(`Short message: ${error.shortMessage}`);
    }
    if (error.details) {
      log.error(`Details: ${error.details}`);
    }
    if (error.cause) {
      log.error(`Cause: ${error.cause.message}`);
    }

    // Common error scenarios
    if (error.message.includes("insufficient funds")) {
      log.warning("💡 Solution: Add more ETH to the owner account");
    } else if (error.message.includes("execution reverted")) {
      log.warning("💡 Solution: Check contract logic and permissions");
    } else if (error.message.includes("nonce")) {
      log.warning("💡 Solution: Wait a moment and try again (nonce issue)");
    }

    throw error;
  }
}

async function testTableCreation(contracts, accounts, publicClient, dbId) {
  log.section("📋 TESTING TABLE CREATION");

  const tableSchema = {
    name: "users",
    description: "User accounts table",
    columns: [
      { name: "id", type: "INTEGER", primary_key: true, auto_increment: true },
      { name: "email", type: "VARCHAR(255)", unique: true, nullable: false },
      { name: "username", type: "VARCHAR(100)", nullable: false },
      { name: "created_at", type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" },
    ],
    indexes: [
      { name: "idx_email", columns: ["email"] },
      { name: "idx_username", columns: ["username"] },
    ],
  };

  const schemaHash = generateMockIPFSHash(JSON.stringify(tableSchema));

  log.info(`Creating table in database ${dbId}...`);
  log.data("Table Name", tableSchema.name);
  log.hash("Schema Hash", schemaHash);
  log.data("Schema Content", JSON.stringify(tableSchema, null, 2));

  try {
    const gasEstimate = await contracts.public.estimateGas.createTable(
      [dbId, tableSchema.name, schemaHash],
      { account: accounts.owner.address }
    );

    log.gas("Estimated Gas", gasEstimate);

    const txHash = await contracts.owner.write.createTable([
      dbId,
      tableSchema.name,
      schemaHash,
    ]);

    log.tx("Transaction Hash", txHash);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    log.success("Table created successfully!");
    log.gas("Gas Used", receipt.gasUsed);

    return tableSchema.name;
  } catch (error) {
    log.error(`Table creation failed: ${error.message}`);
    if (error.details) log.error(`Details: ${error.details}`);
    throw error;
  }
}

async function testPermissionManagement(
  contracts,
  accounts,
  publicClient,
  dbId
) {
  log.section("🔐 TESTING PERMISSION MANAGEMENT");

  try {
    // Grant write permission to user2
    log.info("Granting write permission to User2...");
    const writeTxHash = await contracts.owner.write.grantWritePermission([
      dbId,
      accounts.user2.address,
    ]);

    log.tx("Write Permission Grant TX", writeTxHash);
    await publicClient.waitForTransactionReceipt({ hash: writeTxHash });
    log.success("Write permission granted!");

    // Grant admin permission to user3
    log.info("Granting admin permission to User3...");
    const adminTxHash = await contracts.owner.write.grantAdminPermission([
      dbId,
      accounts.user3.address,
    ]);

    log.tx("Admin Permission Grant TX", adminTxHash);
    await publicClient.waitForTransactionReceipt({ hash: adminTxHash });
    log.success("Admin permission granted!");

    // Check permissions for all users
    log.subsection("Permission Check");
    for (const [name, account] of Object.entries(accounts)) {
      const permissions = await contracts.public.read.getUserPermissions([
        dbId,
        account.address,
      ]);
      log.data(
        `${name.toUpperCase()} Permissions`,
        `Write: ${permissions[0]}, Admin: ${permissions[1]}`
      );
    }
  } catch (error) {
    log.error(`Permission management failed: ${error.message}`);
    throw error;
  }
}

async function testDataSubmission(
  contracts,
  accounts,
  publicClient,
  dbId,
  tableName
) {
  log.section("📊 TESTING DATA SUBMISSION");

  const sampleUsers = [
    {
      id: 1,
      email: "alice@example.com",
      username: "alice",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      email: "bob@example.com",
      username: "bob",
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      email: "charlie@example.com",
      username: "charlie",
      created_at: new Date().toISOString(),
    },
  ];

  log.info(`Submitting data to table '${tableName}' in database ${dbId}...`);

  for (const user of sampleUsers) {
    const dataHash = generateMockIPFSHash(JSON.stringify(user));

    log.info(`Submitting user ${user.id} data...`);
    log.hash(`Data Hash`, dataHash);
    log.data(`Data Content`, JSON.stringify(user, null, 2));

    try {
      // Use user2 who has write permission
      const txHash = await contracts.user2.write.submitData([
        dbId,
        tableName,
        dataHash,
      ]);

      log.tx(`User ${user.id} Submit TX`, txHash);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      log.gas(`Gas Used`, receipt.gasUsed);
      log.success(`User ${user.id} data submitted!`);
    } catch (error) {
      log.error(`Data submission failed for user ${user.id}: ${error.message}`);
    }
  }
}

async function testErrorHandling(contracts, accounts, dbId, tableName) {
  log.section("⚠️  TESTING ERROR HANDLING");

  // Test unauthorized table creation
  log.info("Testing unauthorized table creation by User1...");
  try {
    await contracts.user1.write.createTable([
      dbId,
      "unauthorized_table",
      "fake_hash",
    ]);
    log.error("This should have failed!");
  } catch (error) {
    log.success("Correctly blocked unauthorized table creation");
    log.data("Error", error.shortMessage || error.message);
  }

  // Test unauthorized data submission
  log.info("Testing unauthorized data submission by User1...");
  try {
    await contracts.user1.write.submitData([dbId, tableName, "fake_hash"]);
    log.error("This should have failed!");
  } catch (error) {
    log.success("Correctly blocked unauthorized data submission");
    log.data("Error", error.shortMessage || error.message);
  }

  // Test invalid database query
  log.info("Testing query of non-existent database...");
  try {
    await contracts.public.read.getDatabase([999n]);
    log.error("This should have failed!");
  } catch (error) {
    log.success("Correctly handled non-existent database query");
    log.data("Error", error.shortMessage || error.message);
  }
}

function parseContractLogs(logs, eventName) {
  try {
    const decodedLogs = [];
    for (const log of logs) {
      try {
        // Try to decode the log using our ABI
        const eventAbi = contractABI.find(
          (item) => item.type === "event" && item.name === eventName
        );
        if (eventAbi) {
          const decoded = decodeEventLog({
            abi: [eventAbi],
            data: log.data,
            topics: log.topics,
          });
          decodedLogs.push(decoded);
        }
      } catch (decodeError) {
        // Log might not be from our contract, skip it
        continue;
      }
    }
    return decodedLogs;
  } catch (error) {
    log.warning(
      `Could not parse logs for event ${eventName}: ${error.message}`
    );
    return [];
  }
}

async function main() {
  try {
    log.section("🗿 DECENTRALIZED DATABASE CONTRACT DEBUGGER");
    log.moai();

    log.info("Starting contract debugging session...");
    log.contract("Target Contract", CONFIG.CONTRACT_ADDRESS);
    log.data("RPC Endpoint", CONFIG.RPC_URL);

    // Setup clients and accounts
    const { publicClient, walletClients, accounts } = await setupClients();

    // Create contract instances
    const contracts = await createContractInstances(
      publicClient,
      walletClients
    );

    // Debug current contract state
    await debugContractState(contracts);

    // Test database creation
    const dbId = await testDatabaseCreation(contracts, accounts, publicClient);

    // Test table creation
    const tableName = await testTableCreation(
      contracts,
      accounts,
      publicClient,
      dbId
    );

    // Test permission management
    await testPermissionManagement(contracts, accounts, publicClient, dbId);

    // Test data submission
    await testDataSubmission(
      contracts,
      accounts,
      publicClient,
      dbId,
      tableName
    );

    // Test error handling
    await testErrorHandling(contracts, accounts, dbId, tableName);

    // Final state check
    log.section("🔍 FINAL CONTRACT STATE");
    await debugContractState(contracts);

    log.section("🎉 DEBUGGING SESSION COMPLETED");
    log.moai();
    log.success("All tests completed successfully!");
  } catch (error) {
    log.error("Debugging session failed:");
    console.error(error);
    process.exit(1);
  }
}

async function createContractInstances(publicClient, walletClients) {
  log.subsection("Creating Contract Instances");

  const contracts = {};

  // Public contract instance for reading
  contracts.public = getContract({
    address: CONFIG.CONTRACT_ADDRESS,
    abi: contractABI,
    client: publicClient,
  });

  // Wallet contract instances for writing
  for (const [name, client] of Object.entries(walletClients)) {
    contracts[name] = getContract({
      address: CONFIG.CONTRACT_ADDRESS,
      abi: contractABI,
      client: client,
    });
  }

  log.success("Contract instances created successfully");

  // Validate contract before proceeding
  const isValid = await validateContract(contracts);
  if (!isValid) {
    throw new Error("Contract validation failed - cannot proceed with testing");
  }

  return contracts;
}

// Quick contract state check function
async function quickCheck() {
  log.section("⚡ QUICK CONTRACT STATE CHECK");
  log.moai();

  try {
    const { publicClient } = await setupClients();
    const contracts = {};

    // Create minimal contract instance for reading only
    contracts.public = getContract({
      address: CONFIG.CONTRACT_ADDRESS,
      abi: contractABI,
      client: publicClient,
    });

    await debugContractState(contracts);
    log.success("Quick check completed!");
  } catch (error) {
    log.error("Quick check failed:");
    console.error(error);

    // Provide helpful suggestions based on error type
    if (error.message.includes("Contract not found")) {
      log.warning("\n🔧 To deploy the contract:");
      log.warning("1. Compile your Solidity contract");
      log.warning("2. Deploy it to your local network");
      log.warning("3. Set CONTRACT_ADDRESS environment variable");
      log.warning("4. Run the script again");
    }
  }
}

// Helper function to display configuration
function showConfig() {
  log.section("⚙️  CURRENT CONFIGURATION");
  log.contract("Contract Address", CONFIG.CONTRACT_ADDRESS);
  log.data("RPC URL", CONFIG.RPC_URL);
  log.data("Owner Key Set", CONFIG.PRIVATE_KEYS.OWNER ? "✅ Yes" : "❌ No");
  log.data("User Keys Set", "✅ Auto-generated");

  if (
    CONFIG.CONTRACT_ADDRESS === "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  ) {
    log.warning(
      "⚠️  Using default contract address - update with your deployed contract!"
    );
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--config") || args.includes("-c")) {
    showConfig();
  } else if (args.includes("--quick") || args.includes("-q")) {
    quickCheck();
  } else if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🗿 Decentralized Database Contract Debugger

Usage:
  node test-contract.js [options]

Options:
  --quick, -q     Quick contract state check only
  --config, -c    Show current configuration
  --help, -h      Show this help message

Environment Variables:
  CONTRACT_ADDRESS    Deployed contract address (REQUIRED)
  RPC_URL            RPC endpoint (default: http://127.0.0.1:8545)
  OWNER_KEY          Private key for contract owner (optional)
  USER1_KEY          Private key for user1 (optional)
  USER2_KEY          Private key for user2 (optional)
  USER3_KEY          Private key for user3 (optional)

Examples:
  # Basic usage with deployed contract
  CONTRACT_ADDRESS=0x123... node test-contract.js
  
  # Quick state check
  CONTRACT_ADDRESS=0x123... node test-contract.js --quick
  
  # Show current config
  node test-contract.js --config
  
  # Full test with custom RPC
  CONTRACT_ADDRESS=0x123... RPC_URL=http://localhost:8545 node test-contract.js

Notes:
  - Make sure your contract is deployed before running tests
  - Accounts will be auto-generated if private keys not provided
  - Default RPC connects to local development blockchain
        `);
  } else {
    main();
  }
}

module.exports = { main, quickCheck };
