'use strict';

var {DbBase} = require("./dynamoDB_DbBase.js");

class UsersAlexa extends DbBase{
    
    constructor(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits){
        if (!_tableName) _tableName = "UsersAlexa"; 
        super(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits);
    }

    /**
     * Gets an Alexa user by its id
     * @param {string} userId The id of the Alexa skill user
     * @return {Promise<UsersAlexa>}
     */
    async getById(userId){
        if (!userId) throw new Error('userId is required');
        var params = {
            Key: {'UserId': userId}
        };
        return await this.get(params);
    };

    /**
     * Store a new Alexa User
     * @param {UsersAlexa} user The user with all its properties, mainly UserId
     * @return {Promise<void>}
     */
	async put(user, actioner){
        if (!user) throw new Error('user is required');
        return await super.put(user, actioner);
    };
    
    /**
     * Update the attributes of an UserAlexa
     * @param {UsersAlexa} user The user to update
     * @return {Promise<void>}
     */
	async update(user, actioner){
        if (!user) throw new Error('user is required');
        DbBase.__updated(user, actioner);
        var params = {
          Key: {'UserId' : user.UserId},
          UpdateExpression: 'set #attr = :s',
          ExpressionAttributeNames: {'#attr' : 'attributes'},            
          ExpressionAttributeValues: {
            ':s' : user.attributes ? user.attributes : null
          }
        };
        return await super.update(params);
    };
    /**
     * Delete an UserAlexa. Use UserId or the User instance itself
     * @param {Object.<string,UsersAlexa>} user The user or just the userId
     * @return {Promise<void>}
     */
	async delete(user){
        if (!user) throw new Error('user is required');
        var userId =  (typeof user == 'string') ? user : user.UserId;
        var params = {
            Key: {'UserId': userId}
           };
        return await super.delete(params);
    };
    
	createTable(){
        var params = {
            TableName: this.tableName,
            AttributeDefinitions: [
                {AttributeName: "UserId", AttributeType: "S"}
            ], 
            KeySchema: [{AttributeName: "UserId", KeyType: "HASH"}], 
            ProvisionedThroughput: {ReadCapacityUnits: this.readCapacityUnits, WriteCapacityUnits: this.writeCapacityUnits}
        };
        return this.dynamoDBClient.createTable(params).promise();
	};
}

exports.UsersAlexa = UsersAlexa;