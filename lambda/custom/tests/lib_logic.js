'use strict';

const test = require('unit.js');
const {Logic} = require('../lib/logic.js');

//var aws_sdk_1 = require("aws-sdk");
//var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
//var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

var logEnabled = false;

describe('Logic', function() {

	describe('Logic.UsersAlexa', function(){
		it('getById', async function(){
            var usr = await Logic.UserAlexa.getById("user05");
            console.log(usr);
			//var isUnknown = Object.keys(usr).length === 0;
			test.object(usr);
            var item = usr.getItem('Baby');
            console.log(item);
			//test.should.equal(isUnknown, true);
		});
		it('basic', async function(){
            //user does not exists, we expected an empty object {}
            //console.log(Logic);
            //console.log(Logic.UserAlexa);
            //console.log(UserAlexa);
			var usr = new Logic.UserAlexa();
			//var isUnknown = Object.keys(usr).length === 0;
            test.object(usr);
			//test.should.equal(isUnknown, true);
		});
	});

});
  