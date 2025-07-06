const WalrusUtils = require("../storage/walrus");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

class WalrusDatabase {
  constructor(databaseName, options = {}) {
    this.databaseName = databaseName;
    this.cacheDir = options.cacheDir || "./cache";
    this.localDbPath = path.join(this.cacheDir, `${databaseName}-data.db`);
    this.metaDbPath = path.join(this.cacheDir, `${databaseName}-meta.db`);

    // Initialize WalrusUtils with disabled local cache to avoid conflicts
    this.walrus = new WalrusUtils({
      ...options,
      cacheDir: path.join(this.cacheDir, "walrus-utils"),
      disableLocalCache: true,
    });

    // Local SQLite for fast queries and caching
    this.localDb = null;
    this.metaDb = null;
    this.isInitialized = false;
    this.initPromise = null;

    // Database metadata
    this.metadata = {
      name: databaseName,
      version: 1,
      tables: {},
      created_at: new Date().toISOString(),
      last_sync: null,
    };

    // Start initialization but don't wait for it in constructor
    this.initPromise = this.init();
  }

  // Wait for initialization to complete
  async waitForInit() {
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise;
    }
    return this.isInitialized;
  }

  async init() {
    try {
      // Ensure cache directory exists
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      // Initialize metadata database (tracks Walrus blob mappings)
      this.initMetaDatabase();

      // Try to load existing database from Walrus
      await this.loadDatabase();

      this.isInitialized = true;
      console.log(`📊 WalrusDatabase "${this.databaseName}" initialized`);
    } catch (error) {
      console.error("❌ Failed to initialize WalrusDatabase:", error.message);
      this.isInitialized = false;
      throw error;
    }
  }

  initMetaDatabase() {
    try {
      this.metaDb = new Database(this.metaDbPath);

      // Create metadata tables
      this.metaDb.exec(`
        CREATE TABLE IF NOT EXISTS database_info (
          key TEXT PRIMARY KEY,
          value TEXT,
          blob_id TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS table_schemas (
          table_name TEXT PRIMARY KEY,
          schema_json TEXT,
          blob_id TEXT,
          version INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS data_chunks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT,
          chunk_id TEXT,
          blob_id TEXT,
          record_count INTEGER,
          start_id INTEGER,
          end_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(table_name) REFERENCES table_schemas(table_name)
        );

        CREATE TABLE IF NOT EXISTS sync_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          operation TEXT,
          table_name TEXT,
          description TEXT,
          blob_id TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("📋 Metadata database initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize metadata database:",
        error.message
      );
      throw error;
    }
  }

  async loadDatabase() {
    try {
      // Try to find database metadata blob
      const metadataBlobs = this.walrus.listBlobs({
        search: `${this.databaseName}-metadata`,
        limit: 1,
      });

      if (metadataBlobs.length > 0) {
        console.log("📥 Loading existing database from Walrus...");

        // Load metadata
        const metadataBlob = await this.walrus.retrieveBlob(
          metadataBlobs[0].blob_id
        );
        this.metadata = JSON.parse(metadataBlob.content);

        // Initialize local database with proper schema
        this.localDb = new Database(this.localDbPath);

        // Load table schemas and data
        await this.loadAllTables();

        console.log("✅ Database loaded successfully");
      } else {
        console.log("🆕 Creating new database");
        this.localDb = new Database(this.localDbPath);
        await this.saveMetadata();
      }
    } catch (error) {
      console.log(
        "⚠️ Could not load existing database, creating new one:",
        error.message
      );
      this.localDb = new Database(this.localDbPath);
      await this.saveMetadata();
    }
  }

  async loadAllTables() {
    try {
      const schemas = this.metaDb.prepare("SELECT * FROM table_schemas").all();

      for (const schemaRow of schemas) {
        const schema = JSON.parse(schemaRow.schema_json);

        // Create table in local database
        await this.createLocalTable(schemaRow.table_name, schema);

        // Load data chunks
        await this.loadTableData(schemaRow.table_name);
      }
    } catch (error) {
      console.error("❌ Failed to load tables:", error.message);
    }
  }

  async createLocalTable(tableName, schema) {
    try {
      // Convert schema to SQLite CREATE TABLE statement
      const columns = schema.columns
        .map((col) => {
          let def = `${col.name} ${this.convertDataType(col.type)}`;
          if (col.primaryKey) def += " PRIMARY KEY";
          if (col.autoIncrement) def += " AUTOINCREMENT";
          if (col.notNull) def += " NOT NULL";
          if (col.unique) def += " UNIQUE";
          if (col.defaultValue !== undefined)
            def += ` DEFAULT ${col.defaultValue}`;
          return def;
        })
        .join(", ");

      const createSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;

      this.localDb.exec(createSql);
      console.log(`📋 Created local table: ${tableName}`);
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error.message);
    }
  }

  convertDataType(type) {
    const typeMap = {
      string: "TEXT",
      text: "TEXT",
      integer: "INTEGER",
      int: "INTEGER",
      float: "REAL",
      real: "REAL",
      boolean: "INTEGER",
      bool: "INTEGER",
      date: "TEXT",
      datetime: "TEXT",
      json: "TEXT",
    };

    return typeMap[type.toLowerCase()] || "TEXT";
  }

  async loadTableData(tableName) {
    try {
      const chunks = this.metaDb
        .prepare(
          "SELECT * FROM data_chunks WHERE table_name = ? ORDER BY start_id"
        )
        .all(tableName);

      console.log(
        `📥 Loading ${chunks.length} data chunk(s) for table ${tableName}`
      );

      for (const chunk of chunks) {
        try {
          const chunkBlob = await this.walrus.retrieveBlob(chunk.blob_id);
          const records = JSON.parse(chunkBlob.content);

          // Insert records into local database
          await this.insertRecordsLocally(tableName, records);

          console.log(
            `✅ Loaded chunk ${chunk.chunk_id} (${records.length} records)`
          );
        } catch (error) {
          console.error(
            `❌ Failed to load chunk ${chunk.chunk_id}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error(
        `❌ Failed to load table data for ${tableName}:`,
        error.message
      );
    }
  }

  async insertRecordsLocally(tableName, records) {
    if (records.length === 0) return;

    try {
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => "?").join(", ");
      const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

      const stmt = this.localDb.prepare(sql);
      const transaction = this.localDb.transaction((records) => {
        for (const record of records) {
          stmt.run(columns.map((col) => record[col]));
        }
      });

      transaction(records);
    } catch (error) {
      console.error(`❌ Failed to insert records locally:`, error.message);
    }
  }

  // CREATE TABLE
  async createTable(tableName, schema, options = {}) {
    try {
      console.log(`📋 Creating table: ${tableName}`);

      // Validate schema
      if (!schema.columns || !Array.isArray(schema.columns)) {
        throw new Error("Schema must have a columns array");
      }

      // Create table locally
      await this.createLocalTable(tableName, schema);

      // Store schema in metadata database
      this.metaDb
        .prepare(
          `
        INSERT OR REPLACE INTO table_schemas (table_name, schema_json)
        VALUES (?, ?)
      `
        )
        .run(tableName, JSON.stringify(schema));

      // Update metadata
      this.metadata.tables[tableName] = {
        ...schema,
        created_at: new Date().toISOString(),
        record_count: 0,
      };

      // Save schema to Walrus
      await this.saveTableSchema(tableName, schema);
      await this.saveMetadata();

      console.log(`✅ Table "${tableName}" created successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error.message);
      throw error;
    }
  }

  async saveTableSchema(tableName, schema) {
    try {
      const schemaBlob = {
        table_name: tableName,
        schema: schema,
        database: this.databaseName,
        created_at: new Date().toISOString(),
      };

      const result = await this.walrus.storeBlob(JSON.stringify(schemaBlob), {
        name: `${this.databaseName}-${tableName}-schema`,
        description: `Schema for table ${tableName} in database ${this.databaseName}`,
        tags: ["schema", "table", this.databaseName, tableName],
      });

      // Update metadata tracking
      this.metaDb
        .prepare(
          `
        UPDATE table_schemas SET blob_id = ? WHERE table_name = ?
      `
        )
        .run(result.blobId, tableName);

      return result.blobId;
    } catch (error) {
      console.error(`❌ Failed to save table schema:`, error.message);
      throw error;
    }
  }

  // INSERT
  async insert(tableName, data, options = {}) {
    const { sync = true, chunkSize = 1000 } = options;

    try {
      // Validate table exists
      if (!this.metadata.tables[tableName]) {
        throw new Error(`Table "${tableName}" does not exist`);
      }

      const records = Array.isArray(data) ? data : [data];
      console.log(`➕ Inserting ${records.length} record(s) into ${tableName}`);

      // Insert locally first
      await this.insertRecordsLocally(tableName, records);

      // Update record count
      this.metadata.tables[tableName].record_count += records.length;

      if (sync) {
        // Store data chunk to Walrus
        await this.syncTableChunk(tableName, records);
      }

      await this.logOperation(
        "INSERT",
        tableName,
        `Inserted ${records.length} records`
      );

      console.log(`✅ Inserted ${records.length} record(s) successfully`);
      return records.length;
    } catch (error) {
      console.error(`❌ Insert failed:`, error.message);
      throw error;
    }
  }

  async syncTableChunk(tableName, records) {
    try {
      const chunkId = `${tableName}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const chunkData = {
        chunk_id: chunkId,
        table_name: tableName,
        database: this.databaseName,
        records: records,
        created_at: new Date().toISOString(),
      };

      const result = await this.walrus.storeBlob(JSON.stringify(chunkData), {
        name: `${this.databaseName}-${tableName}-data-${chunkId}`,
        description: `Data chunk for ${tableName} (${records.length} records)`,
        tags: ["data", "chunk", this.databaseName, tableName],
      });

      // Track in metadata
      const minId = Math.min(...records.map((r) => r.id || 0));
      const maxId = Math.max(...records.map((r) => r.id || 0));

      this.metaDb
        .prepare(
          `
        INSERT INTO data_chunks (table_name, chunk_id, blob_id, record_count, start_id, end_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `
        )
        .run(tableName, chunkId, result.blobId, records.length, minId, maxId);

      return result.blobId;
    } catch (error) {
      console.error(`❌ Failed to sync table chunk:`, error.message);
      throw error;
    }
  }

  // SELECT (with SQL-like syntax)
  select(tableName, options = {}) {
    const {
      columns = "*",
      where = "",
      orderBy = "",
      limit = null,
      offset = 0,
    } = options;

    try {
      let sql = `SELECT ${columns} FROM ${tableName}`;
      const params = [];

      if (where) {
        sql += ` WHERE ${where}`;
      }

      if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
      }

      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      if (offset > 0) {
        sql += ` OFFSET ${offset}`;
      }

      console.log(`🔍 Query: ${sql}`);

      const stmt = this.localDb.prepare(sql);
      const results = stmt.all();

      console.log(`📊 Found ${results.length} record(s)`);
      return results;
    } catch (error) {
      console.error(`❌ Select failed:`, error.message);
      throw error;
    }
  }

  // UPDATE
  async update(tableName, data, where, options = {}) {
    const { sync = true } = options;

    try {
      // Build update SQL
      const setClause = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${where}`;
      const params = Object.values(data);

      console.log(`🔄 Update: ${sql}`);

      const stmt = this.localDb.prepare(sql);
      const result = stmt.run(...params);

      if (sync && result.changes > 0) {
        // Get updated records
        const updatedRecords = this.select(tableName, { where });
        await this.syncTableChunk(tableName, updatedRecords);
      }

      await this.logOperation(
        "UPDATE",
        tableName,
        `Updated ${result.changes} records`
      );

      console.log(`✅ Updated ${result.changes} record(s)`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Update failed:`, error.message);
      throw error;
    }
  }

  // DELETE
  async delete(tableName, where, options = {}) {
    const { sync = true } = options;

    try {
      // Get records before deletion for sync
      let deletedRecords = [];
      if (sync) {
        deletedRecords = this.select(tableName, { where });
      }

      const sql = `DELETE FROM ${tableName} WHERE ${where}`;
      console.log(`🗑️ Delete: ${sql}`);

      const stmt = this.localDb.prepare(sql);
      const result = stmt.run();

      this.metadata.tables[tableName].record_count -= result.changes;

      if (sync && result.changes > 0) {
        // Store deletion log
        await this.syncDeletionLog(tableName, deletedRecords);
      }

      await this.logOperation(
        "DELETE",
        tableName,
        `Deleted ${result.changes} records`
      );

      console.log(`✅ Deleted ${result.changes} record(s)`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Delete failed:`, error.message);
      throw error;
    }
  }

  async syncDeletionLog(tableName, deletedRecords) {
    try {
      const logData = {
        operation: "DELETE",
        table_name: tableName,
        database: this.databaseName,
        deleted_records: deletedRecords,
        timestamp: new Date().toISOString(),
      };

      const result = await this.walrus.storeBlob(JSON.stringify(logData), {
        name: `${this.databaseName}-${tableName}-delete-log`,
        description: `Deletion log for ${tableName} (${deletedRecords.length} records)`,
        tags: ["delete-log", this.databaseName, tableName],
      });

      return result.blobId;
    } catch (error) {
      console.error(`❌ Failed to sync deletion log:`, error.message);
      throw error;
    }
  }

  // Database operations
  async saveMetadata() {
    try {
      const result = await this.walrus.storeBlob(
        JSON.stringify(this.metadata),
        {
          name: `${this.databaseName}-metadata`,
          description: `Metadata for database ${this.databaseName}`,
          tags: ["metadata", "database", this.databaseName],
        }
      );

      this.metaDb
        .prepare(
          `
        INSERT OR REPLACE INTO database_info (key, value, blob_id)
        VALUES ('metadata', ?, ?)
      `
        )
        .run(JSON.stringify(this.metadata), result.blobId);

      console.log("💾 Database metadata saved to Walrus");
      return result.blobId;
    } catch (error) {
      console.error("❌ Failed to save metadata:", error.message);
      throw error;
    }
  }

  // Utility methods
  getTables() {
    return Object.keys(this.metadata.tables);
  }

  getTableSchema(tableName) {
    return this.metadata.tables[tableName];
  }

  getTableInfo(tableName) {
    if (!this.metadata.tables[tableName]) {
      throw new Error(`Table "${tableName}" does not exist`);
    }

    try {
      const info = this.localDb
        .prepare(
          `
        SELECT COUNT(*) as count FROM ${tableName}
      `
        )
        .get();

      return {
        name: tableName,
        schema: this.metadata.tables[tableName],
        local_count: info.count,
        metadata_count: this.metadata.tables[tableName].record_count,
      };
    } catch (error) {
      console.error(`❌ Failed to get table info:`, error.message);
      return {
        name: tableName,
        schema: this.metadata.tables[tableName],
        local_count: 0,
        metadata_count: this.metadata.tables[tableName].record_count,
      };
    }
  }

  async getStats() {
    const stats = {
      database: this.databaseName,
      tables: this.getTables().length,
      total_records: 0,
      walrus_blobs: 0,
      cache_size: 0,
    };

    for (const tableName of this.getTables()) {
      try {
        const info = this.getTableInfo(tableName);
        stats.total_records += info.local_count;
      } catch (error) {
        console.error(
          `❌ Failed to get stats for table ${tableName}:`,
          error.message
        );
      }
    }

    // Get Walrus blob count
    const blobs = this.walrus.listBlobs({
      search: this.databaseName,
      limit: 1000,
    });
    stats.walrus_blobs = blobs.length;

    // Get cache size
    try {
      const localStat = fs.statSync(this.localDbPath);
      const metaStat = fs.statSync(this.metaDbPath);
      stats.cache_size = localStat.size + metaStat.size;
    } catch (error) {
      stats.cache_size = 0;
    }

    return stats;
  }

  async logOperation(operation, tableName, description, blobId = null) {
    try {
      this.metaDb
        .prepare(
          `
        INSERT INTO sync_log (operation, table_name, description, blob_id)
        VALUES (?, ?, ?, ?)
      `
        )
        .run(operation, tableName, description, blobId);
    } catch (error) {
      console.error(`❌ Failed to log operation:`, error.message);
    }
  }

  getSyncLog(limit = 50) {
    try {
      return this.metaDb
        .prepare(
          `
        SELECT * FROM sync_log 
        ORDER BY timestamp DESC 
        LIMIT ?
      `
        )
        .all(limit);
    } catch (error) {
      console.error(`❌ Failed to get sync log:`, error.message);
      return [];
    }
  }

  // Raw SQL execution
  raw(sql, params = []) {
    try {
      console.log(`🔧 Raw SQL: ${sql}`);

      if (sql.trim().toUpperCase().startsWith("SELECT")) {
        const stmt = this.localDb.prepare(sql);
        return stmt.all(...params);
      } else {
        const stmt = this.localDb.prepare(sql);
        return stmt.run(...params);
      }
    } catch (error) {
      console.error(`❌ Raw SQL failed:`, error.message);
      throw error;
    }
  }

  // Backup and restore
  async backup(backupName = null) {
    const name = backupName || `${this.databaseName}-backup-${Date.now()}`;

    console.log(`💾 Creating backup: ${name}`);

    try {
      const backup = {
        database_name: this.databaseName,
        metadata: this.metadata,
        tables: {},
        created_at: new Date().toISOString(),
      };

      // Export all table data
      for (const tableName of this.getTables()) {
        backup.tables[tableName] = {
          schema: this.metadata.tables[tableName],
          data: this.select(tableName),
        };
      }

      const result = await this.walrus.storeBlob(JSON.stringify(backup), {
        name: name,
        description: `Full backup of database ${this.databaseName}`,
        tags: ["backup", "database", this.databaseName],
      });

      console.log(`✅ Backup created: ${result.blobId}`);
      return result.blobId;
    } catch (error) {
      console.error(`❌ Backup failed:`, error.message);
      throw error;
    }
  }

  // Cleanup
  async close() {
    // Wait for initialization to complete before closing
    await this.waitForInit();

    try {
      if (this.localDb) {
        this.localDb.close();
        console.log("📊 Local database closed");
      }
    } catch (error) {
      console.error("⚠️ Error closing local database:", error.message);
    }

    try {
      if (this.metaDb) {
        this.metaDb.close();
        console.log("📊 Metadata database closed");
      }
    } catch (error) {
      console.error("⚠️ Error closing metadata database:", error.message);
    }

    try {
      if (this.walrus) {
        this.walrus.close();
      }
    } catch (error) {
      console.error("⚠️ Error closing walrus utils:", error.message);
    }

    console.log("📊 WalrusDatabase closed");
  }
}

module.exports = WalrusDatabase;
