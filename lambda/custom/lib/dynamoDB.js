'use strict';

var __execute = async function(_run, _resolve, _create){
    try{        
        var data = await _run();
        if (_resolve)
            return _resolve(data);
        else
            return null;
    }
    catch(err){       
        if(err.code === "ResourceNotFoundException" && _create){
            await _create();
            var data = await _run();
            if (_resolve)
                return _resolve(data);
            else
                return null;
        }
        else throw err;
    }
};
var __resolve = function(data){
    if (data) return data;
    else return null;
};
var __resolveItem = function(data){
    if (data && data.Item) return data.Item;
    else return null;
};
var __resolveItems = function(data){
    if (data && data.Items) return data.Items;
    else return null;
};

class Actioner{
    constructor(type, appId, userId){
        this.Type = type;
        this.AppId = appId;
        this.UserId = userId;
    }
}

var __info = function(){};
__info.created = function(item, actioner){
    if (!item) return false;
    if (!item.attributes) item.attributes = {};
    if (!item.attributes.Info) item.attributes.Info = {};
    if (!item.attributes.Info.Created) item.attributes.Info.Created = (new Date).getTime();
    if (!item.attributes.Info.hasOwnProperty('Changes'))  item.attributes.Info.Changes = 0;
    if (actioner){
        if (actioner.Type) item.attributes.Info.CreatedByType = actioner.Type;
        if (actioner.AppId) item.attributes.Info.CreatedByAppId = actioner.AppId;
        if (actioner.UserId) item.attributes.Info.CreatedByUserId = actioner.UserId;
    }
    return true;
};
__info.updated = function(item, actioner){
    var createdOk = __info.created(item);
    if (!createdOk) {
        return false;
    }

    item.attributes.Info.Updated = (new Date).getTime();
    if (!item.attributes.Info.hasOwnProperty('Changes')) 
        item.attributes.Info.Changes = 1;
    else{
        item.attributes.Info.Changes++;
    }
    if (actioner){
        if (actioner.Type) item.attributes.Info.UpdatedByType = actioner.Type;
        if (actioner.AppId) item.attributes.Info.UpdatedAppId = actioner.AppId;
        if (actioner.UserId) item.attributes.Info.UpdatedUserId = actioner.UserId;
    }
};

var aws_sdk_1 = require("aws-sdk");

var {IntentLogs} = require("./dynamoDB_IntentLogs.js");
var {UsersAlexa} = require("./dynamoDB_UsersAlexa.js");
var {Babies} = require("./dynamoDB_Babies.js");

var Items = function(dynamoDBClient, dynamoDBDocumentClient, tableName, readCapacityUnits, writeCapacityUnits){
    var self = this;
    var tableName = tableName ? tableName : "Items";
    var readCapacityUnits = readCapacityUnits ? readCapacityUnits : 1;
    var writeCapacityUnits = writeCapacityUnits ? writeCapacityUnits : 1;
    var dynamoDBClient = dynamoDBClient;
    var dynamoDBDocumentClient = dynamoDBDocumentClient;
    
    /**
     * Gets an Item by its id
     * @param {string} itemId The id of the item
     * @return {Promise<Item>}
     */
	this.getById = async function(itemId){
        if (!itemId) reject(new Error('itemId is required'));
        var params = {
            TableName: tableName,
            Key: {'ItemId': itemId}
        };
        var _run = function(){
            return dynamoDBDocumentClient.get(params).promise();
        };
        return await __execute(_run, __resolveItem, createTable);
    };
    /**
     * Store a new Item
     * @param {Item} item The item with all its properties, mainly Item
     * @return {Promise<void>}
     */
    this.put = async function(item, actioner){
        if (!item) reject(new Error('item is required'));
        __info.created(item, actioner);
        var params = {
            TableName: tableName,
            Item: item
           };
        var _run = function(){
            return dynamoDBDocumentClient.put(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
    };
    /**
     * Delete an Item. Use ItemId or the Item instance itself
     * @param {Object.<string,Item>} item The item or just the ItemId
     * @return {Promise<void>}
     */
	this.delete = async function(item){
        if (!item) throw new Error('item is required');
        var itemId =  (typeof item == 'string') ? item : item.ItemId;
        var params = {
            TableName: tableName,
            Key: {'ItemId': itemId}
           };
        var _run = function(){
            return dynamoDBDocumentClient.delete(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
	};
    /**
     * Update the attributes of an Item
     * @param {Item} item The item to update
     * @return {Promise<void>}
     */
	this.update = async function(item, actioner){
        if (!item) throw new Error('item is required');
        __info.updated(item, actioner);
        var params = {
          TableName: tableName,
          Key: {'ItemId' : item.ItemId},
          //UpdateExpression: 'set attributes = :s',
          UpdateExpression: 'set #attr = :s',
          ExpressionAttributeNames: {'#attr' : 'attributes'},            
          ExpressionAttributeValues: {
            ':s' : item.attributes ? item.attributes : null
          }
        };
        var _run = function(){
            return dynamoDBDocumentClient.update(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
    };
	this.scan = async function(){
        var params = {
            TableName: tableName,
            Limit: 100
            };
        var _run = function(){
            return dynamoDBClient.scan(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
	};
	var createTable = function(){
		return new Promise((resolve, reject) => {
			var params = {
                TableName: tableName,
				AttributeDefinitions: [
                    {AttributeName: "ItemId", AttributeType: "S"}
                ], 
				KeySchema: [{AttributeName: "ItemId", KeyType: "HASH"}], 
				ProvisionedThroughput: {ReadCapacityUnits: readCapacityUnits, WriteCapacityUnits: writeCapacityUnits}
			};
			dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
};


var Measurements = function(dynamoDBClient, dynamoDBDocumentClient, tableName, readCapacityUnits, writeCapacityUnits){
    var self = this;
    var tableName = tableName ? tableName : "Measurements";
    var readCapacityUnits = readCapacityUnits ? readCapacityUnits : 1;
    var writeCapacityUnits = writeCapacityUnits ? writeCapacityUnits : 1;
    var dynamoDBClient = dynamoDBClient;
    var dynamoDBDocumentClient = dynamoDBDocumentClient;
    
    /**
     * Gets a Measurement by its id and time (when)
     * @param {string} itemId The id of the item
     * @param {epoch} when The epoch of the measurement
     * @return {Promise<Measurements>}
     */
	this.get = async function(itemId, when){
        if (!itemId) throw new Error('itemId is required');
        if (!when) throw new Error('when is required');
        var params = {
            TableName: tableName,
            Key: {'ItemId': itemId, 'When': when}
        };
        var _run = function(){
            return dynamoDBDocumentClient.get(params).promise();
        };
        return await __execute(_run, __resolveItem, createTable);
	};
    /**
     * Store a new Measurement
     * @param {object} item The Measurement with all its properties, mainly ItemId and When
     * @return {Promise<epoch>}
     */
	this.put = async function(item, actioner){
        if (!item) reject(new Error('item is required'));
        __info.created(item, actioner);
        if (!item.When) item.When = (new Date).getTime();
        var params = {
            TableName: tableName,
            Item: item
           };
        var _run = function(){
            return dynamoDBDocumentClient.put(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
    };    
    /**
     * Delete an Measurement. Use ItemId and the epoch of the Measurement (When)
     * @param {string} itemId The id of the item whose measurement to delete
     * @param {number} when The epoch (time) of the item measurement to delete
     * @return {Promise<void>}
     */
	this.delete = async function(itemId, when){
        if (!itemId) throw new Error('itemId is required');
        if (!when) throw new Error('when is required');
        var params = {
            TableName: tableName,
            Key: {'ItemId': itemId, 'When': when}
           };
        var _run = function(){
            return dynamoDBDocumentClient.delete(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
    };
    /**
     * Update the attributes of a Measurement
     * @param {Item} item The item to update
     * @return {Promise<void>}
     */
	this.update = async function(item, actioner){
        if (!item) throw new Error('item is required');
        __info.updated(item, actioner);
        var params = {
          TableName: tableName,
          Key: {'ItemId': item.ItemId, 'When': item.When},
          //UpdateExpression: 'set attributes = :s',
          UpdateExpression: 'set #attr = :s',
          ExpressionAttributeNames: {'#attr' : 'attributes'},            
          ExpressionAttributeValues: {
            ':s' : item.attributes ? item.attributes : null
          }
        };
        var _run = function(){
            return dynamoDBDocumentClient.update(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
    };
	this.scan = async function(itemId, whenFrom, whenTo){
        var params = {
            TableName: tableName,
            Limit: 100
        };
        if (itemId || whenFrom || whenTo){
            if (!params.ExpressionAttributeNames) {
                params.ExpressionAttributeNames = {};
                params.ExpressionAttributeValues = {};
            };
        }
        if (itemId){
            params.ExpressionAttributeNames["#ID"] = 'ItemId';
            params.ExpressionAttributeValues[":a"] = {S: itemId};
            params.FilterExpression = 
                params.FilterExpression ? 
                params.FilterExpression + " AND #ID = :a" :
                    "#ID = :a";
        }
        if (whenFrom){
            params.ExpressionAttributeNames["#WH"] = 'When';
            params.ExpressionAttributeValues[":b"] = {S: whenFrom};
            params.FilterExpression = 
                params.FilterExpression ? 
                params.FilterExpression + " AND #WH >= :b" :
                    "#WH >= :b";
        }
        if (whenTo){
            if (!params.ExpressionAttributeNames["#WH"])
                params.ExpressionAttributeNames["#WH"] = 'When';
            params.ExpressionAttributeValues[":c"] = {S: whenTo};
            params.FilterExpression = 
                params.FilterExpression ? 
                params.FilterExpression + " AND #WH <= :b" :
                    "#WH <= :b";
        }
        var _run = function(){
            return dynamoDBClient.scan(params).promise();
        };
        return await __execute(_run, __resolve, createTable);
	};
	this.scan1 = function(itemId, whenFrom, whenTo){
        //we may not specify ProjectionExpression and get all attributes
        //We need to make sure not to name ExpressionAttributeNames
        //not used by #code anywhere, eg filterexpression
        var params = {
            /*ExpressionAttributeNames: {
            "#ID": "ItemId",
            "#WH": "When"
            }, 
            ExpressionAttributeValues: {
            ":a": {S: itemId}
            }, 
            FilterExpression: "#ID = :a",
            ProjectionExpression: "#WH,UserId,App", */
            TableName: tableName,
            Limit: 100
            };
        if (itemId || whenFrom || whenTo){
            if (!params.ExpressionAttributeNames) {
                params.ExpressionAttributeNames = {};
                params.ExpressionAttributeValues = {};
            };
        }
        if (itemId){
            params.ExpressionAttributeNames["#ID"] = 'ItemId';
            params.ExpressionAttributeValues[":a"] = {S: itemId};
            params.FilterExpression = 
                params.FilterExpression ? 
                params.FilterExpression + " AND #ID = :a" :
                    "#ID = :a";
        }
        if (whenFrom){
            params.ExpressionAttributeNames["#WH"] = 'When';
            params.ExpressionAttributeValues[":b"] = {S: whenFrom};
            params.FilterExpression = 
                params.FilterExpression ? 
                params.FilterExpression + " AND #WH >= :b" :
                    "#WH >= :b";
        }
        if (whenTo){
            if (!params.ExpressionAttributeNames["#WH"])
                params.ExpressionAttributeNames["#WH"] = 'When';
            params.ExpressionAttributeValues[":c"] = {S: whenTo};
            params.FilterExpression = 
                params.FilterExpression ? 
                params.FilterExpression + " AND #WH <= :b" :
                    "#WH <= :b";
        }
		return new Promise((resolve, reject) => {
            //if (!itemid) reject(new Error('item is required'));
			dynamoDBClient.scan(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	var createTable = function(){
		return new Promise((resolve, reject) => {
			var params = {
                TableName: tableName,
				AttributeDefinitions: [
                    {AttributeName: "ItemId", AttributeType: "S"},                    
                    {AttributeName: "When", AttributeType: "N"}
                ], 
				KeySchema: [{AttributeName: "ItemId", KeyType: "HASH"}, {AttributeName: "When", KeyType: "SORT"}], 
				ProvisionedThroughput: {ReadCapacityUnits: readCapacityUnits, WriteCapacityUnits: writeCapacityUnits}
			};
			dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
};

var DynamoDbHelper = /** @class */ (function () {
    function DynamoDbHelper(config) {
        this.dynamoDBClient = config.dynamoDBClient ? config.dynamoDBClient : new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
        this.dynamoDBDocumentClient = new aws_sdk_1.DynamoDB.DocumentClient({
            convertEmptyValues: true,
            service: this.dynamoDBClient,
        });
        this.prefix = config.prefix ? config.prefix + "_" : "";
        this.TableNames = [];
        this.TableNames["IntentLogs"] = this.prefix + "IntentLogs";
        this.TableNames["UsersAlexa"] = this.prefix + "UsersAlexa";
        this.TableNames["Babies"] = this.prefix + "Babies";
        this.TableNames["Items"] = this.prefix + "Items";
        this.TableNames["Measurements"] = this.prefix + "Measurements";
        this.Actioner = Actioner;
        //this.DbBase = DbBase;

        var helpers = {
            executor: __execute, 
            resolver:  {data: __resolve, item: __resolveItem, items: __resolveItems},
            info: __info
        };
        this.IntentLogs = new IntentLogs(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["IntentLogs"]);
        //this.IntentLogs.setHelpers(helpers);

        this.UsersAlexa = new UsersAlexa(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["UsersAlexa"]);
        this.Babies = new Babies(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["Babies"]);
        this.Items = new Items(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["Items"]);
        this.Measurements = new Measurements(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["Measurements"]);
        /*
		this.tableName = config.tableName;
        this.partitionKeyName = config.partitionKeyName ? config.partitionKeyName : 'id';
        this.attributesName = config.attributesName ? config.attributesName : 'attributes';
        this.createTable = config.createTable === true;
        this.partitionKeyGenerator = config.partitionKeyGenerator ? config.partitionKeyGenerator : PartitionKeyGenerators_1.PartitionKeyGenerators.userId;
        this.dynamoDBDocumentClient = new aws_sdk_1.DynamoDB.DocumentClient({
            convertEmptyValues: true,
            service: this.dynamoDBClient,
        });
		*/
    }
    
	DynamoDbHelper.sampleStaticMethod = function(){console.log('called static listTables'); return {some: "123"};};
	DynamoDbHelper.prototype.listTables = function(){
		return new Promise((resolve, reject) => {
			var params = {};
            this.dynamoDBClient.listTables
            (params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
    };
	DynamoDbHelper.prototype.listTablesCb = function(callback){
        var params = {};
        if (!callback) callback = function(err, data){};
        this.dynamoDBClient.listTables(params, callback);
	};
	DynamoDbHelper.prototype.createTable = function(tableName){
		return new Promise((resolve, reject) => {
			if (!tableName) reject(new Error('table name is required'));
			var params = {
				AttributeDefinitions: [{AttributeName: "Artist", AttributeType: "S"}, {AttributeName: "SongTitle", AttributeType: "S"}], 
				KeySchema: [{AttributeName: "Artist", KeyType: "HASH"}, {AttributeName: "SongTitle", KeyType: "RANGE"}], 
				ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}, 
				TableName: tableName
			};
			this.dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	DynamoDbHelper.prototype.createTableItemMeasurements = function(){
		return new Promise((resolve, reject) => {
            var tableName = this.TableNames["ItemMeasurements"];
			var params = {
				AttributeDefinitions: [
                    {AttributeName: "ItemId", AttributeType: "S"}, 
                    {AttributeName: "When", AttributeType: "N"}
                ], 
				KeySchema: [{AttributeName: "ItemId", KeyType: "HASH"}, {AttributeName: "When", KeyType: "RANGE"}], 
				ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}, 
				TableName: tableName
			};
			this.dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	DynamoDbHelper.prototype.addItemMeasurement = function(item){
		return new Promise((resolve, reject) => {
            var tableName = this.TableNames["ItemMeasurements"];
            if (!tableName) reject(new Error('table name is required'));
            if (!item) reject(new Error('item is required'));
            var params = {
                Item: {
                    "ItemId": {S: item.ItemId}, 
                    "When": {N: item.When + ""}
                }, 
                ReturnConsumedCapacity: "TOTAL", 
                ReturnItemCollectionMetrics: "SIZE",
                ReturnValues: "NONE", /* NONE | ALL_OLD=only for values overwritten */
                TableName: tableName
               };
            if (item.UserId) params.Item["UserId"] = {S: item.UserId};
            if (item.App) params.Item["App"] = {S: item.App};
            //console.log('add:');
            //console.log(params);
			this.dynamoDBClient.putItem(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	DynamoDbHelper.prototype.queryItemMeasurements = function(itemId, since){
        //var tableName = 'ItemMeasurements';
        var tableName = this.TableNames["ItemMeasurements"];
        //we may not specify ProjectionExpression and get all attributes
        //We need to make sure not to name ExpressionAttributeNames
        //not used by #code anywhere, eg filterexpression
        var params = {
            ExpressionAttributeNames: {
            "#ID": "ItemId",
            "#WH": "When"
            }, 
            ExpressionAttributeValues: {
            ":a": {S: itemId}
            }, 
            KeyConditionExpression: "#ID = :a",
            ProjectionExpression: "#WH,UserId,App", 
            TableName: tableName
            };
        //conditionally add extra filters
        if (since) {
            params.ExpressionAttributeValues[":t"] = {N: since + ""};
            params.KeyConditionExpression += " AND #WH >= :t";
        }
		return new Promise((resolve, reject) => {
            //if (!itemid) reject(new Error('item is required'));
			this.dynamoDBClient.query(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	DynamoDbHelper.prototype.scanItemMeasurements = function(itemId, since){
        var tableName = this.TableNames["ItemMeasurements"];
        //we may not specify ProjectionExpression and get all attributes
        //We need to make sure not to name ExpressionAttributeNames
        //not used by #code anywhere, eg filterexpression
        var params = {
            ExpressionAttributeNames: {
            "#ID": "ItemId",
            "#WH": "When"
            }, 
            ExpressionAttributeValues: {
            ":a": {S: itemId}
            }, 
            FilterExpression: "#ID = :a",
            ProjectionExpression: "#WH,UserId,App", 
            TableName: tableName
            };
        //conditionally add extra filters
        if (since) {
            params.ExpressionAttributeValues[":t"] = {N: since + ""};
            params.FilterExpression += " AND #WH >= :t";
        }
		return new Promise((resolve, reject) => {
            //if (!itemid) reject(new Error('item is required'));
			this.dynamoDBClient.scan(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	DynamoDbHelper.prototype.deleteTable = function(tableName){
		return new Promise((resolve, reject) => {
			if (!tableName) reject(new Error('table name is required'));
			var params = {TableName: tableName};
			this.dynamoDBClient.deleteTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	DynamoDbHelper.prototype.samplePromise = function(){
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				var data = {TableNames: ["Forum", "ProductCatalog","Reply", "Thread"]};
				resolve(data);
			}, 500);
		});
	};
	DynamoDbHelper.prototype.sampleInstaceMethod = function(){
		var data = {
				TableNames: [
				   "Forum", 
				   "ProductCatalog", 
				   "Reply", 
				   "Thread"
				]
			   };
			   return data;
		/*
        return __awaiter(this, void 0, void 0, function () {
			var params = {
			};
			dynamoDbClient.listTables(params, function(err, data) {
			   if (err) console.log(err, err.stack); // an error occurred
			   else{
				console.log('tables list:');
				console.log(data);           // successful response
			   }
			 });
			   //data = {TableNames: ["Forum", "ProductCatalog","Reply", "Thread"]}
        });
		*/
	};
    /**
     * Retrieves persistence attributes from AWS DynamoDB.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @returns {Promise<Object.<string, any>>}
     */
    DynamoDbHelper.prototype.getAttributes = function (requestEnvelope) {
        return __awaiter(this, void 0, void 0, function () {
            var attributesId, getParams, data, err_1, createTableParams, createTableErr_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    //prepare params
                    case 0:
                        attributesId = this.partitionKeyGenerator(requestEnvelope);
                        getParams = {
                            Key: (_a = {},
                                _a[this.partitionKeyName] = attributesId,
                                _a),
                            TableName: this.tableName,
                        };
                        _b.label = 1;
                    //execute command
                    case 1:
                         //1=this, 3=create, null=?, 9=return
                        _b.trys.push([1, 3, , 9]);
                        return [4 /*yield*/, this.dynamoDBDocumentClient.get(getParams).promise()];
                    case 2:
                        data = _b.sent();
                        return [3 /*break*/, 9];
                    //capture error, check for table not found
                    case 3:
                        err_1 = _b.sent();
                        //not table not found? return same as case 2
                        if (!(err_1.code === 'ResourceNotFoundException' && this.createTable)) return [3 /*break*/, 8];
                        //prepare params to create table
                        createTableParams = {
                            AttributeDefinitions: [{
                                    AttributeName: this.partitionKeyName,
                                    AttributeType: 'S',
                                }],
                            KeySchema: [{
                                    AttributeName: this.partitionKeyName,
                                    KeyType: 'HASH',
                                }],
                            ProvisionedThroughput: {
                                ReadCapacityUnits: 5,
                                WriteCapacityUnits: 5,
                            },
                            TableName: this.tableName,
                        };
                        _b.label = 4;
                    //create table
                    case 4:
                        //4=this, 6=create error, null=?, 7=return{}
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.dynamoDBClient.createTable(createTableParams).promise()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    //create table failed
                    case 6:
                        createTableErr_1 = _b.sent();
                        throw AskSdkUtils_1.createAskSdkError(this.constructor.name, "Could not create table (" + this.tableName + "): " + createTableErr_1.message);
                    case 7: return [2 /*return*/, {}];
                    //failed to read item
                    case 8: throw AskSdkUtils_1.createAskSdkError(this.constructor.name, "Could not read item (" + attributesId + ") from table (" + getParams.TableName + "): " + err_1.message);
                    //return item
                    case 9:
                        if (!Object.keys(data).length) {
                            return [2 /*return*/, {}];
                        }
                        else {
                            return [2 /*return*/, data.Item[this.attributesName]];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Saves persistence attributes to AWS DynamoDB.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @param {Object.<string, any>} attributes Attributes to be saved to DynamoDB.
     * @return {Promise<void>}
     */
    DynamoDbHelper.prototype.saveAttributes = function (requestEnvelope, attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var attributesId, putParams, err_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        attributesId = this.partitionKeyGenerator(requestEnvelope);
                        putParams = {
                            Item: (_a = {},
                                _a[this.partitionKeyName] = attributesId,
                                _a[this.attributesName] = attributes,
                                _a),
                            TableName: this.tableName,
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dynamoDBDocumentClient.put(putParams).promise()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _b.sent();
                        throw AskSdkUtils_1.createAskSdkError(this.constructor.name, "Could not save item (" + attributesId + ") to table (" + putParams.TableName + "): " + err_2.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return DynamoDbHelper;
}());

exports.DynamoDbHelper = DynamoDbHelper;
