'use strict';

const test = require('unit.js');
const {Logic} = require('../lib/logic.js');

//var aws_sdk_1 = require("aws-sdk");
//var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
//var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

var logEnabled = false;

describe('Logic', function() {

	var userId0 = "unknown";
	var userId1 = "user5511";
	var userId2 = "user05";
	var item0 = "unknown";
	var item1 = "Baby";

	describe('Logic.UsersAlexa', function(){
		it('test async functions', async function(){
			var x= new Logic.UserAlexa();
			var is = Object.prototype.hasOwnProperty.call(x,'addItem');
			console.log('addItem=' + is);
			console.log('addItem typeof =' + typeof(x.addItem));
		});
		it('getById - search for unknown', async function(){
			var usr = await Logic.UserAlexa.getById(userId0);
			var isValid = Logic.UserAlexa.isValid(usr);
			test.number(isValid?1:0).isEqualTo(0);
		});
		it('getById - search for known', async function(){
			var usr = await Logic.UserAlexa.getById(userId2);
			var isValid = Logic.UserAlexa.isValid(usr);
			test.object(usr).number(isValid?1:0).isEqualTo(1);
		});
		it('getById - create if unknown', async function(){
			var usr = await Logic.UserAlexa.getById(userId1);
			var isValid = Logic.UserAlexa.isValid(usr);
			if (!isValid){
				Logic.UserAlexa.create(userId1, "skill-121231-1212-1212");
				usr = await Logic.UserAlexa.getById(userId1);
				isValid = Logic.UserAlexa.isValid(usr);
			}
			test.object(usr).number(isValid?1:0).isEqualTo(1);
			if (logEnabled) console.log(usr);
			
            //var item = usr.getItem('Baby');
            //console.log(item);
		});
		it('unknown item', async function(){
			var usr = await Logic.UserAlexa.getById(userId1);
			var isValid = Logic.UserAlexa.isValid(usr);
			test.object(usr).number(isValid?1:0).isEqualTo(1);
			var hasItem = usr.hasItem(item0);
			test.number(hasItem?1:0).isEqualTo(0);
		});
		it('getItem - create if unknown', async function(){
			var usr = await Logic.UserAlexa.getById(userId1);
			console.log(usr);
			var isValid = Logic.UserAlexa.isValid(usr);
			test.object(usr).number(isValid?1:0).isEqualTo(1);
			var item = usr.getItem(item1);
			isValid = Logic.Item.isValid(item);
			if (!isValid){
				item = await usr.addItem(item1);
				//var itemId = await Logic.Item.create(item1);
				//item = await Logic.Item.getById(itemId);
				//console.log(item);
				isValid = Logic.Item.isValid(item);
			}
			test.object(item).number(isValid?1:0).isEqualTo(1)
			.string(item.ItemId)
			.string(item.Label).isEqualTo(item1);
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
  