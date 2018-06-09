'use strict';

const util = require('util');
const test = require('unit.js');
const DynamoDbHelper_1 = require('../lib/dynamoDB.js');
var aws_sdk_1 = require("aws-sdk");

var prefix = "BabyLogDB";
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient, prefix: prefix});//, tableName: "", createTable: false

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
				var user = {UserId: userId, attributes: {}};
				user.attributes.IP = "192.168.0.1";
				await DynamoDbHelper.UsersAlexa.put(user);
				//put does not return the record
				usr = await DynamoDbHelper.UsersAlexa.getById(userId);
			}
			test.object(usr).hasProperty('attributes')
			.object(usr.attributes).hasProperty('IP')
			.string(usr.attributes.IP)
			.isEqualTo("192.168.0.1");
			if (logEnabled)
				console.log(usr);
		});
		it('put and then update 5 users', async function(){
			var epoch = (new Date).getTime();
			var userId = "user-" + epoch;
			for (var i=0;i<5;i++){
				var user = {UserId: userId, attributes: {}};
				user.UserId += "-" + i;
				await DynamoDbHelper.UsersAlexa.put(user);
				var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
				if (usr && logEnabled) console.log(usr);
				test.object(usr).hasProperty('UserId')
				.string(usr.UserId).isEqualTo(userId + "-"+i);
				if (!usr.attributes.Items) usr.attributes.Items = [];
				usr.attributes.Items.push({ItemId: "item-id-"+(i+1), Label: "item " + (i+1)});
				await DynamoDbHelper.UsersAlexa.update(usr);
				var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
				if (usr && logEnabled) console.debug(usr);
				test.object(usr)
				.hasProperty('attributes').object(usr.attributes)
				.hasProperty('Items').number(usr.attributes.Items.length).isEqualTo(1);
			}
		});
		it('put,get,delete 5 users', async function(){
			var epoch = (new Date).getTime();
			var userId = "user-" + epoch;
			for (var i=0;i<5;i++){
				var user = {UserId: userId, attributes: {Items: []}};
				user.UserId += "-" + i;
				//put
				await DynamoDbHelper.UsersAlexa.put(user);
				//get
				var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
				test.object(usr).hasProperty('UserId').string(usr.UserId).isEqualTo(user.UserId);
				//delete
				if (i==0)
					await DynamoDbHelper.UsersAlexa.delete(usr);
				else
					await DynamoDbHelper.UsersAlexa.delete(usr.UserId);
				//get - must be null
				var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
				test.assert(usr === null);
			}
		});
		// it('query by item label', async function(){
		// 	var usrs = await DynamoDbHelper.UsersAlexa.queryByItemLabel('item 2');
		// 	console.log(usrs);
		// 	test.object(usrs).number(usrs.length).number(usrs.length > 0 ? 1 : 0).isEqualTo(1);
		// });
		it('scan users', async function(){
			var usrs = await DynamoDbHelper.UsersAlexa.scan();
			test.object(usrs).number(usrs.length).number(usrs.length > 0 ? 1 : 0).isEqualTo(1);
			//console.log(usrs);
		});
	});

	describe('DynamoDbHelper.Items', function(){
		it('getById - unknown', async function(){
			//item does not exists, we expected an empty object {}
			var item = await DynamoDbHelper.Items.getById('item-unknown');
			var isUnknown = !item || Object.keys(item).length === 0;
			//test.value(isUnknown).isEqualTo(false);
			//test.object(usr);
			test.should.equal(isUnknown, true);
		});
		it('getById - create if unknown', async function(){
			var itemId = "item100200";
			//if user does not exists, we expected an empty object {}
			var item = await DynamoDbHelper.Items.getById(itemId);
			var isUnknown = !item || Object.keys(item).length === 0;
			if (isUnknown){
				var item = {ItemId: itemId, Label: itemId + "-label"};
				item = await DynamoDbHelper.Items.put(item);
				//put does not return the record
				item = await DynamoDbHelper.Items.getById(itemId);
				var keysNo = Object.keys(item).length;
			}
			test.object(item).string(item.ItemId).isEqualTo(itemId);
			//test.assert(keysNo >= 1, 'Expected at least one property');
			if (logEnabled)
				console.log(item);
		});
		it('put and then update 5 items', async function(){
			var epoch = (new Date).getTime();
			var itemId = "item-" + epoch;
			for (var i=0;i<5;i++){
				var item = {ItemId: itemId, attributes: {}};
				item.ItemId += "-" + i;
				await DynamoDbHelper.Items.put(item);
				var itm = await DynamoDbHelper.Items.getById(item.ItemId);
				if (itm && logEnabled) console.log(itm);
				test.object(itm).hasProperty('ItemId')
				.string(itm.ItemId).isEqualTo(item.ItemId);
				if (!itm.attributes.Type) itm.attributes.Type = "Baby";
				await DynamoDbHelper.Items.update(itm);
				var itm = await DynamoDbHelper.Items.getById(item.ItemId);
				if (itm && logEnabled) console.debug(itm);
				test.object(itm)
				.hasProperty('attributes').object(itm.attributes)
				.hasProperty('Info').object(itm.attributes.Info)
				.hasProperty('Updated').number(itm.attributes.Info.Updated);
				test.object(itm.attributes.Info)
				.hasProperty('Changes').number(itm.attributes.Info.Changes).isEqualTo(1);
				test.object(itm.attributes).hasProperty('Type')
				.string(itm.attributes.Type).isEqualTo("Baby");
			}
		});
		// it('put and then update 5 items', async function(){
		// 	var epoch = (new Date).getTime();
		// 	var userId = "user-" + epoch;
		// 	for (var i=0;i<5;i++){
		// 		var user = {UserId: userId, Skill: "434-fe23-ae235535-232d"};
		// 		epoch = (new Date).getTime();
		// 		user.UserId += "-" + i;
		// 		await DynamoDbHelper.UsersAlexa.put(user);
		// 		var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
		// 		if (usr && logEnabled) console.log(usr);
		// 		user.Skill += "-" + epoch;
		// 		await DynamoDbHelper.UsersAlexa.update(user);
		// 		var usr = await DynamoDbHelper.UsersAlexa.getById(user.UserId);
		// 		if (usr && logEnabled) console.debug(usr);
		// 	}
		// });
		it('put,get,delete 5 items', async function(){
			var epoch = (new Date).getTime();
			var itemId = "item-" + epoch;
			for (var i=0;i<5;i++){
				var item = {ItemId: itemId, attributes: {Items: []}};
				item.ItemId += "-" + i;
				//put
				await DynamoDbHelper.Items.put(item);
				//get
				var itm = await DynamoDbHelper.Items.getById(item.ItemId);
				test.object(itm).hasProperty('ItemId').string(itm.ItemId).isEqualTo(item.ItemId);
				//delete
				if (i==0)
					await DynamoDbHelper.Items.delete(itm);
				else
					await DynamoDbHelper.Items.delete(itm.ItemId);
				//get - must be null
				var itm = await DynamoDbHelper.Items.getById(item.ItemId);
				test.assert(itm === null);
			}
		});
		it('Items Scan', async function(){
		  var response = await DynamoDbHelper.Items.scan();
		  test.object(response).object(response.Items);
		  //TODO: add complex scan & query with itemId and date
		//   for (var i=0;i<response.Items.length;i++){
		// 	  console.log(response.Items[i]);
		//   }
		  //convert response to local array
		//   var data = [];
		//   response.Items.forEach(function(entry) {
		// 	  var i = parseInt(entry.When.N);
		// 	  data.push(new Date(i));
		//   });
		//   if (logEnabled){
		// 	  //console.log(response);
		// 	  console.log('ScannedCount = ' + response.ScannedCount);
		// 	  console.log(data);
		//   }
		});
	});

	describe('DynamoDbHelper.Measurements', function(){
		it('get - unknown', async function(){
			//item does not exists, we expected an empty object {}
			var item = await DynamoDbHelper.Measurements.get('item-unknown', 1);
			var isUnknown = !item || Object.keys(item).length === 0;
			//test.value(isUnknown).isEqualTo(false);
			//test.object(usr);
			test.should.equal(isUnknown, true);
		});
		it('get - create if unknown', async function(){
			var itemId = "item-100-200-300";
			var when = (new Date).getTime();
			//if user does not exists, we expected an empty object {}
			var item = await DynamoDbHelper.Measurements.get(itemId, when);
			var isUnknown = !item || Object.keys(item).length === 0;
			if (isUnknown){
				var item = {ItemId: itemId, When: when};
				item = await DynamoDbHelper.Measurements.put(item);
				//put does not return the record
				item = await DynamoDbHelper.Measurements.get(itemId, when);
				var keysNo = Object.keys(item).length;
			}
			test.object(item)
			.string(item.ItemId).isEqualTo(itemId)
			.number(item.When).isEqualTo(when);
			//test.assert(keysNo >= 1, 'Expected at least one property');
			if (logEnabled)
				console.log(item);
		});
		it('put and then update 5 measurements', async function(){
			var epoch = (new Date).getTime();
			var itemId = "item-" + epoch;
			for (var i=0;i<5;i++){
				var item = {ItemId: itemId};
				epoch = (new Date).getTime();
				item.ItemId += "-" + i;
				item.When = epoch;
				await DynamoDbHelper.Measurements.put(item);
				var itm = await DynamoDbHelper.Measurements.get(item.ItemId, item.When);
				if (itm && logEnabled) console.log(itm);
				test.object(itm).hasProperty('ItemId')
				.string(itm.ItemId).isEqualTo(item.ItemId);
				test.object(itm).hasProperty('When')
				.number(itm.When).isEqualTo(item.When);
				if (!itm.attributes.Value) itm.attributes.Value = 10.5;
				await DynamoDbHelper.Measurements.update(itm);
				var itm = await DynamoDbHelper.Measurements.get(item.ItemId, item.When);
				if (itm && logEnabled) console.debug(itm);
				test.object(itm)
				.hasProperty('attributes').object(itm.attributes)
				.hasProperty('Info').object(itm.attributes.Info)
				.hasProperty('Updated').number(itm.attributes.Info.Updated);
				test.object(itm.attributes.Info)
				.hasProperty('Changes').number(itm.attributes.Info.Changes).isEqualTo(1);
				test.object(itm.attributes).hasProperty('Value')
				.number(itm.attributes.Value).isEqualTo(10.5);
			}
		});
		it('put 5 measurements', async function(){
			var itemId = "item-400-500-600";
			var when = null;
			for (var i=0;i<5;i++){
				when = (new Date).getTime();
				var item = {ItemId: itemId, When: when};
				await DynamoDbHelper.Measurements.put(item);
				var itemDB = await DynamoDbHelper.Measurements.get(itemId,when);
				test.object(itemDB)
					.string(itemDB.ItemId).isEqualTo(itemId)
					.number(itemDB.When).isEqualTo(when);
				//if (itemDB && logEnabled) console.log(itemDB);
			}
		});
		it('put,get,delete 5 measurements', async function(){
			var epoch = (new Date).getTime();
			var itemId = "item-" + epoch + "-001";
			for (var i=0;i<5;i++){
				var when = (new Date).getTime();
				var item = {ItemId: itemId, When: when, attributes: {Value: i+1}};
				//put
				await DynamoDbHelper.Measurements.put(item);
				//get
				var itm = await DynamoDbHelper.Measurements.get(item.ItemId, item.When);
				test.object(itm).hasProperty('ItemId').hasProperty('When');
				test.string(itm.ItemId).isEqualTo(item.ItemId);
				test.number(itm.When).isEqualTo(item.When);
				//delete
				await DynamoDbHelper.Measurements.delete(itm.ItemId, itm.When);
				//get - must be null
				var itm = await DynamoDbHelper.Measurements.get(itm.ItemId, itm.When);
				test.assert(itm === null);
			}
		});
		it('Measurements Scan', async function(){
		  var response = await DynamoDbHelper.Measurements.scan();
		  test.object(response).object(response.Items)
		  .number(response.Items.length)
		  .number(response.Items.length > 5 ? 1 : 0).isEqualTo(1);
		//   for (var i=0;i<response.Items.length;i++){
		// 	console.log(util.inspect(response.Items[i], {showHidden: false, depth: null}));
		//   }
		  //convert response to local array
		//   var data = [];
		//   response.Items.forEach(function(entry) {
		// 	  var i = parseInt(entry.When.N);
		// 	  data.push(new Date(i));
		//   });
		//   if (logEnabled){
		// 	  //console.log(response);
		// 	  console.log('ScannedCount = ' + response.ScannedCount);
		// 	  console.log(data);
		//   }
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
	// it('Create table ItemMeasurements', async function(){
	// 	var tableName = (prefix ? prefix + "_" : "") + "ItemMeasurements";
	// 	var tables = await DynamoDbHelper.listTables();
	// 	test.object(tables).object(tables.TableNames).value(tables.TableNames.length > 0).isEqualTo(true);
	// 	if (logEnabled)
	// 		console.log(tables);
	// 	console.log(tables);
	// 	//done();
	// 	if (tables.TableNames.indexOf(tableName) === -1){
	// 		var tbl = await DynamoDbHelper.createTableItemMeasurements();
	// 		console.log('Created ' + tableName);
	// 		//console.log(tbl);
	// 	}
	// });
	// it('Add ItemMeasurements', async function(){
	// 	var tableName = "ItemMeasurements";
	// 	var item = {
	// 		ItemId: "item01",
	// 		When: (new Date).getTime(),
	// 		UserId: "user01",
	// 		App: "Skill.06565-53450452-ABF34-2323"
	// 	};
	// 	if (logEnabled)
	// 		console.log('Add item: ' + item);
	// 	var response = await DynamoDbHelper.addItemMeasurement(item);
	// 	//test.object(tables).object(tables.TableNames);
	// 	if (logEnabled)
	// 		console.log(response);
	// });
	// it('Scan ItemMeasurements', async function(){
	// 	var itemId = 'item01';
	// 	//example to show only entries in the last 10'
	// 	var since = (new Date).getTime() - (10 * 60000);
	// 	if (logEnabled)
	// 		console.log('Scan measurements for item with id: ' + itemId);
	// 	var response = await DynamoDbHelper.scanItemMeasurements(itemId, since);
	// 	test.object(response).object(response.Items);
	// 	//convert response to local array
	// 	var data = [];
	// 	response.Items.forEach(function(entry) {
	// 		var i = parseInt(entry.When.N);
	// 		data.push(new Date(i));
	// 	});
	// 	if (logEnabled){
	// 		//console.log(response);
	// 		console.log('ScannedCount = ' + response.ScannedCount);
	// 		console.log(data);
	// 	}
	// });
	// it('Query ItemMeasurements', async function(){
	// 	var itemId = 'item01';
	// 	//example to show only entries in the last 10'
	// 	var since = (new Date).getTime() - (10 * 60000);
	// 	if (logEnabled)
	// 		console.log('Query measurements for item with id: ' + itemId);
	// 	var response = await DynamoDbHelper.queryItemMeasurements(itemId, since);
	// 	test.object(response).object(response.Items);
	// 	//convert response to local array
	// 	var data = [];
	// 	response.Items.forEach(function(entry) {
	// 		var i = parseInt(entry.When.N);
	// 		data.push(new Date(i));
	// 		if(entry.UserId)
	// 			data.push(entry.UserId.S);
	// 		if(entry.App)
	// 			data.push(entry.App.S);
	// 	});
	// 	if (logEnabled){
	// 		//console.log(response);
	// 		console.log('ScannedCount = ' + response.ScannedCount);
	// 		console.log(data);
	// 	}
	// });
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
  