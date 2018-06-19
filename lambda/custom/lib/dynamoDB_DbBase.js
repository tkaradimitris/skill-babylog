'use strict';

class DbBase{

    constructor(_dynamoDBClient, _dynamoDBDocumentClient, _tableName, _readCapacityUnits, _writeCapacityUnits){
        this.tableName = _tableName ? _tableName : "DbBaseTable";
        this.readCapacityUnits = _readCapacityUnits ? _readCapacityUnits : 1;
        this.writeCapacityUnits = _writeCapacityUnits ? _writeCapacityUnits : 1;
        this.dynamoDBClient = _dynamoDBClient;
        this.dynamoDBDocumentClient = _dynamoDBDocumentClient;
    }    

    /**
     * Gets a record
     * @param {string} params The dynamoDB params. We may not specify TableName, as I do it for you
     * @return {Promise<Object>}
     */
    async get(params){
        if (!params) throw new Error('params are required');
        params.TableName = this.tableName;
        let self=this;
        var _run = function(){
            return self.dynamoDBDocumentClient.get(params).promise();
        };
        return await this.__execute(_run, this.__resolveItem, this.createTable.bind(this));
    };

    /**
     * Store a item
     * @param {object} item The item to store
     * @return {Promise<void>}
     */
	async put(item, actioner){
        if (!item) throw new Error('item is required');
        DbBase.__created(item, actioner);
        var params = {
            TableName: this.tableName,
            Item: item
           };
        let self=this;
        var _run = function(){
            return self.dynamoDBDocumentClient.put(params).promise();
        };
        return await this.__execute(_run, this.__resolve, this.createTable.bind(this));
    };
    
    /**
     * Update the attributes of an Item
     * @param {object} params The dynamoDB params. We may not specify TableName, as I do it for you
     * @return {Promise<void>}
     */
	async update(params){
        if (!params) throw new Error('params are required');
        params.TableName = this.tableName;
        let self=this;
        var _run = function(){
            return self.dynamoDBDocumentClient.update(params).promise();
        };
        return await this.__execute(_run, this.__resolve, this.createTable.bind(this));
    };
    
    /**
     * Get multiple items at batch
     * @param {object} params The dynamoDB params. We may not specify TableName, as I do it for you
     * @return {Promise<Baby[]>}
     */
	async batchGet(params){
        if (!params) throw new Error('params are required');
        //params.TableName = this.tableName;
        let self=this;
        var _run = function(){
            return self.dynamoDBDocumentClient.batchGet(params).promise();
        };
        return await this.__execute(_run, this.__resolveGetBatch.bind(this), this.createTable.bind(this));
    };
    
    /**
     * Query for matching items
     * @param {object} params The dynamoDB params. We may not specify TableName, as I do it for you
     * @return {Promise<void>}
     */
	async query(params){
        if (!params) throw new Error('params are required');
        params.TableName = this.tableName;
        let self=this;
        var _run = function(){
            return self.dynamoDBDocumentClient.query(params).promise();
        };
        return await this.__execute(_run, this.__resolveItems, this.createTable.bind(this));
    };
    
    /**
     * Delete an item
     * @param {object} params The dynamoDB params. We may not specify TableName, as I do it for you
     * @return {Promise<void>}
     */
	async delete(params){
        if (!params) throw new Error('params are required');
        params.TableName = this.tableName;
        let self=this;
        var _run = function(){
            return self.dynamoDBDocumentClient.delete(params).promise();
        };
        return await this.__execute(_run, this.__resolve, this.createTable.bind(this));
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
        return await this.__execute(_run, this.__resolveItems, this.createTable.bind(this));
    };
    
    async __execute(_run, _resolve, _create){
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

    __resolve(data){
        if (data) return data;
        else return null;
    };

    __resolveItem(data){
        if (data && data.Item) return data.Item;
        else return null;
    };

    __resolveItems(data){
        if (data && data.Items) return data.Items;
        else return null;
    };

    __resolveGetBatch(data){
        if (data && data.Responses && data.Responses[this.tableName])
            return data.Responses[this.tableName];
        else return null;
    };

    static __created(item, actioner){
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

    static __updated(item, actioner){
        var createdOk = this.__created(item);
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
}

exports.DbBase = DbBase;