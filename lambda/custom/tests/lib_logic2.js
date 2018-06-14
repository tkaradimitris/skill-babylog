'use strict';

const util = require('util');
const test = require('unit.js');
var Logic_1 = require('../lib/logic/logic.js');

var aws_sdk_1 = require("aws-sdk");
//new aws_sdk_1.DynamoDB({ apiVersion: 'latest' })
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var Logic = new Logic_1.Logic(dynamoDbClient);

var logEnabled = false;

describe('Logic NEW', function() {
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
	
	describe('Logic.Basic', function(){
		it('test1', async function(){
            var tst = Logic.test();
            test.number(tst).isEqualTo(1);
            tst = Logic.testUsersAlexaHelper(2);
            test.number(tst).isEqualTo(2);
            tst = Logic.UsersAlexaHelper.test(3);
            test.number(tst).isEqualTo(3);
		});
	});

	describe('Logic.UsersAlexaHelper', function(){
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
});
  