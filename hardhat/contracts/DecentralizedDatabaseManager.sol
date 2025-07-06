// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DecentralizedDatabaseManager
 * @notice This contract manages database permissions and metadata for decentralized storage.
 * @dev IMPORTANT: All data on blockchain is publicly readable. This contract provides:
 *      - Write permission enforcement (who can modify data)
 *      - Metadata organization and provenance
 *      - Data integrity verification
 *      For true data privacy, use encrypted data on IPFS with off-chain key management.
 */
contract DecentralizedDatabaseManager {
    
    // Events
    event DatabaseCreated(uint256 indexed dbId, address indexed owner, string name);
    event TableCreated(uint256 indexed dbId, string indexed tableName, string schemaHash);
    event TableUpdated(uint256 indexed dbId, string indexed tableName, string schemaHash);
    event DataSubmitted(uint256 indexed dbId, string indexed tableName, string dataHash, address indexed submitter);
    event WritePermissionGranted(uint256 indexed dbId, address indexed user);
    event WritePermissionRevoked(uint256 indexed dbId, address indexed user);
    event AdminPermissionGranted(uint256 indexed dbId, address indexed user);
    event AdminPermissionRevoked(uint256 indexed dbId, address indexed user);
    
    // Structs
    struct Database {
        uint256 id;
        string name;
        address owner;
        bool exists;
        string metadataHash; // IPFS hash for database metadata
        uint256 createdAt;
        bool isPublic; // If true, anyone can read; if false, only for organization
    }
    
    struct Table {
        string name;
        string schemaHash; // IPFS hash for table schema definition
        string[] dataHashes; // Array of IPFS hashes for data records
        address[] contributors; // Track who submitted each data record
        bool exists;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct UserPermission {
        bool canWrite;
        bool canAdmin;
    }
    
    // State variables
    uint256 private nextDbId = 1;
    mapping(uint256 => Database) public databases;
    mapping(uint256 => mapping(string => Table)) public tables; // dbId => tableName => Table
    mapping(uint256 => mapping(address => UserPermission)) public permissions; // dbId => user => permissions
    mapping(uint256 => string[]) public databaseTables; // dbId => table names array
    mapping(address => uint256[]) public userDatabases; // user => database IDs they own
    
    // Modifiers
    modifier onlyDatabaseOwner(uint256 _dbId) {
        require(databases[_dbId].exists, "Database does not exist");
        require(databases[_dbId].owner == msg.sender, "Only database owner can perform this action");
        _;
    }
    
    modifier canWrite(uint256 _dbId) {
        require(databases[_dbId].exists, "Database does not exist");
        require(
            databases[_dbId].owner == msg.sender || 
            permissions[_dbId][msg.sender].canWrite,
            "No write permission"
        );
        _;
    }
    
    modifier canAdmin(uint256 _dbId) {
        require(databases[_dbId].exists, "Database does not exist");
        require(
            databases[_dbId].owner == msg.sender || 
            permissions[_dbId][msg.sender].canAdmin,
            "No admin permission"
        );
        _;
    }
    
    modifier databaseExists(uint256 _dbId) {
        require(databases[_dbId].exists, "Database does not exist");
        _;
    }
    
    // Database management functions
    function createDatabase(
        string memory _name, 
        string memory _metadataHash,
        bool _isPublic
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Database name cannot be empty");
        require(bytes(_metadataHash).length > 0, "Metadata hash cannot be empty");
        
        uint256 dbId = nextDbId++;
        
        databases[dbId] = Database({
            id: dbId,
            name: _name,
            owner: msg.sender,
            exists: true,
            metadataHash: _metadataHash,
            createdAt: block.timestamp,
            isPublic: _isPublic
        });
        
        userDatabases[msg.sender].push(dbId);
        
        emit DatabaseCreated(dbId, msg.sender, _name);
        return dbId;
    }
    
    function updateDatabaseMetadata(uint256 _dbId, string memory _metadataHash) 
        external 
        onlyDatabaseOwner(_dbId) 
    {
        require(bytes(_metadataHash).length > 0, "Metadata hash cannot be empty");
        databases[_dbId].metadataHash = _metadataHash;
    }
    
    function setDatabasePublic(uint256 _dbId, bool _isPublic) 
        external 
        onlyDatabaseOwner(_dbId) 
    {
        databases[_dbId].isPublic = _isPublic;
    }
    
    // Permission management functions (only for write/admin permissions)
    function grantWritePermission(uint256 _dbId, address _user) 
        external 
        canAdmin(_dbId) 
    {
        require(_user != address(0), "Invalid user address");
        permissions[_dbId][_user].canWrite = true;
        emit WritePermissionGranted(_dbId, _user);
    }
    
    function revokeWritePermission(uint256 _dbId, address _user) 
        external 
        canAdmin(_dbId) 
    {
        require(_user != address(0), "Invalid user address");
        require(_user != databases[_dbId].owner, "Cannot revoke owner permissions");
        permissions[_dbId][_user].canWrite = false;
        emit WritePermissionRevoked(_dbId, _user);
    }
    
    function grantAdminPermission(uint256 _dbId, address _user) 
        external 
        canAdmin(_dbId) 
    {
        require(_user != address(0), "Invalid user address");
        permissions[_dbId][_user].canAdmin = true;
        emit AdminPermissionGranted(_dbId, _user);
    }
    
    function revokeAdminPermission(uint256 _dbId, address _user) 
        external 
        canAdmin(_dbId) 
    {
        require(_user != address(0), "Invalid user address");
        require(_user != databases[_dbId].owner, "Cannot revoke owner permissions");
        permissions[_dbId][_user].canAdmin = false;
        emit AdminPermissionRevoked(_dbId, _user);
    }
    
    // Table management functions
    function createTable(uint256 _dbId, string memory _tableName, string memory _schemaHash) 
        external 
        canAdmin(_dbId) 
    {
        require(bytes(_tableName).length > 0, "Table name cannot be empty");
        require(bytes(_schemaHash).length > 0, "Schema hash cannot be empty");
        require(!tables[_dbId][_tableName].exists, "Table already exists");
        
        tables[_dbId][_tableName] = Table({
            name: _tableName,
            schemaHash: _schemaHash,
            dataHashes: new string[](0),
            contributors: new address[](0),
            exists: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        databaseTables[_dbId].push(_tableName);
        
        emit TableCreated(_dbId, _tableName, _schemaHash);
    }
    
    function updateTableSchema(uint256 _dbId, string memory _tableName, string memory _schemaHash) 
        external 
        canAdmin(_dbId) 
    {
        require(tables[_dbId][_tableName].exists, "Table does not exist");
        require(bytes(_schemaHash).length > 0, "Schema hash cannot be empty");
        
        tables[_dbId][_tableName].schemaHash = _schemaHash;
        tables[_dbId][_tableName].updatedAt = block.timestamp;
        
        emit TableUpdated(_dbId, _tableName, _schemaHash);
    }
    
    // Data management functions
    function submitData(uint256 _dbId, string memory _tableName, string memory _dataHash) 
        external 
        canWrite(_dbId) 
    {
        require(tables[_dbId][_tableName].exists, "Table does not exist");
        require(bytes(_dataHash).length > 0, "Data hash cannot be empty");
        
        tables[_dbId][_tableName].dataHashes.push(_dataHash);
        tables[_dbId][_tableName].contributors.push(msg.sender);
        tables[_dbId][_tableName].updatedAt = block.timestamp;
        
        emit DataSubmitted(_dbId, _tableName, _dataHash, msg.sender);
    }
    
    // Public query functions (anyone can read - blockchain is public anyway)
    function getDatabase(uint256 _dbId) external view returns (Database memory) {
        require(databases[_dbId].exists, "Database does not exist");
        return databases[_dbId];
    }
    
    function getTable(uint256 _dbId, string memory _tableName) 
        external 
        view 
        databaseExists(_dbId)
        returns (Table memory) 
    {
        require(tables[_dbId][_tableName].exists, "Table does not exist");
        return tables[_dbId][_tableName];
    }
    
    function getTableDataHashes(uint256 _dbId, string memory _tableName) 
        external 
        view 
        databaseExists(_dbId)
        returns (string[] memory) 
    {
        require(tables[_dbId][_tableName].exists, "Table does not exist");
        return tables[_dbId][_tableName].dataHashes;
    }
    
    function getTableContributors(uint256 _dbId, string memory _tableName) 
        external 
        view 
        databaseExists(_dbId)
        returns (address[] memory) 
    {
        require(tables[_dbId][_tableName].exists, "Table does not exist");
        return tables[_dbId][_tableName].contributors;
    }
    
    function getDatabaseTables(uint256 _dbId) 
        external 
        view 
        databaseExists(_dbId)
        returns (string[] memory) 
    {
        return databaseTables[_dbId];
    }
    
    function getUserDatabases(address _user) external view returns (uint256[] memory) {
        return userDatabases[_user];
    }
    
    function getUserPermissions(uint256 _dbId, address _user) 
        external 
        view 
        databaseExists(_dbId)
        returns (bool canWrite, bool canAdmin) 
    {
        // Owner has all permissions
        if (databases[_dbId].owner == _user) {
            return (true, true);
        }
        
        UserPermission memory userPerm = permissions[_dbId][_user];
        return (userPerm.canWrite, userPerm.canAdmin);
    }
    
    function getTotalDatabases() external view returns (uint256) {
        return nextDbId - 1;
    }
    
    // Utility functions for data verification
    function verifyDataSubmission(uint256 _dbId, string memory _tableName, uint256 _index) 
        external 
        view 
        returns (string memory dataHash, address contributor, uint256 timestamp) 
    {
        require(tables[_dbId][_tableName].exists, "Table does not exist");
        require(_index < tables[_dbId][_tableName].dataHashes.length, "Invalid index");
        
        return (
            tables[_dbId][_tableName].dataHashes[_index],
            tables[_dbId][_tableName].contributors[_index],
            tables[_dbId][_tableName].updatedAt
        );
    }
}