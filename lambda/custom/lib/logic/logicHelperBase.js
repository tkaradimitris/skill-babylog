'use strict';

class LogicHelperBase{
    constructor(dynamoDbHelper){
        this.DynamoDbHelper = dynamoDbHelper;
    }
}

exports.LogicHelperBase = LogicHelperBase;