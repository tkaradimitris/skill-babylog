'use strict';

//var aws_sdk_1 = require("aws-sdk");
const DynamoDbHelper_1 = require('../dynamoDB.js');
const {UserAlexa} = require("./usersAlexa.js");
const {UsersAlexaHelper} = require("./usersAlexaHelper.js");

class Logic{
    constructor(dynamoDbClient){
        //if (!dynamoDbClient) throw new Error('dynamoDbClient is required');
        this.dynamoDbClient = dynamoDbClient ? dynamoDbClient : new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
        this.DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: this.dynamoDbClient, prefix: "BabyLog"});

        this.UsersAlexaHelper = new UsersAlexaHelper(this.DynamoDbHelper);
    }
    get1(){
        return 1;
    }
    get2(){
        //return 2; 
        return this.UsersAlexaHelper.get2();
    }
}

exports.Logic = Logic;