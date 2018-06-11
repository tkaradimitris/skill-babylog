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
    
	async scan(limit){
        //we may not specify ProjectionExpression and get all attributes
        //We need to make sure not to name ExpressionAttributeNames
        //not used by #code anywhere, eg filterexpression
        //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property
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
            TableName: this.tableName,
            Limit: limit ? limit : 100
            };
        let self=this;
        var _run = function(){
            return self.dynamoDBClient.scan(params).promise();
        };
        return await this.__execute(_run, this.__resolveItems, this.createTable);
	};
	createTable(){
		return new Promise((resolve, reject) => {
			var params = {
                TableName: this.tableName,
				AttributeDefinitions: [
                    {AttributeName: "BabyId", AttributeType: "S"}
                ], 
				KeySchema: [{AttributeName: "BabyId", KeyType: "HASH"}], 
				ProvisionedThroughput: {ReadCapacityUnits: this.readCapacityUnits, WriteCapacityUnits: this.writeCapacityUnits}
			};
			this.dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
}

exports.Babies = Babies;