'use strict';


//var aws_sdk_1 = require("aws-sdk");
const DynamoDbHelper_1 = require('../dynamoDB.js');
const {Actioner} = require('./actioner.js');
const {UserAlexa} = require("./usersAlexa.js");
const {UsersAlexaHelper} = require("./usersAlexaHelper.js");

class Logic{
    constructor(dynamoDbClient){
        //if (!dynamoDbClient) throw new Error('dynamoDbClient is required');
        this.dynamoDbClient = dynamoDbClient ? dynamoDbClient : new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
        this.DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: this.dynamoDbClient, prefix: "BabyLog"});
        
        this.Actioner = Actioner;
        this.UsersAlexaHelper = new UsersAlexaHelper(this.DynamoDbHelper);
    }
    test(){
        return 1;
    }
    testUsersAlexaHelper(){
        return this.UsersAlexaHelper.test(2);
    }
}

exports.Logic = Logic;