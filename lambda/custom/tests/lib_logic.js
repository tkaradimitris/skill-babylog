'use strict';

const util = require('util');
const test = require('unit.js');
const {Logic} = require('../lib/logic.js');

//var aws_sdk_1 = require("aws-sdk");
//var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
//var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

var logEnabled = false;

describe('Logic', function() {

	var skill01 = "skill-121231-1212-1212";
	var userId0 = "unknown";
	var userId1 = "user-logic-01";
	var userId2 = "user-logic-02";
	var item0 = "unknown";
	var item1 = "Baby-Logic9";

	describe('Logic.UsersAlexa', function(){
		// it('test async functions', async function(){
		// 	var x= new Logic.UserAlexa();
		// 	var is = Object.prototype.hasOwnProperty.call(x,'addItem');
		// 	console.log('addItem=' + is);
		// 	console.log('addItem typeof =' + typeof(x.addItem));
		// });
		it('getById - search for unknown', async function(){
			var usr = await Logic.UserAlexa.getById(userId0);
			var isValid = usr ? true : false;
			test.number(isValid?1:0).isEqualTo(0);
		});
		it('getById - create if unknown', async function(){
			var usr = await Logic.UserAlexa.getOrCreateById(userId1, skill01);
			var isValid = usr ? true : false;
			test.object(usr).number(isValid?1:0).isEqualTo(1);
			if (logEnabled) console.log(usr);
		});
		it('getById - search for known', async function(){
			var usr = await Logic.UserAlexa.getById(userId1);
			var isValid = usr ? true : false;
			test.object(usr).number(isValid?1:0).isEqualTo(1);
		});
		it('UsersAlexa Scan', async function(){
			var response = await Logic.UserAlexa.scan();
			test.object(response).object(response.Items)
			.number(response.Items.length)
			.number(response.Items.length > 0 ? 1 : 0).isEqualTo(1);
			//console.log(response);
			if (logEnabled){
				for (var i=0;i<response.Items.length;i++){
					console.log(util.inspect(response.Items[i], {showHidden: false, depth: null}));
				}
			}
		});
		it('hasItem - unknown item', async function(){
			var usr = await Logic.UserAlexa.getOrCreateById(userId1, skill01);
			var isValid = usr ? true : false;
			test.object(usr).number(isValid?1:0).isEqualTo(1);
			var hasItem = Logic.UserAlexa.hasItem(usr, item0);
			test.number(hasItem?1:0).isEqualTo(0);
		});
		it('getItem - create if unknown', async function(){
			var usr = await Logic.UserAlexa.getOrCreateById(userId1, skill01);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			var item = await Logic.UserAlexa.getOrAddItem(usr, item1);
			var isValid = Logic.Item.isValid(item);
			test.object(item).number(isValid?1:0).isEqualTo(1)
			.string(item.ItemId)
			.string(item.Label).isEqualTo(item1);
			//console.log(usr);
		});
		it('Items Scan', async function(){
			var response = await Logic.Item.scan();
			test.object(response).object(response.Items)
			.number(response.Items.length)
			.number(response.Items.length > 0 ? 1 : 0).isEqualTo(1);
			//console.log(response);
			if (logEnabled){
				for (var i=0;i<response.Items.length;i++){
					console.log(util.inspect(response.Items[i], {showHidden: false, depth: null}));
				}
			}
		});
	});

});
  