const { getFullnodeUrl, SuiClient } = require("@mysten/sui/client");
const { WalrusClient, RetryableWalrusClientError } = require("@mysten/walrus");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class WalrusUtils {
  constructor(options = {}) {
    this.network = options.network || "testnet";
    this.cacheDir = options.cacheDir || "./cache";
    this.dbPath = path.join(this.cacheDir, "walrus.db");
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 5000;
    this.timeout = options.timeout || 120000; // 2 minutes
    this.disableLocalCache = options.disableLocalCache || false;

    // Initialize clients
    this.suiClient = null;
    this.walrusClient = null;
    this.db = null;
    this.keypair = null;

    this.init();
  }

  init() {
    try {
      // Create cache directory
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      // Initialize database only if caching is enabled
      if (!this.disableLocalCache) {
        this.initDatabase();
      }

      // Initialize clients
      this.initClients();

      console.log("✅ WalrusUtils initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize WalrusUtils:", error.message);
      throw error;
    }
  }

  initDatabase() {
    if (this.disableLocalCache) {
      console.log("📊 Local caching disabled");
      return;
    }

    try {
      this.db = new Database(this.dbPath);

      // Create tables
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS blobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          blob_id TEXT UNIQUE NOT NULL,
          name TEXT,
          description TEXT,
          content_type TEXT DEFAULT 'text/plain',
          size INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          epochs INTEGER,
          deletable BOOLEAN DEFAULT 0,
          transaction_digest TEXT,
          content_preview TEXT,
          tags TEXT -- JSON array of tags
        );

        CREATE TABLE IF NOT EXISTS blob_versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_name TEXT NOT NULL,
          version INTEGER NOT NULL,
          blob_id TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_current BOOLEAN DEFAULT 0,
          UNIQUE(document_name, version),
          FOREIGN KEY(blob_id) REFERENCES blobs(blob_id)
        );

        CREATE INDEX IF NOT EXISTS idx_blob_id ON blobs(blob_id);
        CREATE INDEX IF NOT EXISTS idx_name ON blobs(name);
        CREATE INDEX IF NOT EXISTS idx_document_name ON blob_versions(document_name);
        CREATE INDEX IF NOT EXISTS idx_is_current ON blob_versions(is_current);
      `);

      console.log("📊 Database initialized");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error.message);
      this.db = null; // Disable caching if database fails
    }
  }

  initClients() {
    // Load private key from environment
    const privateKey = process.env.WALRUS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("WALRUS_PRIVATE_KEY environment variable is required");
    }

    this.keypair = Ed25519Keypair.fromSecretKey(privateKey);

    this.suiClient = new SuiClient({
      url: getFullnodeUrl(this.network),
    });

    this.walrusClient = new WalrusClient({
      network: this.network,
      suiClient: this.suiClient,
      storageNodeClientOptions: {
        timeout: this.timeout,
        onError: (error) => {
          console.log("🔧 Storage node error:", error.message);
        },
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(this.timeout),
          });
        },
      },
    });

    console.log(
      "🔗 Clients initialized for address:",
      this.keypair.toSuiAddress()
    );
  }

  // Store a blob with retry logic and caching
  async storeBlob(content, options = {}) {
    const {
      name = null,
      description = "",
      contentType = "text/plain",
      deletable = false,
      epochs = 3,
      tags = [],
    } = options;

    try {
      console.log("📤 Storing blob...");
      if (name) console.log("   Name:", name);
      if (description) console.log("   Description:", description);

      // Convert content to Uint8Array
      let blob;
      if (typeof content === "string") {
        blob = new TextEncoder().encode(content);
      } else if (content instanceof Uint8Array) {
        blob = content;
      } else {
        throw new Error("Content must be string or Uint8Array");
      }

      console.log("   Size:", blob.length, "bytes");

      // Check balance first
      await this.checkBalance();

      let blobId;
      let transactionDigest;
      let retryCount = 0;

      while (retryCount < this.maxRetries) {
        try {
          console.log(`🔄 Attempt ${retryCount + 1}/${this.maxRetries}`);

          const result = await this.walrusClient.writeBlob({
            blob,
            deletable,
            epochs,
            signer: this.keypair,
          });

          blobId = result.blobId;
          transactionDigest = result.transactionDigest;

          console.log("✅ Blob stored successfully!");
          console.log("   Blob ID:", blobId);
          if (transactionDigest) {
            console.log("   Transaction:", transactionDigest);
          }
          break;
        } catch (error) {
          console.log(`❌ Attempt ${retryCount + 1} failed:`, error.message);

          if (error instanceof RetryableWalrusClientError) {
            console.log("🔄 Retryable error detected. Resetting client...");
            this.walrusClient.reset();
          }

          retryCount++;
          if (retryCount < this.maxRetries) {
            console.log(
              `⏳ Waiting ${this.retryDelay / 1000} seconds before retry...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryDelay)
            );
          }
        }
      }

      if (!blobId) {
        throw new Error("Failed to store blob after all retries");
      }

      // Cache in database only if caching is enabled and database is available
      if (!this.disableLocalCache && this.db && this.isDbOpen()) {
        try {
          const contentPreview =
            typeof content === "string"
              ? content.substring(0, 200) + (content.length > 200 ? "..." : "")
              : `Binary data (${blob.length} bytes)`;

          this.db
            .prepare(
              `
            INSERT OR REPLACE INTO blobs 
            (blob_id, name, description, content_type, size, epochs, deletable, transaction_digest, content_preview, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
            )
            .run(
              blobId,
              name,
              description,
              contentType,
              blob.length,
              epochs,
              deletable ? 1 : 0,
              transactionDigest,
              contentPreview,
              JSON.stringify(tags)
            );

          console.log("💾 Blob cached in local database");
        } catch (error) {
          console.log(
            "⚠️ Failed to cache blob metadata locally:",
            error.message
          );
          // Don't throw - the blob was stored successfully to Walrus
        }
      } else if (!this.disableLocalCache) {
        console.log("⚠️ Local caching not available, skipping cache");
      }

      return {
        blobId,
        size: blob.length,
        transactionDigest,
        name,
        description,
      };
    } catch (error) {
      console.error("❌ Store blob failed:", error.message);
      this.logTroubleshootingTips();
      throw error;
    }
  }

  // Check if database connection is open
  isDbOpen() {
    try {
      return this.db && this.db.open;
    } catch (error) {
      return false;
    }
  }

  // Retrieve a blob (try cache first, then network)
  async retrieveBlob(blobId, options = {}) {
    const { forceNetwork = false } = options;

    try {
      console.log("📥 Retrieving blob:", blobId);

      // Check if we have metadata in cache
      let cachedMetadata = null;
      if (!this.disableLocalCache && !forceNetwork) {
        cachedMetadata = this.getBlobMetadata(blobId);
        if (cachedMetadata) {
          console.log(
            "📋 Found metadata in cache:",
            cachedMetadata.name || "Unnamed"
          );
        }
      }

      // Fetch from network
      console.log("🌐 Fetching from Walrus network...");
      const blob = await this.walrusClient.readBlob({ blobId });

      console.log("✅ Blob retrieved successfully");
      console.log("   Size:", blob.length, "bytes");

      // Try to decode as text if it looks like text
      let content = blob;
      let contentType = "application/octet-stream";

      try {
        const decoded = new TextDecoder().decode(blob);
        // Simple heuristic: if it decodes without errors and has reasonable characters
        if (
          decoded.length > 0 &&
          !/[\x00-\x08\x0E-\x1F\x7F]/.test(decoded.substring(0, 100))
        ) {
          content = decoded;
          contentType = "text/plain";
        }
      } catch (e) {
        // Keep as binary
      }

      return {
        blobId,
        content,
        contentType,
        size: blob.length,
        metadata: cachedMetadata,
      };
    } catch (error) {
      console.error("❌ Retrieve blob failed:", error.message);
      throw error;
    }
  }

  // Get blob metadata from cache
  getBlobMetadata(blobId) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      return null;
    }

    try {
      const stmt = this.db.prepare("SELECT * FROM blobs WHERE blob_id = ?");
      const result = stmt.get(blobId);

      if (result) {
        return {
          ...result,
          deletable: Boolean(result.deletable),
          tags: JSON.parse(result.tags || "[]"),
        };
      }
    } catch (error) {
      console.log("⚠️ Failed to get blob metadata:", error.message);
    }

    return null;
  }

  // List all cached blobs
  listBlobs(options = {}) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      console.log("⚠️ Local cache not available");
      return [];
    }

    try {
      const { limit = 50, offset = 0, search = null, tags = null } = options;

      let query = "SELECT * FROM blobs";
      let params = [];
      let whereConditions = [];

      if (search) {
        whereConditions.push(
          "(name LIKE ? OR description LIKE ? OR content_preview LIKE ?)"
        );
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          whereConditions.push("tags LIKE ?");
          params.push(`%"${tag}"%`);
        });
      }

      if (whereConditions.length > 0) {
        query += " WHERE " + whereConditions.join(" AND ");
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const stmt = this.db.prepare(query);
      const results = stmt.all(...params);

      return results.map((result) => ({
        ...result,
        deletable: Boolean(result.deletable),
        tags: JSON.parse(result.tags || "[]"),
      }));
    } catch (error) {
      console.log("⚠️ Failed to list blobs:", error.message);
      return [];
    }
  }

  // Versioned document storage
  async storeVersion(documentName, content, options = {}) {
    const { description = "", ...storeOptions } = options;

    try {
      // Store the blob
      const result = await this.storeBlob(content, {
        name: `${documentName} (version)`,
        description,
        ...storeOptions,
      });

      if (!this.disableLocalCache && this.db && this.isDbOpen()) {
        try {
          // Get next version number
          const lastVersion = this.db
            .prepare(
              "SELECT MAX(version) as max_version FROM blob_versions WHERE document_name = ?"
            )
            .get(documentName);

          const newVersion = (lastVersion?.max_version || 0) + 1;

          // Mark all previous versions as not current
          this.db
            .prepare(
              "UPDATE blob_versions SET is_current = 0 WHERE document_name = ?"
            )
            .run(documentName);

          // Insert new version
          this.db
            .prepare(
              `
            INSERT INTO blob_versions 
            (document_name, version, blob_id, description, is_current)
            VALUES (?, ?, ?, ?, 1)
          `
            )
            .run(documentName, newVersion, result.blobId, description);

          console.log(`📑 Created version ${newVersion} of "${documentName}"`);

          return {
            ...result,
            documentName,
            version: newVersion,
          };
        } catch (error) {
          console.log("⚠️ Failed to track version locally:", error.message);
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Store version failed:", error.message);
      throw error;
    }
  }

  // Get current version of a document
  async getCurrentVersion(documentName) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      throw new Error("Version tracking not available - local cache disabled");
    }

    try {
      const stmt = this.db.prepare(`
        SELECT bv.*, b.name, b.description as blob_description, b.size, b.created_at as blob_created
        FROM blob_versions bv
        JOIN blobs b ON bv.blob_id = b.blob_id
        WHERE bv.document_name = ? AND bv.is_current = 1
      `);

      const version = stmt.get(documentName);
      if (!version) {
        throw new Error(`Document "${documentName}" not found`);
      }

      const content = await this.retrieveBlob(version.blob_id);

      return {
        documentName,
        version: version.version,
        blobId: version.blob_id,
        description: version.description,
        content: content.content,
        size: version.size,
        createdAt: version.created_at,
      };
    } catch (error) {
      console.error("❌ Failed to get current version:", error.message);
      throw error;
    }
  }

  // Get version history
  getVersionHistory(documentName) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      console.log("⚠️ Version history not available - local cache disabled");
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT bv.*, b.name, b.size, b.content_preview
        FROM blob_versions bv
        JOIN blobs b ON bv.blob_id = b.blob_id
        WHERE bv.document_name = ?
        ORDER BY bv.version DESC
      `);

      return stmt.all(documentName);
    } catch (error) {
      console.log("⚠️ Failed to get version history:", error.message);
      return [];
    }
  }

  // List all versioned documents
  listDocuments() {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      console.log("⚠️ Document list not available - local cache disabled");
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT 
          document_name,
          COUNT(*) as total_versions,
          MAX(version) as latest_version,
          MAX(bv.created_at) as last_updated
        FROM blob_versions bv
        GROUP BY document_name
        ORDER BY last_updated DESC
      `);

      return stmt.all();
    } catch (error) {
      console.log("⚠️ Failed to list documents:", error.message);
      return [];
    }
  }

  // Set current version (rollback)
  setCurrentVersion(documentName, version) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      throw new Error("Version control not available - local cache disabled");
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM blob_versions 
        WHERE document_name = ? AND version = ?
      `);

      const targetVersion = stmt.get(documentName, version);
      if (!targetVersion) {
        throw new Error(
          `Version ${version} not found for document "${documentName}"`
        );
      }

      // Update current version
      this.db
        .prepare(
          "UPDATE blob_versions SET is_current = 0 WHERE document_name = ?"
        )
        .run(documentName);

      this.db
        .prepare(
          "UPDATE blob_versions SET is_current = 1 WHERE document_name = ? AND version = ?"
        )
        .run(documentName, version);

      console.log(`✅ Set "${documentName}" current version to ${version}`);
    } catch (error) {
      console.error("❌ Failed to set current version:", error.message);
      throw error;
    }
  }

  // Delete blob (if deletable)
  async deleteBlob(blobId) {
    const metadata = this.getBlobMetadata(blobId);
    if (!metadata) {
      throw new Error("Blob not found in cache");
    }

    if (!metadata.deletable) {
      throw new Error("Blob is not deletable");
    }

    try {
      console.log("🗑️ Deleting blob:", blobId);

      await this.walrusClient.deleteBlob({
        blobId,
        signer: this.keypair,
      });

      // Remove from cache if available
      if (!this.disableLocalCache && this.db && this.isDbOpen()) {
        try {
          this.db.prepare("DELETE FROM blobs WHERE blob_id = ?").run(blobId);
          this.db
            .prepare("DELETE FROM blob_versions WHERE blob_id = ?")
            .run(blobId);
        } catch (error) {
          console.log("⚠️ Failed to remove from local cache:", error.message);
        }
      }

      console.log("✅ Blob deleted successfully");
    } catch (error) {
      console.error("❌ Delete blob failed:", error.message);
      throw error;
    }
  }

  // Check account balance
  async checkBalance() {
    try {
      const balance = await this.suiClient.getBalance({
        owner: this.keypair.toSuiAddress(),
      });

      const suiBalance = parseInt(balance.totalBalance) / 1_000_000_000; // Convert from MIST to SUI
      console.log(`💰 SUI Balance: ${suiBalance.toFixed(6)} SUI`);

      if (suiBalance < 0.001) {
        console.log(
          "⚠️  Warning: Low SUI balance. You may need more SUI for transaction fees."
        );
      }

      return suiBalance;
    } catch (error) {
      console.error("❌ Failed to check balance:", error.message);
    }
  }

  // Export blob metadata
  exportMetadata(filename = null) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      throw new Error("Export not available - local cache disabled");
    }

    try {
      const blobs = this.listBlobs({ limit: 1000 });
      const documents = this.listDocuments();

      const exportData = {
        blobs,
        documents,
        exportedAt: new Date().toISOString(),
        network: this.network,
        address: this.keypair.toSuiAddress(),
      };

      const exportFilename = filename || `walrus-export-${Date.now()}.json`;
      const exportPath = path.join(this.cacheDir, exportFilename);

      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      console.log("📦 Metadata exported to:", exportPath);

      return exportPath;
    } catch (error) {
      console.error("❌ Failed to export metadata:", error.message);
      throw error;
    }
  }

  // Cleanup old cache entries
  cleanupCache(daysOld = 30) {
    if (this.disableLocalCache || !this.db || !this.isDbOpen()) {
      console.log("⚠️ Cleanup not available - local cache disabled");
      return 0;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = this.db
        .prepare(
          `
        DELETE FROM blobs 
        WHERE created_at < ? 
        AND blob_id NOT IN (SELECT blob_id FROM blob_versions)
      `
        )
        .run(cutoffDate.toISOString());

      console.log(`🧹 Cleaned up ${result.changes} old cache entries`);
      return result.changes;
    } catch (error) {
      console.error("❌ Failed to cleanup cache:", error.message);
      return 0;
    }
  }

  // Log troubleshooting tips
  logTroubleshootingTips() {
    console.log("\n--- Troubleshooting Tips ---");
    console.log("1. Check your SUI balance: run checkBalance()");
    console.log("2. Ensure you have WAL tokens for storage fees");
    console.log("3. Verify network connectivity to Walrus testnet");
    console.log("4. Try a smaller blob size first");
    console.log("5. Check if testnet is experiencing issues");
    console.log("6. Consider using a fan-out proxy for better reliability");
  }

  // Close database connection
  close() {
    if (this.db && this.isDbOpen()) {
      try {
        this.db.close();
        console.log("📊 Database connection closed");
      } catch (error) {
        console.log("⚠️ Error closing database:", error.message);
      }
    }
  }
}

module.exports = WalrusUtils;
