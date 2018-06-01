'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

var aws_sdk_1 = require("aws-sdk");

var UsersAlexa = function(dynamoDBClient, dynamoDBDocumentClient, tableName){
    var self = this;
    this.tableName = tableName ? tableName : "UsersAlexa";
    this.dynamoDBClient = dynamoDBClient;
    this.dynamoDBDocumentClient = dynamoDBDocumentClient;
    
    /**
     * Gets an Alexa user by its id
     * @param {string} userId The id of the Alexa skill user
     * @return {Promise<void>}
     */
	this.getById = function(userId){
        //we may not specify ProjectionExpression and get all attributes
        //We need to make sure not to name ExpressionAttributeNames
        //not used by #code anywhere, eg filterexpression
        var params = {
         TableName: self.tableName,
         Key: {'UserId': userId}
        };
        //conditionally add extra filters
		return new Promise((resolve, reject) => {
			self.dynamoDBDocumentClient.get(params, function(err, data) {
			   if (err) {
                   //if table does not exist, create it
                   if(err.code === "ResourceNotFoundException"){
                        createTable()
                            .then(function(result){
                                resolve({});
                            })
                            .catch(function(err){
                                reject(err);
                            });
                   }
                   else
                    reject(err); // an error occurred
               }
			   else {
                    if (data && data.Item) resolve(data.Item);
                    else resolve(null);
               }
			 });
		});
	};
    /**
     * Store a new Alexa User
     * @param {object} user The user with all its properties, mainly UserId
     * @return {Promise<object>}
     */
	this.put = function(user){
		return new Promise((resolve, reject) => {
            if (!user) reject(new Error('user is required'));
            if (!user.Info) user.Info = {};
            if (!user.Info.Created) user.Info.Created = (new Date).getTime();
            if (!user.Info.Changes) user.Info.Changes = 0;
            var params = {
                Item: user,
                TableName: self.tableName
               };
            //reject(new Error("test error on put"));
			this.dynamoDBDocumentClient.put(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	this.updateItems = function(user){
		return new Promise((resolve, reject) => {
            if (!user) reject(new Error('user is required'));
            if (!user.Info) user.Info = {};
            user.Info.Updated = (new Date).getTime();
            if (!user.Info.Changes) user.Info.Changes = 1;
            var params = {
              TableName: self.tableName,
              Key: {'UserId' : user.UserId},
              UpdateExpression: 'set Items = :s, Info = :i', //Updated = :u',
              ExpressionAttributeValues: {
                ':i' : user.Info,
                ':s' : user.Items
              }
            };
			this.dynamoDBDocumentClient.update(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	this.update = function(user){
		return new Promise((resolve, reject) => {
            if (!user) reject(new Error('user is required'));
            user.Updated = (new Date).getTime();
            var params = {
              TableName: self.tableName,
              Key: {'UserId' : user.UserId},
              UpdateExpression: 'set Skill = :s', //Updated = :u',
              ExpressionAttributeValues: {
                //':u' : user.Updated,
                ':s' : user.Skill
              }
            };
			this.dynamoDBDocumentClient.update(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	var createTable = function(){
		return new Promise((resolve, reject) => {
			var params = {
				AttributeDefinitions: [
                    {AttributeName: "UserId", AttributeType: "S"}
                ], 
				KeySchema: [{AttributeName: "UserId", KeyType: "HASH"}], 
				ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}, 
				TableName: self.tableName
			};
			self.dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
};

var Items = function(dynamoDBClient, dynamoDBDocumentClient, tableName){
    var self = this;
    this.tableName = tableName ? tableName : "Items";
    this.dynamoDBClient = dynamoDBClient;
    this.dynamoDBDocumentClient = dynamoDBDocumentClient;
    
    /**
     * Gets an Item by its id
     * @param {string} itemId The id of the item
     * @return {Promise<void>}
     */
	this.getById = function(itemId){
        //we may not specify ProjectionExpression and get all attributes
        //We need to make sure not to name ExpressionAttributeNames
        //not used by #code anywhere, eg filterexpression
        var params = {
         TableName: self.tableName,
         Key: {'ItemId': itemId}
        };
        //conditionally add extra filters
		return new Promise((resolve, reject) => {
			self.dynamoDBDocumentClient.get(params, function(err, data) {
			   if (err) {
                   //if table does not exist, create it
                   if(err.code === "ResourceNotFoundException"){
                        createTable()
                            .then(function(result){
                                resolve({});
                            })
                            .catch(function(err){
                                reject(err);
                            });
                   }
                   else
                    reject(err); // an error occurred
               }
			   else {
                    if (data && data.Item) resolve(data.Item);
                    else resolve(null);
               }
			 });
		});
	};
    /**
     * Store a new Item
     * @param {object} item The Item with all its properties, mainly ItemId and Label     * @return {Promise<object>}
     */
	this.put = function(item){
		return new Promise((resolve, reject) => {
            if (!item) reject(new Error('item is required'));
            if (!item.Info) item.Info = {};
            if (!item.Info.Created) item.Info.Created = (new Date).getTime();
            var params = {
                Item: item,
                TableName: self.tableName
               };
            //reject(new Error("test error on put"));
			this.dynamoDBDocumentClient.put(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	this.update = function(item){
		return new Promise((resolve, reject) => {
            if (!item) reject(new Error('item is required'));
            item.Updated = (new Date).getTime();
            var params = {
              TableName: self.tableName,
              Key: {'ItemId' : user.ItemId},
              UpdateExpression: 'set Skill = :s', //Updated = :u',
              ExpressionAttributeValues: {
                //':u' : user.Updated,
                ':s' : user.Skill
              }
            };
			this.dynamoDBDocumentClient.update(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
	var createTable = function(){
		return new Promise((resolve, reject) => {
			var params = {
				AttributeDefinitions: [
                    {AttributeName: "ItemId", AttributeType: "S"}
                ], 
				KeySchema: [{AttributeName: "ItemId", KeyType: "HASH"}], 
				ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}, 
				TableName: self.tableName
			};
			self.dynamoDBClient.createTable(params, function(err, data) {
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
        this.TableNames = [];
        this.TableNames["ItemMeasurements"] = "ItemMeasurements";
        this.TableNames["UsersAlexa"] = "UsersAlexa";
        this.TableNames["Items"] = "Items";
        this.UsersAlexa = new UsersAlexa(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["UsersAlexa"]);
        this.Items = new Items(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["Items"]);
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
                    case 0:
                        attributesId = this.partitionKeyGenerator(requestEnvelope);
                        getParams = {
                            Key: (_a = {},
                                _a[this.partitionKeyName] = attributesId,
                                _a),
                            TableName: this.tableName,
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 9]);
                        return [4 /*yield*/, this.dynamoDBDocumentClient.get(getParams).promise()];
                    case 2:
                        data = _b.sent();
                        return [3 /*break*/, 9];
                    case 3:
                        err_1 = _b.sent();
                        if (!(err_1.code === 'ResourceNotFoundException' && this.createTable)) return [3 /*break*/, 8];
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
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.dynamoDBClient.createTable(createTableParams).promise()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        createTableErr_1 = _b.sent();
                        throw AskSdkUtils_1.createAskSdkError(this.constructor.name, "Could not create table (" + this.tableName + "): " + createTableErr_1.message);
                    case 7: return [2 /*return*/, {}];
                    case 8: throw AskSdkUtils_1.createAskSdkError(this.constructor.name, "Could not read item (" + attributesId + ") from table (" + getParams.TableName + "): " + err_1.message);
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
