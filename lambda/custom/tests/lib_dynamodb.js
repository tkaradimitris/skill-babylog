'use strict';

const test = require('unit.js');
const DynamoDbHelper_1 = require('../lib/dynamoDB.js');
var aws_sdk_1 = require("aws-sdk");

var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

describe('DynamoDbHelper', function() {

  it('basic test', async function(){
	//try{
		var tableName = "Table1";
		var tables = await DynamoDbHelper.listTables();
		test.object(tables).object(tables.TableNames);
		console.log(tables);
		//done();
		if (tables.TableNames.indexOf(tableName) > -1){
			await DynamoDbHelper.deleteTable(tableName);
			console.log('deleting table');
		}
		console.log('creating table');
		 var tbl = await DynamoDbHelper.createTable(tableName);
		 console.log(tbl);
		//done();
	//}
	//catch(err){
		//done(err);
	//}
    /*DynamoDbHelper.createTable()
        .then(function (data) {
            console.log(data);
			test.object(data);
        })
        .catch(function (err) {
            console.log(err.message);
        });
    DynamoDbHelper.listTables()
        .then(function (data) {
            console.log(data);
			test.object(data);
			done();
        })
        .catch(function (err) {
            console.log(err.message);
			done(err);
        });*/
  });
});
  