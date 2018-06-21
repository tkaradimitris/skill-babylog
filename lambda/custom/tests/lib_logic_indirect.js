'use strict';

const util = require('util');
const test = require('unit.js');
var Logic_1 = require('../lib/logic/logic.js');

var aws_sdk_1 = require("aws-sdk");
//new aws_sdk_1.DynamoDB({ apiVersion: 'latest' })
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var Logic = new Logic_1.Logic(dynamoDbClient);

var logEnabled = false;

describe('Logic - Indirect', function() {
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
	var itemId00 = "Item-unknown";
	var itemId01 = "Item-01";
	var itemWhen01 = null;
	var itemValue01 = 14;
	var itemNotes01 = "Notes of 1st item";
	var measurement01 = 10.5;
	var measurement01Notes = "Some notes";
	Logic.setActioner('ALEXA', applicationId, alxUserId);

	describe('Logic.UsersAlexaHelper - basic', function(){
		it('getById - search for unknown', async function(){
			var usr = await Logic.UsersAlexaHelper.getById(userId0);
			test.assert(usr === null);
		});
		it('getOrCreateById', async function(){
			var usr = await Logic.UsersAlexaHelper.getOrCreateById(userId1, actioner);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			if (logEnabled) console.log(usr);
		});
		it('getById - search for known', async function(){
			var usr = await Logic.UsersAlexaHelper.getById(userId1);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			test.object(usr.attributes).object(usr.attributes.Info);
			var info = usr.attributes.Info;
			test.number(info.Created).string(info.CreatedByType).isEqualTo(actioner.Type);
		});
		it('UsersAlexa Scan', async function(){
			var response = await Logic.UsersAlexaHelper.scan();
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
	});
	

	describe('Logic.BabiesHelper - basic', function(){
		it('create', async function(){
			var baby = Logic.BabiesHelper.generate();
			baby.setName(baby01);
			baby.setGender('Male');
			baby.setPrematureByWeeks(6);
			babyId01 = await Logic.BabiesHelper.create(baby, actioner);
			test.string(babyId01).isEqualTo(baby.BabyId);
			//get
			var bby = await Logic.BabiesHelper.getById(babyId01);
			if (logEnabled) console.log(bby);
			test.object(bby).string(bby.BabyId).isEqualTo(babyId01);
			test.object(bby).hasProperty('attributes').object(bby.attributes)
			.hasProperty('Name').string(bby.attributes.Name).isEqualTo(baby01);
		});
		it('createByName', async function(){
			babyId02 = await Logic.BabiesHelper.createByName(baby02, actioner);
			test.string(babyId02);
			//get
			var bby = await Logic.BabiesHelper.getById(babyId02);
			if (logEnabled) console.log(bby);
			test.object(bby).string(bby.BabyId).isEqualTo(babyId02);
			test.object(bby).hasProperty('attributes').object(bby.attributes)
			.hasProperty('Name').string(bby.attributes.Name).isEqualTo(baby02);
		});
		it('getById - known', async function(){
			var baby = await Logic.BabiesHelper.getById(babyId01);
			if (logEnabled) console.log(baby);
			test.object(baby).string(baby.BabyId).isEqualTo(babyId01);
			test.object(baby).hasProperty('attributes').object(baby.attributes)
			.hasProperty('Name').string(baby.attributes.Name).isEqualTo(baby01);
		});
		it('getById and update', async function(){
			var baby = await Logic.BabiesHelper.getById(babyId02);
			test.object(baby);
			//update
			var birthDt = (new Date(2018,0,15)).getTime();
			baby.setBirthdate(birthDt);
			await Logic.BabiesHelper.save(baby, actioner);
			//
			var bby = await Logic.BabiesHelper.getById(babyId02);
			if (logEnabled) console.log('after update', bby);
			var birthDate = bby.getBirthdate();
			test.number(birthDate).isEqualTo(birthDt);
		});
		it('getByIds - multiple babies', async function(){
			var ids = [babyId01, babyId02];
			//var baby = await Logic.BabiesHelper.getById('baby-9fc83b60-73fd-11e8-8f89-5f77901c7512');
			//console.log(baby);
			var babies = await Logic.BabiesHelper.getByIds(ids);
			if (logEnabled) console.log(babies);
			test.object(babies);
			test.assert(babies.length === 2);
			//test.object(baby).string(baby.BabyId).isEqualTo(babyId01);
			//test.object(baby).hasProperty('attributes').object(baby.attributes)
			//.hasProperty('Name').string(baby.attributes.Name).isEqualTo(baby01);
		});
	});
	
	describe('Logic.MeasurementsHelper - basic', function(){
		it('get - unknown', async function(){
			var epoch = (new Date).getTime();
			var entry = await Logic.MeasurementsHelper.get(itemId00, epoch);
			if (logEnabled) console.log(entry);
			test.assert(entry === null);
		});
		it('create', async function(){
			var entry = Logic.MeasurementsHelper.generate(itemId01);
			itemWhen01 = (new Date).getTime();
			entry.When = itemWhen01;
			entry.setValue(itemValue01);
			entry.setNotes(itemNotes01);
			await Logic.MeasurementsHelper.create(entry, actioner);
			//get
			var item = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			if (logEnabled) console.log(item);
			test.object(item).string(item.ItemId).isEqualTo(itemId01);
			test.object(item).number(item.When).isEqualTo(itemWhen01);
			var value = entry.getValue();
			var notes = entry.getNotes();
			test.number(value).isEqualTo(itemValue01);
			test.string(notes).isEqualTo(itemNotes01);
		});
		it('update', async function(){
			//get
			var item = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			test.object(item);
			//modify
			var value = item.getValue() + 10.5;
			var notes = item.getNotes() + ' is now modified';
			item.setValue(value);
			item.setNotes(notes);
			await Logic.MeasurementsHelper.save(item, actioner);
			//get again
			var itm = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			test.object(itm).number(itm.getValue()).isEqualTo(value);
			test.object(itm).string(itm.getNotes()).isEqualTo(notes);
		});
		it('delete - by object', async function(){
			//get
			var item = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			test.object(item);
			//delete
			await Logic.MeasurementsHelper.delete(item);
			//get again
			var itm = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			test.assert(itm === null);
		});
		it('delete - by itemId & when', async function(){
			//create record to delete
			var entry = Logic.MeasurementsHelper.generate(itemId01);
			itemWhen01 = (new Date).getTime();
			entry.When = itemWhen01;
			entry.setValue(itemValue01);
			entry.setNotes(itemNotes01);
			await Logic.MeasurementsHelper.create(entry, actioner);
			//get
			var item = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			test.object(item);
			//delete
			await Logic.MeasurementsHelper.delete(item.ItemId, item.When);
			//get again
			var itm = await Logic.MeasurementsHelper.get(itemId01, itemWhen01);
			test.assert(itm === null);
		});
	});
	
	describe('Logic.BabiesHelper - Items', function(){
		it('create new baby', async function(){
			var baby = Logic.BabiesHelper.generate();
			baby.setName(baby02);
			baby.setGender('Female');
			baby.setPrematureByWeeks(12);
			babyId02 = await Logic.BabiesHelper.create(baby, actioner);
			test.string(babyId02).isEqualTo(baby.BabyId);
			var bby = await Logic.BabiesHelper.getById(babyId02);
			test.object(bby);
		});
		it('itemType - not existing', async function(){
			var bby = await Logic.BabiesHelper.getById(babyId02);
			test.object(bby);
			//check baby does not have feeding item
			var itemType = Logic.BabiesHelper.cItemTypeFeeding;
			var hasFeeding = bby.hasItem(itemType);
			test.assert(hasFeeding == false);
		});
		it('itemType - add Feeding', async function(){
			//get baby
			var bby = await Logic.BabiesHelper.getById(babyId02);
			test.object(bby);
			//check item is not there
			var itemType = Logic.BabiesHelper.cItemTypeFeeding;
			var hasFeeding = bby.hasItem(itemType);
			test.assert(hasFeeding === false);
			//create new item
			var item = await Logic.BabiesHelper.addItem(bby, itemType, actioner);
			test.object(item);
			//get from db to ensure item has been stored			
			var baby = await Logic.BabiesHelper.getById(babyId02);
			test.object(baby);
			var items = baby.getItems();
			test.object(items).number(items.length);
			test.assert(items.length > 0);
			var itm = items[0];
			test.object(itm).string(itm.Type).isEqualTo(itemType);
		});
		it('itemType - add Weight and a measurement', async function(){
			//get baby
			var bby = await Logic.BabiesHelper.getById(babyId02);
			test.object(bby);
			//check item is not there
			var itemType = Logic.BabiesHelper.cItemTypeWeight;
			var hasWeight = bby.hasItem(itemType);
			test.assert(hasWeight === false);
			//create new item
			var item = await Logic.BabiesHelper.addItem(bby, itemType, actioner);
			test.object(item);
			//get from db to ensure item has been stored			
			var baby = await Logic.BabiesHelper.getById(babyId02);
			test.object(baby);
			var items = baby.getItems();
			test.object(items).number(items.length);
			test.assert(items.length > 0);
			var itm = items[items.length - 1];
			test.object(itm).string(itm.Type).isEqualTo(itemType);
			//console.log('baby',baby);
			//add measurement
			var bby2 = await Logic.addMeasurement(baby, itemType, null, measurement01, measurement01Notes);//, actioner);
			var bby3 = await Logic.addMeasurement(baby, Logic.BabiesHelper.cItemTypeFeeding, null, null, 'Milk and cookies');//, actioner);
			//console.log(util.inspect(bby3, {showHidden: false, depth: null}));
		});
	});
});
  