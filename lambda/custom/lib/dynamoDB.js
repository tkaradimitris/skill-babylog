'use strict';

class Actioner{
    constructor(type, appId, userId){
        this.Type = type;
        this.AppId = appId;
        this.UserId = userId;
    }
}

const util = require('util');
var aws_sdk_1 = require("aws-sdk");

var {IntentLogs} = require("./dynamoDB_IntentLogs.js");
var {UsersAlexa} = require("./dynamoDB_UsersAlexa.js");
var {Babies} = require("./dynamoDB_Babies.js");
var {Measurements} = require("./dynamoDB_Measurements.js");

var DynamoDbHelper = /** @class */ (function () {
    function DynamoDbHelper(config) {
        //console.log('config', util.inspect(config, {showHidden: false, depth: null}));
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
        this.TableNames["Measurements"] = this.prefix + "Measurements";
        this.Actioner = Actioner;

        this.IntentLogs = new IntentLogs(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["IntentLogs"]);
        this.UsersAlexa = new UsersAlexa(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["UsersAlexa"]);
        this.Babies = new Babies(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["Babies"]);
        this.Measurements = new Measurements(this.dynamoDBClient, this.dynamoDBDocumentClient, this.TableNames["Measurements"]);
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

    return DynamoDbHelper;
}());

exports.DynamoDbHelper = DynamoDbHelper;
