'use strict';

var {DbBase} = require("./dynamoDB_DbBase.js");

class Measurements extends DbBase{
    
    constructor(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits){
        if (!_tableName) _tableName = "Measurements"; 
        super(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits);
    }

    /**
     * Gets a Measurment by its id and when
     * @param {string} itemId The id of the Measurement
     * @param {number} when The epoch of the Measurement
     * @return {Promise<Baby>}
     */
    async get(itemId, when){
        if (!itemId) throw new Error('itemId is required');
        if (!when) throw new Error('when is required');
        var params = {
            Key: {'ItemId': itemId, 'When': when}
        };
        return await super.get(params);
    };

    /**
     * Store a new Measurment
     * @param {Measurment} measurement The Measurment with all its properties, mainly ItemId and When
     * @param {Object} actioner Details about the person and app used to perform the action
     * @return {Promise<void>}
     */
	async put(measurement, actioner){
        if (!measurement) throw new Error('measurement is required');
        return await super.put(measurement, actioner);
    };
    
    /**
     * Update the attributes of a Measurment
     * @param {Measurment} measurement The Measurment with all its properties, mainly ItemId and When
     * @param {Object} actioner Details about the person and app used to perform the action
     * @return {Promise<void>}
     */
	async update(measurement, actioner){
        if (!measurement) throw new Error('measurement is required');
        if (!measurement.ItemId) throw new Error('measurement.ItemId is required');
        if (!measurement.When) throw new Error('measurement.When is required');
        DbBase.__updated(measurement, actioner);
        var params = {
          Key: {'ItemId' : measurement.ItemId, 'When': measurement.When},
          UpdateExpression: 'set #attr = :s',
          ExpressionAttributeNames: {'#attr' : 'attributes'},            
          ExpressionAttributeValues: {
            ':s' : measurement.attributes ? measurement.attributes : null
          }
        };
        return await super.update(params);
    };

    /**
     * Delete a Measurment. Use Id and When
     * @param {Object<string,Measurement>} measurement The Measurment with all its properties, mainly ItemId and When, or just the ItemId
     * @return {Promise<void>}
     */
	async delete(measurement){
        if (!measurement) throw new Error('measurement is required');
        var id = null;
        var when = null;
        if (typeof measurement == "object"){
            if (!measurement.ItemId) throw new Error('measurement.ItemId is required');
            if (!measurement.When) throw new Error('measurement.When is required');
            id = measurement.ItemId;
            when = measurement.When;
        }
        else{
            id = measurement;
            if (!arguments[1]) throw new Error('arguments[1] must be set to When when the 1st argument is the ItemId');
            when = arguments[1];
        }
        var params = {
            Key: {'ItemId' : id, 'When': when},
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
                    {AttributeName: "ItemId", AttributeType: "S"},
                    {AttributeName: "When", AttributeType: "N"}
                ], 
                KeySchema: [
                    {AttributeName: "ItemId", KeyType: "HASH"},
                    {AttributeName: "When", KeyType: "SORT"}
                ], 
				ProvisionedThroughput: {ReadCapacityUnits: this.readCapacityUnits, WriteCapacityUnits: this.writeCapacityUnits}
			};
			this.dynamoDBClient.createTable(params, function(err, data) {
			   if (err) reject(err); // an error occurred
			   else resolve(data);
			 });
		});
	};
}

exports.Measurements = Measurements;