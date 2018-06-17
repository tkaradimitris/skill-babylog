'use strict';

const uuidv1 = require('uuid/v1');
const {__assign} = require('./__assign.js');

class LogicHelperBase{
    constructor(dynamoDbHelper){
        this.DynamoDbHelper = dynamoDbHelper;
        this.__assign = __assign;
    }

    generateId(prefix){
        return (prefix ? prefix + "-" : "") + uuidv1();
    };
}

exports.LogicHelperBase = LogicHelperBase;