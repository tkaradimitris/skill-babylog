'use strict';


//var aws_sdk_1 = require("aws-sdk");
const DynamoDbHelper_1 = require('../dynamoDB.js');
const {Actioner} = require('./actioner.js');
const {UserAlexa} = require("./usersAlexa.js");
const {Baby} = require("./babies.js");
const {Measurement} = require("./measurements.js");
const {UsersAlexaHelper} = require("./usersAlexaHelper.js");
const {BabiesHelper} = require("./babiesHelper.js");
const {MeasurementsHelper} = require("./measurementsHelper.js");

class Logic{
    constructor(dynamoDbClient){
        //if (!dynamoDbClient) throw new Error('dynamoDbClient is required');
        this.dynamoDbClient = dynamoDbClient ? dynamoDbClient : new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
        this.DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: this.dynamoDbClient, prefix: "BabyLog"});
        
        this.Actioner = Actioner;
        this.UserAlexa = UserAlexa;
        this.Baby = Baby;
        this.Measurement = Measurement;
        this.UsersAlexaHelper = new UsersAlexaHelper(this.DynamoDbHelper);
        this.BabiesHelper = new BabiesHelper(this.DynamoDbHelper);
        this.MeasurementsHelper = new MeasurementsHelper(this.DynamoDbHelper);
    }
    test(){
        return 1;
    }
    testUsersAlexaHelper(){
        return this.UsersAlexaHelper.test(2);
    }
}

exports.Logic = Logic;