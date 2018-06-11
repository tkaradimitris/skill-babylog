'use strict';

const util = require('util');
const test = require('unit.js');
const {Logic} = require('../lib/logic.js');

//var aws_sdk_1 = require("aws-sdk");
//var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
//var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

var logEnabled = false;

describe('Logic', function() {
    var alxUserId = "amzn1.ask.account.AETS2HEPC4ZEWDAJMGVELLZSTGOUATFFMT6BSZO367RGS4HYNRPDBG2IRTAHZZ2E3ZLMWHAXUQW4MAVH4ERQKB5OEAEMT7EUR363EYVTAFOT6GR6AHP5XINRCG4AELCDJZZY3UABIFLIN3BU7LDJ3JGVRDMKDCS4VIJ2YY6YMFA27Z67RURYDHKVSQPAFBTMWVLXEVYQ2RU67LI";
	var applicationId = "amzn1.ask.skill.8601fd83-83b4-44ce-bd84-142c70ad32e7";
	var deviceId = "amzn1.ask.device.AHUPPP6AEG4ALGU2X57TCHECYMQTA75PF3XLLJXIGYQGPOVHUJBDOCC23JHHRVAAZ2WA22X4TKU5KC47I4M53HUHTIL4PHSCKS7TVP3X2MLGM6YNLPJG2IXBX4FMSFZD2NEOBQ3K6B6DF46AD6TO6I3BO65Q";
	let actioner = new Logic.Actioner('ALEXA', applicationId, alxUserId);
	var userId0 = "unknown";
	var userId1 = "user-logic-01";
	var userId2 = "user-logic-02";
	var babyId00 = "baby-unknown";
	var babyId01 = null;
	var babyId02 = null;
	var baby01 = "Brian";
	var baby02 = "Marie";
	var item0 = "unknown";
	var item1 = "Baby-Logic9";

	describe('Logic.UsersAlexa', function(){
		it('getById - search for unknown', async function(){
			var usr = await Logic.UserAlexa.getById(userId0);
			test.assert(usr === null);
		});
		it('getOrCreateById', async function(){
			var usr = await Logic.UserAlexa.getOrCreateById(userId1, actioner);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			if (logEnabled) console.log(usr);
		});
		it('getById - search for known', async function(){
			var usr = await Logic.UserAlexa.getById(userId1);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			test.object(usr.attributes).object(usr.attributes.Info);
			var info = usr.attributes.Info;
			test.number(info.Created).string(info.CreatedByType).isEqualTo(actioner.Type);
		});
		it('UsersAlexa Scan', async function(){
			var response = await Logic.UserAlexa.scan();
			test.object(response)
			.number(response.length)
			.number(response.length > 0 ? 1 : 0).isEqualTo(1);
			//console.log(response);
			if (logEnabled){
				for (var i=0;i<response.length;i++){
					console.log(util.inspect(response[i], {showHidden: false, depth: null}));
				}
			}
		});
		/*
		it('hasItem - unknown item', async function(){
			var usr = await Logic.UserAlexa.getOrCreateById(userId1, actioner);
			var isValid = usr ? true : false;
			test.object(usr).number(isValid?1:0).isEqualTo(1);
			var hasItem = Logic.UserAlexa.hasItem(usr, item0);
			test.number(hasItem?1:0).isEqualTo(0);
		});
		it('getItem - create if unknown', async function(){
			var usr = await Logic.UserAlexa.getOrCreateById(userId1, actioner);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			var item = await Logic.UserAlexa.getOrAddItem(usr, item1);
			var isValid = Logic.Item.isValid(item);
			test.object(item).number(isValid?1:0).isEqualTo(1)
			.string(item.BabyId)
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
		*/
	});

	describe('Logic.Baby basic', function(){
		it('create', async function(){
			var baby = new Logic.Baby();
			baby.setName(baby01);
			babyId01 = await Logic.Baby.create(baby, actioner);
			test.string(babyId01);
			//get
			var bby = await Logic.Baby.getById(babyId01);
			if (logEnabled) console.log(bby);
			test.object(bby).string(bby.BabyId).isEqualTo(babyId01);
			test.object(bby).hasProperty('attributes').object(bby.attributes)
			.hasProperty('Name').string(bby.attributes.Name).isEqualTo(baby01);
		});
		it('createByName', async function(){
			var baby = new Logic.Baby();
			babyId02 = await Logic.Baby.createByName(baby02, actioner);
			test.string(babyId02);
			//get
			var bby = await Logic.Baby.getById(babyId02);
			if (logEnabled) console.log(bby);
			test.object(bby).string(bby.BabyId).isEqualTo(babyId02);
			test.object(bby).hasProperty('attributes').object(bby.attributes)
			.hasProperty('Name').string(bby.attributes.Name).isEqualTo(baby02);
		});
		it('getById - known', async function(){
			console.log()
			var baby = await Logic.Baby.getById(babyId01);
			if (logEnabled) console.log(baby);
			test.object(baby).string(baby.BabyId).isEqualTo(babyId01);
			test.object(baby).hasProperty('attributes').object(baby.attributes)
			.hasProperty('Name').string(baby.attributes.Name).isEqualTo(baby01);
		});
		it('getById and update', async function(){
			var baby = await Logic.Baby.getById(babyId02);
			test.object(baby);
			//update
			var birthDt = (new Date(2018,0,15)).getTime();
			baby.setBirthdate(birthDt);
			await Logic.Baby.save(baby, actioner);
			//
			var bby = await Logic.Baby.getById(babyId02);
			if (logEnabled) console.log('after update', bby);
			var birthDate = bby.getBirthdate();
			test.number(birthDate).isEqualTo(birthDt);
			console.log(typeof bby)
		});
	});

});
  