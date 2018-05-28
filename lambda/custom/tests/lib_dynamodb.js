'use strict';

const test = require('unit.js');
const DynamoDbHelper_1 = require('../lib/dynamoDB.js');
var aws_sdk_1 = require("aws-sdk");

var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

var logEnabled = false;

describe('DynamoDbHelper', function() {

	describe('DynamoDbHelper.UsersAlexa', function(){
		it('getById - unknown', async function(){
			//user does not exists, we expected an empty object {}
			var usr = await DynamoDbHelper.UsersAlexa.getById('user-unknown');
			var isUnknown = !usr || Object.keys(usr).length === 0;
			//test.value(isUnknown).isEqualTo(false);
			//test.object(usr);
			test.should.equal(isUnknown, true);
		});
		it('getById - create if unknown', async function(){
			var userId = "user05";
			//if user does not exists, we expected an empty object {}
			var usr = await DynamoDbHelper.UsersAlexa.getById(userId);
			var isUnknown = !usr || Object.keys(usr).length === 0;
			if (isUnknown){
				var user = {UserId: userId, Skill: "434-fe23-ae235535-232d"};
				user.IP = "192.168.0.1";
				usr = await DynamoDbHelper.UsersAlexa.put(user);
				//put does not return the record
				usr = await DynamoDbHelper.UsersAlexa.getById(userId);
				keysNo = Object.keys(usr).length;
			}
			test.object(usr).string(usr.UserId).isEqualTo(userId);
			//test.assert(keysNo >= 1, 'Expected at least one property');
			if (logEnabled || true)
				console.log(usr);
		});
		it('put and then update 5 users', async function(){
			var epoch = (new Date).getTime();
			var userId = "user-" + epoch;
			for (var i=0;i<5;i++){
				var user = {UserId: userId, Skill: "434-fe23-ae235535-232d"};
				epoch = (new Date).getTime();
				user.UserId += "-" + i;
				await DynamoDbHelper.UsersAlexa.put(user);
				var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
				if (usr) console.log(usr);
				user.Skill += "-" + epoch;
				await DynamoDbHelper.UsersAlexa.update(user);
				var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
				if (usr) console.debug(usr);
			}
		});
	});

	describe('DynamoDbHelper.VariousTests', function(){
	// it('Delete table ItemMeasurements', async function(){
	// 	var tableName = "ItemMeasurements";
	// 	var tables = await DynamoDbHelper.listTables();
	// 	test.object(tables).object(tables.TableNames);
	// 	console.log(tables);
	// 	//done();
	// 	if (tables.TableNames.indexOf(tableName) != -1){
	// 		var tbl = await DynamoDbHelper.deleteTable(tableName);
	// 		console.log('Deleted ' + tableName);
	// 		//console.log(tbl);
	// 	}
	// 	});
  it('Create table ItemMeasurements', async function(){
	var tableName = "ItemMeasurements";
	var tables = await DynamoDbHelper.listTables();
	test.object(tables).object(tables.TableNames);
	if (logEnabled)
		console.log(tables);
	//done();
	if (tables.TableNames.indexOf(tableName) === -1){
		var tbl = await DynamoDbHelper.createTableItemMeasurements();
		console.log('Created ' + tableName);
		//console.log(tbl);
	}
  });
  it('Add ItemMeasurements', async function(){
	var tableName = "ItemMeasurements";
	var item = {
		ItemId: "item01",
		When: (new Date).getTime(),
		UserId: "user01",
		App: "Skill.06565-53450452-ABF34-2323"
	};
	if (logEnabled)
		console.log('Add item: ' + item);
	var response = await DynamoDbHelper.addItemMeasurement(item);
	//test.object(tables).object(tables.TableNames);
	if (logEnabled)
		console.log(response);
  });
  it('Scan ItemMeasurements', async function(){
	var itemId = 'item01';
	//example to show only entries in the last 10'
	var since = (new Date).getTime() - (10 * 60000);
	if (logEnabled)
		console.log('Scan measurements for item with id: ' + itemId);
	var response = await DynamoDbHelper.scanItemMeasurements(itemId, since);
	test.object(response).object(response.Items);
	//convert response to local array
	var data = [];
	response.Items.forEach(function(entry) {
		var i = parseInt(entry.When.N);
		data.push(new Date(i));
	});
	if (logEnabled){
		//console.log(response);
		console.log('ScannedCount = ' + response.ScannedCount);
		console.log(data);
	}
  });
  it('Query ItemMeasurements', async function(){
	var itemId = 'item01';
	//example to show only entries in the last 10'
	var since = (new Date).getTime() - (10 * 60000);
	if (logEnabled)
		console.log('Query measurements for item with id: ' + itemId);
	var response = await DynamoDbHelper.queryItemMeasurements(itemId, since);
	test.object(response).object(response.Items);
	//convert response to local array
	var data = [];
	response.Items.forEach(function(entry) {
		var i = parseInt(entry.When.N);
		data.push(new Date(i));
		if(entry.UserId)
			data.push(entry.UserId.S);
		if(entry.App)
			data.push(entry.App.S);
	});
	if (logEnabled){
		//console.log(response);
		console.log('ScannedCount = ' + response.ScannedCount);
		console.log(data);
	}
  });
  it('basic test', async function(){
	//try{
		//no need to use try/catch or "done" in mocha, since it handles errors
		var tableName = "Table1";
		var tables = await DynamoDbHelper.listTables();
		test.object(tables).object(tables.TableNames);
		if (logEnabled)
			console.log(tables);
		//done();
		if (tables.TableNames.indexOf(tableName) > -1){
			await DynamoDbHelper.deleteTable(tableName);
			if (logEnabled)
				console.log('deleting table');
		}
		if (logEnabled)
			console.log('creating table');
		 var tbl = await DynamoDbHelper.createTable(tableName);
		 if (logEnabled)
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
});
  