'use strict';

const util = require('util');
var {DbBase} = require("./dynamoDB_DbBase.js");

class IntentLogs extends DbBase{
    
    constructor(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits){
        if (!_tableName) _tableName = "IntentLogs"; 
        super(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits);
    }

    /**
     * Gets an IntentLog by its created
     * @param {number} created The created of the IntentLogs
     * @return {Promise<IntentLogs>}
     */
    async getByCreated(created){
        if (!created) throw new Error('created is required');
        var params = {
            Key: {'Created': created}
        };
        //return await Object.call(this, 'get', params);
        //return await this.get(params);
        return await super.get(params);
    };

    /**
     * Store a new intent log
     * @param {IntentLog} item The log with all its properties, mainly Created
     * @return {Promise<void>}
     */
	async put(item, actioner){
        if (!item) throw new Error('item is required');
        return await super.put(item, actioner);
    };
    
    /**
     * Delete an intent log. Use Created or the IntentLog instance itself
     * @param {Object.<number,IntentLog>} item The IntentLog or just the Created
     * @return {Promise<void>}
     */
	async delete(item){
        if (!item) throw new Error('item is required');
        var created =  (typeof item == 'number') ? item : item.Created;
        var params = {
            //TableName: this.tableName,
            Key: {'Created': created}
           };
        return await super.delete(params);
        // let self=this;
        // var _run = function(){
        //     return self.dynamoDBDocumentClient.delete(params).promise();
        // };
        // return await this.__execute(_run, this.__resolve, this.createTable);
    };
    
	createTable(){
        //console.log(util.inspect(this, {showHidden: false, depth: null}));
        var params = {
            TableName: this.tableName,
            AttributeDefinitions: [
                {AttributeName: "Created", AttributeType: "N"}
            ], 
            KeySchema: [{AttributeName: "Created", KeyType: "HASH"}], 
            ProvisionedThroughput: {ReadCapacityUnits: this.readCapacityUnits, WriteCapacityUnits: this.writeCapacityUnits}
        };
        return this.dynamoDBClient.createTable(params).promise();
	};
}

exports.IntentLogs = IntentLogs;