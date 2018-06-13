'use strict';

const util = require('util');
const test = require('unit.js');
var Logic_1 = require('../lib/logic/logic.js');

var aws_sdk_1 = require("aws-sdk");
//new aws_sdk_1.DynamoDB({ apiVersion: 'latest' })
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var Logic = new Logic_1.Logic(dynamoDbClient);

var logEnabled = false;

describe('Logic', function() {
    var alxUserId = "amzn1.ask.account.AETS2HEPC4ZEWDAJMGVELLZSTGOUATFFMT6BSZO367RGS4HYNRPDBG2IRTAHZZ2E3ZLMWHAXUQW4MAVH4ERQKB5OEAEMT7EUR363EYVTAFOT6GR6AHP5XINRCG4AELCDJZZY3UABIFLIN3BU7LDJ3JGVRDMKDCS4VIJ2YY6YMFA27Z67RURYDHKVSQPAFBTMWVLXEVYQ2RU67LI";
	var applicationId = "amzn1.ask.skill.8601fd83-83b4-44ce-bd84-142c70ad32e7";
	var deviceId = "amzn1.ask.device.AHUPPP6AEG4ALGU2X57TCHECYMQTA75PF3XLLJXIGYQGPOVHUJBDOCC23JHHRVAAZ2WA22X4TKU5KC47I4M53HUHTIL4PHSCKS7TVP3X2MLGM6YNLPJG2IXBX4FMSFZD2NEOBQ3K6B6DF46AD6TO6I3BO65Q";
	//let actioner = new Logic.Actioner('ALEXA', applicationId, alxUserId);
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
            var tst = Logic.get1();
            test.number(tst).isEqualTo(1);
            tst = Logic.get2();
            test.number(tst).isEqualTo(2);
		});
	});
});
  