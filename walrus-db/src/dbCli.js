const WalrusDatabase = require("./db/sqldb");
const readline = require("readline");

class WalrusDatabaseCLI {
  constructor() {
    this.db = null;
    this.currentDatabase = null;
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case "create-db":
          await this.handleCreateDatabase(args);
          break;
        case "use":
          await this.handleUseDatabase(args);
          break;
        case "create-table":
          await this.handleCreateTable(args);
          break;
        case "insert":
          await this.handleInsert(args);
          break;
        case "select":
          await this.handleSelect(args);
          break;
        case "update":
          await this.handleUpdate(args);
          break;
        case "delete":
          await this.handleDelete(args);
          break;
        case "tables":
          await this.handleListTables(args);
          break;
        case "describe":
          await this.handleDescribeTable(args);
          break;
        case "stats":
          await this.handleStats(args);
          break;
        case "backup":
          await this.handleBackup(args);
          break;
        case "sql":
          await this.handleRawSQL(args);
          break;
        case "repl":
          await this.startREPL();
          return; // REPL handles its own lifecycle
        case "import-csv":
          await this.handleImportCSV(args);
          break;
        case "export-csv":
          await this.handleExportCSV(args);
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    } finally {
      // Only close if not in REPL mode
      if (this.db && command !== "repl") {
        await this.closeDatabase();
      }
    }
  }

  async closeDatabase() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async ensureDatabase() {
    if (!this.db) {
      throw new Error(
        'No database selected. Use "walrus-db use <database-name>" first.'
      );
    }
  }

  async handleCreateDatabase(args) {
    const dbName = args[1];
    if (!dbName) {
      console.log("Usage: walrus-db create-db <database-name>");
      return;
    }

    console.log(`🗄️ Creating database: ${dbName}`);
    this.db = new WalrusDatabase(dbName);
    this.currentDatabase = dbName;

    // Wait for all async initialization to complete
    await this.db.waitForInit();

    console.log(`✅ Database "${dbName}" created and selected`);
  }

  async handleUseDatabase(args) {
    const dbName = args[1];
    if (!dbName) {
      console.log("Usage: walrus-db use <database-name>");
      return;
    }

    console.log(`🔗 Connecting to database: ${dbName}`);

    if (this.db) {
      await this.db.close();
    }

    this.db = new WalrusDatabase(dbName);
    this.currentDatabase = dbName;

    // Wait for initialization to complete
    await this.db.waitForInit();

    console.log(`✅ Connected to database "${dbName}"`);
  }

  async handleCreateTable(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    const schemaFile = args[2];

    if (!tableName) {
      console.log(
        "Usage: walrus-db create-table <table-name> [schema-file.json]"
      );
      console.log("");
      console.log("Example schema file:");
      console.log(
        JSON.stringify(
          {
            columns: [
              {
                name: "id",
                type: "integer",
                primaryKey: true,
                autoIncrement: true,
              },
              { name: "name", type: "text", notNull: true },
              { name: "email", type: "text", unique: true },
              { name: "age", type: "integer" },
              {
                name: "created_at",
                type: "datetime",
                defaultValue: "CURRENT_TIMESTAMP",
              },
            ],
          },
          null,
          2
        )
      );
      return;
    }

    let schema;
    if (schemaFile) {
      const fs = require("fs");
      const schemaContent = fs.readFileSync(schemaFile, "utf8");
      schema = JSON.parse(schemaContent);
    } else {
      // Interactive schema creation
      schema = await this.createSchemaInteractively(tableName);
    }

    await this.db.createTable(tableName, schema);
  }

  async createSchemaInteractively(tableName) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`\n📋 Creating schema for table: ${tableName}`);
    console.log('Enter column definitions (type "done" when finished):');

    const columns = [];

    while (true) {
      const columnName = await this.question(rl, `Column name (or "done"): `);
      if (columnName.toLowerCase() === "done") break;

      const columnType = await this.question(
        rl,
        `Column type [text|integer|real|boolean|datetime]: `
      );
      const isPrimaryKey =
        (await this.question(rl, `Primary key? [y/N]: `)).toLowerCase() === "y";
      const isNotNull =
        (await this.question(rl, `Not null? [y/N]: `)).toLowerCase() === "y";
      const isUnique =
        (await this.question(rl, `Unique? [y/N]: `)).toLowerCase() === "y";
      const defaultValue = await this.question(
        rl,
        `Default value (or press enter): `
      );

      const column = {
        name: columnName,
        type: columnType || "text",
        primaryKey: isPrimaryKey,
        notNull: isNotNull,
        unique: isUnique,
      };

      if (isPrimaryKey && columnType === "integer") {
        const autoIncrement =
          (await this.question(rl, `Auto increment? [Y/n]: `)).toLowerCase() !==
          "n";
        column.autoIncrement = autoIncrement;
      }

      if (defaultValue) {
        column.defaultValue = defaultValue;
      }

      columns.push(column);
      console.log(`✅ Added column: ${JSON.stringify(column)}`);
    }

    rl.close();

    return { columns };
  }

  question(rl, text) {
    return new Promise((resolve) => {
      rl.question(text, resolve);
    });
  }

  async handleInsert(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    const dataJson = args[2];

    if (!tableName || !dataJson) {
      console.log(
        'Usage: walrus-db insert <table-name> \'{"column1": "value1", "column2": "value2"}\''
      );
      console.log(
        '       walrus-db insert <table-name> \'[{"name": "John"}, {"name": "Jane"}]\''
      );
      return;
    }

    try {
      const data = JSON.parse(dataJson);
      const count = await this.db.insert(tableName, data);
      console.log(`✅ Inserted ${count} record(s) into ${tableName}`);
    } catch (error) {
      if (error.message.includes("JSON")) {
        console.error("❌ Invalid JSON data");
      } else {
        throw error;
      }
    }
  }

  async handleSelect(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    if (!tableName) {
      console.log(
        'Usage: walrus-db select <table-name> [--columns="col1,col2"] [--where="condition"] [--order="column"] [--limit=N]'
      );
      return;
    }

    const options = this.parseSelectOptions(args);
    const results = this.db.select(tableName, options);

    if (results.length === 0) {
      console.log("No records found.");
      return;
    }

    // Display results in table format
    console.table(results);
    console.log(`\n📊 ${results.length} record(s) found`);
  }

  parseSelectOptions(args) {
    const options = {};

    args.forEach((arg) => {
      if (arg.startsWith("--columns=")) {
        options.columns = arg.split("=")[1];
      } else if (arg.startsWith("--where=")) {
        options.where = arg.split("=")[1];
      } else if (arg.startsWith("--order=")) {
        options.orderBy = arg.split("=")[1];
      } else if (arg.startsWith("--limit=")) {
        options.limit = parseInt(arg.split("=")[1]);
      } else if (arg.startsWith("--offset=")) {
        options.offset = parseInt(arg.split("=")[1]);
      }
    });

    return options;
  }

  async handleUpdate(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    const dataJson = args[2];
    const whereClause = args[3];

    if (!tableName || !dataJson || !whereClause) {
      console.log(
        'Usage: walrus-db update <table-name> \'{"column": "new_value"}\' "where_clause"'
      );
      console.log(
        'Example: walrus-db update users \'{"name": "John Doe"}\' "id = 1"'
      );
      return;
    }

    try {
      const data = JSON.parse(dataJson);
      const count = await this.db.update(tableName, data, whereClause);
      console.log(`✅ Updated ${count} record(s) in ${tableName}`);
    } catch (error) {
      if (error.message.includes("JSON")) {
        console.error("❌ Invalid JSON data");
      } else {
        throw error;
      }
    }
  }

  async handleDelete(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    const whereClause = args[2];

    if (!tableName || !whereClause) {
      console.log('Usage: walrus-db delete <table-name> "where_clause"');
      console.log('Example: walrus-db delete users "age < 18"');
      return;
    }

    // Confirm deletion
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirm = await this.question(
      rl,
      `⚠️  Delete records from ${tableName} where ${whereClause}? (y/N): `
    );
    rl.close();

    if (confirm.toLowerCase() !== "y") {
      console.log("❌ Deletion cancelled");
      return;
    }

    const count = await this.db.delete(tableName, whereClause);
    console.log(`✅ Deleted ${count} record(s) from ${tableName}`);
  }

  async handleListTables(args) {
    await this.ensureDatabase();

    const tables = this.db.getTables();

    if (tables.length === 0) {
      console.log("No tables found in database.");
      return;
    }

    console.log(`📋 Tables in database "${this.currentDatabase}":\n`);

    for (const tableName of tables) {
      const info = this.db.getTableInfo(tableName);
      console.log(`• ${tableName}`);
      console.log(`  Records: ${info.local_count}`);
      console.log(`  Columns: ${info.schema.columns.length}`);
      console.log("");
    }
  }

  async handleDescribeTable(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    if (!tableName) {
      console.log("Usage: walrus-db describe <table-name>");
      return;
    }

    const info = this.db.getTableInfo(tableName);

    console.log(`📋 Table: ${tableName}\n`);
    console.log("Columns:");

    info.schema.columns.forEach((col) => {
      let line = `  ${col.name} (${col.type})`;
      const flags = [];
      if (col.primaryKey) flags.push("PRIMARY KEY");
      if (col.autoIncrement) flags.push("AUTO INCREMENT");
      if (col.notNull) flags.push("NOT NULL");
      if (col.unique) flags.push("UNIQUE");
      if (col.defaultValue) flags.push(`DEFAULT ${col.defaultValue}`);

      if (flags.length > 0) {
        line += ` - ${flags.join(", ")}`;
      }

      console.log(line);
    });

    console.log(`\nRecords: ${info.local_count}`);
    console.log(`Created: ${info.schema.created_at}`);
  }

  async handleStats(args) {
    await this.ensureDatabase();

    const stats = await this.db.getStats();

    console.log(`📊 Database Statistics: ${this.currentDatabase}\n`);
    console.log(`Tables: ${stats.tables}`);
    console.log(`Total Records: ${stats.total_records}`);
    console.log(`Walrus Blobs: ${stats.walrus_blobs}`);
    console.log(
      `Cache Size: ${(stats.cache_size / 1024 / 1024).toFixed(2)} MB`
    );

    // Show sync log
    console.log("\n📝 Recent Operations:");
    const log = this.db.getSyncLog(5);

    if (log.length === 0) {
      console.log("  No operations recorded");
    } else {
      log.forEach((entry) => {
        console.log(
          `  ${entry.timestamp}: ${entry.operation} on ${entry.table_name} - ${entry.description}`
        );
      });
    }
  }

  async handleBackup(args) {
    await this.ensureDatabase();

    const backupName = args[1];
    const blobId = await this.db.backup(backupName);

    console.log(`💾 Backup completed successfully!`);
    console.log(`Blob ID: ${blobId}`);
  }

  async handleRawSQL(args) {
    await this.ensureDatabase();

    const sql = args.slice(1).join(" ");
    if (!sql) {
      console.log('Usage: walrus-db sql "SELECT * FROM table_name"');
      return;
    }

    try {
      const result = this.db.raw(sql);

      if (Array.isArray(result)) {
        if (result.length === 0) {
          console.log("No results returned.");
        } else {
          console.table(result);
          console.log(`\n📊 ${result.length} record(s) returned`);
        }
      } else {
        console.log("Query executed successfully.");
        if (result.changes !== undefined) {
          console.log(`Rows affected: ${result.changes}`);
        }
      }
    } catch (error) {
      console.error("❌ SQL Error:", error.message);
    }
  }

  async startREPL() {
    if (!this.currentDatabase) {
      console.log(
        "Please select a database first: walrus-db use <database-name>"
      );
      return;
    }

    await this.ensureDatabase();

    console.log(
      `🐋 Walrus Database REPL - Connected to: ${this.currentDatabase}`
    );
    console.log("Enter SQL commands or special commands starting with .");
    console.log("Type .help for help, .exit to quit\n");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `walrus-db(${this.currentDatabase})> `,
    });

    rl.prompt();

    rl.on("line", async (line) => {
      const input = line.trim();

      if (!input) {
        rl.prompt();
        return;
      }

      try {
        if (input.startsWith(".")) {
          await this.handleREPLCommand(input, rl);
        } else {
          // Execute SQL
          const result = this.db.raw(input);

          if (Array.isArray(result)) {
            if (result.length === 0) {
              console.log("No results.");
            } else {
              console.table(result);
              console.log(`${result.length} row(s)`);
            }
          } else {
            console.log("OK");
            if (result.changes !== undefined) {
              console.log(`${result.changes} row(s) affected`);
            }
          }
        }
      } catch (error) {
        console.error("Error:", error.message);
      }

      rl.prompt();
    });

    rl.on("close", () => {
      console.log("\nGoodbye!");
      process.exit(0);
    });
  }

  async handleREPLCommand(input, rl) {
    const [command, ...args] = input.slice(1).split(" ");

    switch (command) {
      case "help":
        console.log("\nREPL Commands:");
        console.log("  .help          - Show this help");
        console.log("  .tables        - List all tables");
        console.log("  .schema <table> - Show table schema");
        console.log("  .stats         - Show database statistics");
        console.log("  .backup [name] - Create backup");
        console.log("  .exit          - Exit REPL");
        console.log("\nSQL Examples:");
        console.log("  SELECT * FROM users;");
        console.log(
          '  INSERT INTO users (name, email) VALUES ("John", "john@example.com");'
        );
        console.log('  UPDATE users SET name = "Jane" WHERE id = 1;');
        console.log("  DELETE FROM users WHERE age < 18;");
        break;

      case "tables":
        const tables = this.db.getTables();
        if (tables.length === 0) {
          console.log("No tables found.");
        } else {
          console.log("Tables:", tables.join(", "));
        }
        break;

      case "schema":
        const tableName = args[0];
        if (!tableName) {
          console.log("Usage: .schema <table-name>");
        } else {
          try {
            const info = this.db.getTableInfo(tableName);
            console.log(`\nTable: ${tableName}`);
            info.schema.columns.forEach((col) => {
              console.log(
                `  ${col.name}: ${col.type}${col.primaryKey ? " (PK)" : ""}`
              );
            });
          } catch (error) {
            console.log("Table not found:", tableName);
          }
        }
        break;

      case "stats":
        const stats = await this.db.getStats();
        console.log(
          `\nTables: ${stats.tables}, Records: ${stats.total_records}, Blobs: ${stats.walrus_blobs}`
        );
        break;

      case "backup":
        const backupName = args[0];
        try {
          const blobId = await this.db.backup(backupName);
          console.log(`Backup created: ${blobId}`);
        } catch (error) {
          console.log("Backup failed:", error.message);
        }
        break;

      case "exit":
        rl.close();
        break;

      default:
        console.log(`Unknown command: ${command}. Type .help for help.`);
    }
  }

  async handleImportCSV(args) {
    await this.ensureDatabase();

    const csvFile = args[1];
    const tableName = args[2];

    if (!csvFile || !tableName) {
      console.log("Usage: walrus-db import-csv <csv-file> <table-name>");
      return;
    }

    const fs = require("fs");
    if (!fs.existsSync(csvFile)) {
      console.log(`File not found: ${csvFile}`);
      return;
    }

    // Simple CSV parsing (you might want to use a proper CSV library)
    const csvContent = fs.readFileSync(csvFile, "utf8");
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || null;
      });
      records.push(record);
    }

    console.log(`📥 Importing ${records.length} records from ${csvFile}`);

    const count = await this.db.insert(tableName, records);
    console.log(`✅ Imported ${count} records into ${tableName}`);
  }

  async handleExportCSV(args) {
    await this.ensureDatabase();

    const tableName = args[1];
    const outputFile = args[2];

    if (!tableName || !outputFile) {
      console.log("Usage: walrus-db export-csv <table-name> <output-file>");
      return;
    }

    const records = this.db.select(tableName);

    if (records.length === 0) {
      console.log("No records to export.");
      return;
    }

    // Convert to CSV
    const headers = Object.keys(records[0]);
    const csvLines = [headers.join(",")];

    records.forEach((record) => {
      const values = headers.map((header) => {
        const value = record[header];
        return value !== null ? `"${value}"` : "";
      });
      csvLines.push(values.join(","));
    });

    const fs = require("fs");
    fs.writeFileSync(outputFile, csvLines.join("\n"));

    console.log(`📤 Exported ${records.length} records to ${outputFile}`);
  }

  showHelp() {
    console.log(`
🐋 Walrus Database CLI - SQL-like Database on Decentralized Storage

DATABASE OPERATIONS:
  create-db <n>              Create new database
  use <n>                    Connect to database
  
TABLE OPERATIONS:
  create-table <n> [schema]  Create table (interactive or from JSON file)
  tables                        List all tables
  describe <table>              Show table schema
  
DATA OPERATIONS:
  insert <table> '<json>'       Insert record(s)
  select <table> [options]      Query records
  update <table> '<json>' "where" Update records  
  delete <table> "where"        Delete records
  
QUERY OPTIONS:
  --columns="col1,col2"         Select specific columns
  --where="condition"           Filter condition
  --order="column [ASC|DESC]"   Sort results
  --limit=N                     Limit results
  --offset=N                    Skip N results

ADVANCED OPERATIONS:
  sql "query"                   Execute raw SQL
  repl                          Start interactive SQL shell
  stats                         Show database statistics
  backup [name]                 Create full backup
  
DATA IMPORT/EXPORT:
  import-csv <file> <table>     Import CSV file
  export-csv <table> <file>     Export table to CSV

EXAMPLES:
  # Create and use database
  walrus-db create-db myapp
  walrus-db use myapp
  
  # Create table interactively
  walrus-db create-table users
  
  # Insert data
  walrus-db insert users '{"name": "John", "email": "john@example.com", "age": 30}'
  walrus-db insert users '[{"name": "Jane", "age": 25}, {"name": "Bob", "age": 35}]'
  
  # Query data
  walrus-db select users
  walrus-db select users --where="age > 25" --order="name ASC" --limit=10
  walrus-db select users --columns="name,email"
  
  # Update and delete
  walrus-db update users '{"age": 31}' "name = 'John'"
  walrus-db delete users "age < 18"
  
  # Advanced usage
  walrus-db sql "SELECT COUNT(*) FROM users WHERE age > 30"
  walrus-db repl
  walrus-db backup myapp-backup-v1

SCHEMA FILE FORMAT (JSON):
{
  "columns": [
    {"name": "id", "type": "integer", "primaryKey": true, "autoIncrement": true},
    {"name": "name", "type": "text", "notNull": true},
    {"name": "email", "type": "text", "unique": true},
    {"name": "created_at", "type": "datetime", "defaultValue": "CURRENT_TIMESTAMP"}
  ]
}

NOTES:
- Data is stored on Walrus decentralized storage
- Local SQLite cache provides fast queries
- All operations are automatically synced to Walrus
- Use backups before major operations

For more help: https://docs.walrus.space
`);
  }
}

// Auto-run if called directly
if (require.main === module) {
  const cli = new WalrusDatabaseCLI();
  cli.run().catch((error) => {
    console.error("❌ CLI Error:", error.message);
    process.exit(1);
  });
}

module.exports = WalrusDatabaseCLI;
