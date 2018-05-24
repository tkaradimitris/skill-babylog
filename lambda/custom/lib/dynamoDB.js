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

var DynamoDbHelper = /** @class */ (function () {
    function DynamoDbHelper(config) {
        this.dynamoDBClient = config.dynamoDBClient ? config.dynamoDBClient : new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
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
			this.dynamoDBClient.listTables(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
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
