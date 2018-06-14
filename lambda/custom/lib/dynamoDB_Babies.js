'use strict';

var {DbBase} = require("./dynamoDB_DbBase.js");

class Babies extends DbBase{
    
    constructor(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits){
        if (!_tableName) _tableName = "Babies"; 
        super(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits);
    }

    /**
     * Gets a Baby by its id
     * @param {string} babyId The id of the Baby
     * @return {Promise<Baby>}
     */
    async getById(babyId){
        if (!babyId) throw new Error('babyId is required');
        var params = {
            Key: {'BabyId': babyId}
        };
        return await this.get(params);
    };

    /**
     * Store a new Baby
     * @param {Baby} baby The Baby with all its properties, mainly BabyId
     * @return {Promise<void>}
     */
	async put(baby, actioner){
        if (!baby) throw new Error('baby is required');
        return await super.put(baby, actioner);
    };
    
    /**
     * Update the attributes of a Baby
     * @param {Baby} baby The Baby to update
     * @return {Promise<void>}
     */
	async update(baby, actioner){
        if (!baby) throw new Error('baby is required');
        DbBase.__updated(baby, actioner);
        var params = {
          Key: {'BabyId' : baby.BabyId},
          UpdateExpression: 'set #attr = :s',
          ExpressionAttributeNames: {'#attr' : 'attributes'},            
          ExpressionAttributeValues: {
            ':s' : baby.attributes ? baby.attributes : null
          }
        };
        return await super.update(params);
    };

    /**
     * Delete a Baby. Use BabyId or the Baby instance itself
     * @param {Object.<string,Baby>} baby The Baby or just the BabyId
     * @return {Promise<void>}
     */
	async delete(baby){
        if (!baby) throw new Error('baby is required');
        var babyId =  (typeof baby == 'string') ? baby : baby.BabyId;
        var params = {
            Key: {'BabyId': babyId}
           };
        return await super.delete(params);
    };
    
	createTable(){
        var params = {
            TableName: this.tableName,
            AttributeDefinitions: [
                {AttributeName: "BabyId", AttributeType: "S"}
            ], 
            KeySchema: [{AttributeName: "BabyId", KeyType: "HASH"}], 
            ProvisionedThroughput: {ReadCapacityUnits: this.readCapacityUnits, WriteCapacityUnits: this.writeCapacityUnits}
        };
        return this.dynamoDBClient.createTable(params).promise();
	};
}

exports.Babies = Babies;