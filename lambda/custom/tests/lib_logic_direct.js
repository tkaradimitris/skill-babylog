'use strict';

const util = require('util');
const test = require('unit.js');
var Logic_1 = require('../lib/logic/logic.js');

var aws_sdk_1 = require("aws-sdk");
//new aws_sdk_1.DynamoDB({ apiVersion: 'latest' })
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var Logic = new Logic_1.Logic(dynamoDbClient);

var logEnabled = false;

describe('Logic - Direct', function() {
    var alxUserId = "amzn1.ask.account.123";
	var applicationId = "amzn1.ask.skill.8601fd83-83b4-44ce-bd84-142c70ad32e1";
	var deviceId = "amzn1.ask.device.123";
	//let actioner = new Logic.Actioner('ALEXA', applicationId, alxUserId);	
	Logic.setActioner('ALEXA', applicationId, alxUserId, deviceId);
	var userId1 = alxUserId + "-" + (new Date).getTime();
	var baby01 = 'Mary';

	describe('Logic - Samples', function(){
		it('getUserAlexa', async function(){
			var usr = await Logic.getUserAlexa(userId1);
			//console.log(util.inspect(usr, {showHidden: false, depth: null}));
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			var {Created, CreatedByType, CreatedByAppId, CreatedByUserId, CreatedByDeviceId} = usr.getInfo();
			test.string(CreatedByType).isEqualTo('ALEXA');
			test.string(CreatedByAppId).isEqualTo(applicationId);
			test.string(CreatedByUserId).isEqualTo(alxUserId);
			test.string(CreatedByDeviceId).isEqualTo(deviceId);
			test.number(Created);
			test.assert(Created < (new Date).getTime());
		});
		it('usr has not new baby', async function(){
			var usr = await Logic.getUserAlexa(userId1);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			var hasBaby01 = usr.hasBabyByName(baby01);
			test.assert(hasBaby01 === false);
			var baby = usr.getBabyByName(baby01);
			test.assert(baby === null);
		});
		it('usr gets new baby', async function(){
			var usr = await Logic.getUserAlexa(userId1);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			var hasBaby01 = usr.hasBabyByName(baby01);
			test.assert(hasBaby01 === false);
			var usr2 = await Logic.addBabyToUserAlexa(usr, baby01);
			test.object(usr2);
			//console.log(util.inspect(usr2, {showHidden: false, depth: null}));
		});
		it('usr add poo to baby', async function(){
			var usr = await Logic.getUserAlexa(userId1);
			test.object(usr).string(usr.UserId).isEqualTo(userId1);
			var hasBaby01 = usr.hasBabyByName(baby01);
			test.assert(hasBaby01 === true);
			await Logic.addBabyPooToUserAlexa(usr, baby01, 'Normal');
			//var usr2 = await Logic.addBabyToUserAlexa(usr, baby01);
			test.object(usr);
			var baby = usr.getBabyByName(baby01);
			test.object(baby).string(baby.BabyId).string(baby.getName()).isEqualTo(baby01);
			var poo = baby.getItemByType(Logic.BabiesHelper.cItemTypePoo);
			test.object(poo);
			var notes = poo.getNotes();
			test.string(notes).isEqualTo('Normal');
			console.log(util.inspect(usr, {showHidden: false, depth: null}));
		});
	});
	/*
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
			var bby2 = await Logic.addMeasurement(baby, itemType, null, measurement01, measurement01Notes, actioner);
			var bby3 = await Logic.addMeasurement(baby, Logic.BabiesHelper.cItemTypeFeeding, null, null, 'Milk and cookies', actioner);
			console.log(util.inspect(bby3, {showHidden: false, depth: null}));
		});
	});
	*/
});
