#!/usr/bin/env node

const WalrusUtils = require("./storage/walrus");
const fs = require("fs");
const path = require("path");

class WalrusCLI {
  constructor() {
    this.walrus = new WalrusUtils();
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case "store":
          await this.handleStore(args);
          break;
        case "get":
          await this.handleGet(args);
          break;
        case "list":
          await this.handleList(args);
          break;
        case "search":
          await this.handleSearch(args);
          break;
        case "version":
          await this.handleVersion(args);
          break;
        case "history":
          await this.handleHistory(args);
          break;
        case "rollback":
          await this.handleRollback(args);
          break;
        case "docs":
          await this.handleDocs(args);
          break;
        case "delete":
          await this.handleDelete(args);
          break;
        case "balance":
          await this.handleBalance(args);
          break;
        case "export":
          await this.handleExport(args);
          break;
        case "cleanup":
          await this.handleCleanup(args);
          break;
        case "file":
          await this.handleFile(args);
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    } finally {
      this.walrus.close();
    }
  }

  async handleStore(args) {
    const content = args[1];
    const name = args[2];
    const description = args[3];

    if (!content) {
      console.log(
        'Usage: walrus store "content" [name] [description] [--deletable] [--epochs=N] [--tags=tag1,tag2]'
      );
      return;
    }

    const options = this.parseOptions(args);
    options.name = name;
    options.description = description;

    const result = await this.walrus.storeBlob(content, options);

    console.log("\n📊 Storage Summary:");
    console.log("   Blob ID:", result.blobId);
    console.log("   Name:", result.name || "Unnamed");
    console.log("   Size:", result.size, "bytes");
  }

  async handleFile(args) {
    const filePath = args[1];
    const name = args[2];
    const description = args[3];

    if (!filePath) {
      console.log(
        "Usage: walrus file <file-path> [name] [description] [--deletable] [--epochs=N] [--tags=tag1,tag2]"
      );
      return;
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath);
    const fileName = name || path.basename(filePath);

    // Detect content type
    let contentType = "application/octet-stream";
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".txt": "text/plain",
      ".json": "application/json",
      ".js": "text/javascript",
      ".html": "text/html",
      ".css": "text/css",
      ".md": "text/markdown",
      ".xml": "text/xml",
      ".csv": "text/csv",
    };

    if (contentTypes[ext]) {
      contentType = contentTypes[ext];
    }

    const options = this.parseOptions(args);
    options.name = fileName;
    options.description = description || `File: ${fileName}`;
    options.contentType = contentType;

    console.log("📁 Storing file:", filePath);
    console.log("   Size:", content.length, "bytes");
    console.log("   Type:", contentType);

    const result = await this.walrus.storeBlob(content, options);

    console.log("\n📊 File Storage Summary:");
    console.log("   Blob ID:", result.blobId);
    console.log("   Name:", result.name);
    console.log("   Size:", result.size, "bytes");
  }

  async handleGet(args) {
    const blobId = args[1];
    const outputFile = args[2];

    if (!blobId) {
      console.log(
        "Usage: walrus get <blob-id> [output-file] [--force-network]"
      );
      return;
    }

    const options = this.parseOptions(args);
    const result = await this.walrus.retrieveBlob(blobId, options);

    console.log("\n📊 Blob Information:");
    console.log("   Blob ID:", result.blobId);
    console.log("   Size:", result.size, "bytes");
    console.log("   Type:", result.contentType);

    if (result.metadata) {
      console.log("   Name:", result.metadata.name || "Unnamed");
      console.log(
        "   Description:",
        result.metadata.description || "No description"
      );
      console.log("   Created:", result.metadata.created_at);
    }

    if (outputFile) {
      if (typeof result.content === "string") {
        fs.writeFileSync(outputFile, result.content, "utf8");
      } else {
        fs.writeFileSync(outputFile, result.content);
      }
      console.log("💾 Content saved to:", outputFile);
    } else {
      console.log("\n📄 Content:");
      console.log("─".repeat(50));
      if (typeof result.content === "string") {
        console.log(result.content);
      } else {
        console.log(`[Binary data - ${result.content.length} bytes]`);
        console.log("Use --output option to save binary data to file");
      }
      console.log("─".repeat(50));
    }
  }

  async handleList(args) {
    const options = this.parseOptions(args);
    const limit = parseInt(options.limit) || 20;
    const offset = parseInt(options.offset) || 0;

    const blobs = this.walrus.listBlobs({
      limit,
      offset,
      search: options.search,
      tags: options.tags,
    });

    if (blobs.length === 0) {
      console.log("No blobs found.");
      return;
    }

    console.log(`📋 Found ${blobs.length} blob(s):\n`);

    blobs.forEach((blob, index) => {
      console.log(`${offset + index + 1}. ${blob.name || "Unnamed"}`);
      console.log(`   Blob ID: ${blob.blob_id}`);
      console.log(`   Size: ${blob.size} bytes`);
      console.log(`   Created: ${blob.created_at}`);
      if (blob.description) {
        console.log(`   Description: ${blob.description}`);
      }
      if (blob.tags && blob.tags.length > 0) {
        console.log(`   Tags: ${blob.tags.join(", ")}`);
      }
      console.log(`   Preview: ${blob.content_preview}`);
      console.log("");
    });

    if (blobs.length === limit) {
      console.log(
        `💡 Showing ${limit} results. Use --offset=${
          offset + limit
        } to see more.`
      );
    }
  }

  async handleSearch(args) {
    const query = args[1];

    if (!query) {
      console.log(
        'Usage: walrus search "query" [--tags=tag1,tag2] [--limit=N]'
      );
      return;
    }

    const options = this.parseOptions(args);
    const limit = parseInt(options.limit) || 20;

    const blobs = this.walrus.listBlobs({
      search: query,
      tags: options.tags,
      limit,
    });

    console.log(`🔍 Search results for "${query}":\n`);

    if (blobs.length === 0) {
      console.log("No matching blobs found.");
      return;
    }

    blobs.forEach((blob, index) => {
      console.log(`${index + 1}. ${blob.name || "Unnamed"}`);
      console.log(`   Blob ID: ${blob.blob_id}`);
      console.log(
        `   Match: ${this.highlightMatch(blob.content_preview, query)}`
      );
      console.log("");
    });
  }

  async handleVersion(args) {
    const documentName = args[1];
    const content = args[2];
    const description = args[3];

    if (!documentName || !content) {
      console.log(
        'Usage: walrus version <document-name> "content" [description] [options]'
      );
      return;
    }

    const options = this.parseOptions(args);
    options.description = description;

    const result = await this.walrus.storeVersion(
      documentName,
      content,
      options
    );

    console.log("\n📑 Version Created:");
    console.log("   Document:", result.documentName);
    console.log("   Version:", result.version);
    console.log("   Blob ID:", result.blobId);
    console.log("   Size:", result.size, "bytes");
  }

  async handleHistory(args) {
    const documentName = args[1];

    if (!documentName) {
      console.log("Usage: walrus history <document-name>");
      return;
    }

    const history = this.walrus.getVersionHistory(documentName);

    if (history.length === 0) {
      console.log(`No versions found for document "${documentName}"`);
      return;
    }

    console.log(`📚 Version History for "${documentName}":\n`);

    history.forEach((version) => {
      const isCurrent = version.is_current;
      const marker = isCurrent ? "→" : " ";

      console.log(
        `${marker} Version ${version.version} ${isCurrent ? "(current)" : ""}`
      );
      console.log(`   Blob ID: ${version.blob_id}`);
      console.log(`   Description: ${version.description || "No description"}`);
      console.log(`   Created: ${version.created_at}`);
      console.log(`   Size: ${version.size} bytes`);
      console.log(`   Preview: ${version.content_preview}`);
      console.log("");
    });
  }

  async handleRollback(args) {
    const documentName = args[1];
    const version = parseInt(args[2]);

    if (!documentName || !version) {
      console.log("Usage: walrus rollback <document-name> <version-number>");
      return;
    }

    this.walrus.setCurrentVersion(documentName, version);
  }

  async handleDocs(args) {
    const documents = this.walrus.listDocuments();

    if (documents.length === 0) {
      console.log("No versioned documents found.");
      return;
    }

    console.log(`📚 Found ${documents.length} versioned document(s):\n`);

    documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.document_name}`);
      console.log(`   Versions: ${doc.total_versions}`);
      console.log(`   Latest: v${doc.latest_version}`);
      console.log(`   Updated: ${doc.last_updated}`);
      console.log("");
    });
  }

  async handleDelete(args) {
    const blobId = args[1];

    if (!blobId) {
      console.log("Usage: walrus delete <blob-id>");
      return;
    }

    const metadata = this.walrus.getBlobMetadata(blobId);
    if (!metadata) {
      throw new Error("Blob not found in cache");
    }

    console.log("🗑️ Deleting blob:");
    console.log("   Blob ID:", blobId);
    console.log("   Name:", metadata.name || "Unnamed");
    console.log("   Size:", metadata.size, "bytes");

    // Confirm deletion
    const confirm = await this.confirmAction(
      "Are you sure you want to delete this blob? (y/N)"
    );
    if (!confirm) {
      console.log("❌ Deletion cancelled");
      return;
    }

    await this.walrus.deleteBlob(blobId);
  }

  async handleBalance(args) {
    console.log("💰 Checking account balance...");
    const balance = await this.walrus.checkBalance();

    if (balance < 0.01) {
      console.log(
        "\n💡 Get testnet SUI tokens at: https://faucet.testnet.sui.io/"
      );
    }
  }

  async handleExport(args) {
    const filename = args[1];
    const exportPath = this.walrus.exportMetadata(filename);
    console.log("📦 Export completed successfully!");
  }

  async handleCleanup(args) {
    const options = this.parseOptions(args);
    const daysOld = parseInt(options.days) || 30;

    console.log(`🧹 Cleaning up cache entries older than ${daysOld} days...`);

    const confirm = await this.confirmAction(
      "This will remove old cached metadata. Continue? (y/N)"
    );
    if (!confirm) {
      console.log("❌ Cleanup cancelled");
      return;
    }

    const removed = this.walrus.cleanupCache(daysOld);
    console.log(`✅ Cleanup completed. Removed ${removed} entries.`);
  }

  parseOptions(args) {
    const options = {};

    args.forEach((arg) => {
      if (arg.startsWith("--")) {
        const [key, value] = arg.slice(2).split("=");

        if (value === undefined) {
          options[key] = true;
        } else if (key === "tags") {
          options[key] = value.split(",").map((t) => t.trim());
        } else if (key === "epochs") {
          options[key] = parseInt(value);
        } else {
          options[key] = value;
        }
      }
    });

    return options;
  }

  highlightMatch(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return `${before}**${match}**${after}`;
  }

  async confirmAction(message) {
    // Simple confirmation - in a real CLI you might want to use readline
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(message + " ", (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
      });
    });
  }

  showHelp() {
    console.log(`
🐋 Walrus CLI - Decentralized Storage Utility

STORAGE COMMANDS:
  store "text" [name] [desc]        Store text content
  file <path> [name] [desc]         Store file content
  
RETRIEVAL COMMANDS:
  get <blob-id> [output-file]       Retrieve blob content
  list                              List all cached blobs
  search "query"                    Search blobs by content
  
VERSIONING COMMANDS:
  version <doc> "content" [desc]    Create new document version
  history <document>                Show version history
  rollback <document> <version>     Set current version
  docs                              List all versioned documents
  
MANAGEMENT COMMANDS:
  delete <blob-id>                  Delete blob (if deletable)
  balance                           Check account balance
  export [filename]                 Export metadata
  cleanup                           Clean old cache entries

OPTIONS:
  --deletable                       Make blob deletable
  --epochs=N                        Storage duration (default: 3)
  --tags=tag1,tag2                  Add tags
  --limit=N                         Limit results (default: 20)
  --offset=N                        Skip N results
  --force-network                   Skip cache, fetch from network
  --days=N                          Days for cleanup (default: 30)

EXAMPLES:
  walrus store "Hello World" "greeting" "My first blob"
  walrus store "Hello World" --deletable --epochs=5 --tags=test,demo
  walrus file document.txt "My Document" --tags=important
  walrus get wVAMm79LCvWXdyqWBuc5iZQLw-2t716ly0W6v2jDTrM
  walrus list --limit=10 --tags=important
  walrus search "hello" --limit=5
  walrus version "my-doc" "Version 1 content" "Initial version"
  walrus history "my-doc"
  walrus rollback "my-doc" 1

SETUP:
  1. Create .env file with: WALRUS_PRIVATE_KEY=your_bech32_private_key
  2. Get testnet SUI: https://faucet.testnet.sui.io/
  3. Ensure you have WAL tokens for storage

For more help: https://docs.walrus.space
`);
  }
}

// Auto-run if called directly
if (require.main === module) {
  const cli = new WalrusCLI();
  cli.run().catch((error) => {
    console.error("❌ CLI Error:", error.message);
    process.exit(1);
  });
}

module.exports = WalrusCLI;
