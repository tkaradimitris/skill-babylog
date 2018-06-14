'use strict';

const {__assign} = require('./__assign.js');

class LogicHelperBase{
    constructor(dynamoDbHelper){
        this.DynamoDbHelper = dynamoDbHelper;
        this.__assign = __assign;
    }
}

exports.LogicHelperBase = LogicHelperBase;