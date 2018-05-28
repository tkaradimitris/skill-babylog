'use strict';

//const supertest = require('supertest'); 
var fs = require("fs");
const test = require('unit.js');
const app = require('../index.js');
const intentHelper = require('../lib/intentHelper.js');

//const request = supertest(app);

//const helper = supertet(intentHelper);
//http://unitjs.com/guide/quickstart.html

const readJson = function(filename){
	var contents = fs.readFileSync(filename);
	var json = JSON.parse(contents);
	return json;
}

describe('Intent Helper', function() {

  it('verifies identifying intent by name', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		var  result2 = intentHelper.isIntent(request, "FeedingIntentXX");
		test
			.value(result).isEqualTo(true)
			.value(result2).isEqualTo(false);
		done();
  });
  
  it('verifies getting intent slot by name', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		test.value(result).isEqualTo(true);
		var  slot = intentHelper.getSlot(request, "Breast");
		test.object(slot).string(slot.name).isEqualTo("Breast");
		done();
  });
  
  it('Intent Slot Primary Value', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  slot = intentHelper.getSlot(request, "Breast");
		var value = intentHelper.getSlotPrimaryValue(slot);
		test.string(value).isEqualTo("right");
		
		done();
  });
  
  it('Intent Slot Original Value', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		var  value = intentHelper.getSlotOriginalValue(request, "Breast");
		test.string(value).isEqualTo("east");
		
		done();
  });
  
  it('Intent Slot Value', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		var  value = intentHelper.getSlotValue(request, "Breast");
		test.string(value).isEqualTo("right");
		
		done();
  });
  
  it('Intent Slot Value String', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		var  value = intentHelper.getSlotValueString(request, "Breast");
		test.string(value).isEqualTo("right");
		
		done();
  });
  
  it('Intent Slot Value Int / NaN', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		var  value = intentHelper.getSlotValueInt(request, "Breast");
		var isnan = isNaN(value) ? 1 : 0;
		test.number(isnan).isEqualTo(1);
		
		done();
  });    
  
  it('Intent Slot Value Int / 15', function(done){
		var invoke = readJson("./tests/invoke01.json");
		const { request, session } = invoke;
		var  result = intentHelper.isIntent(request, "FeedingIntent");
		var  value = intentHelper.getSlotValueInt(request, "IntSlot");
		test.number(value).isEqualTo(15);
		
		done();
  });
  
  it('Version', function(done){
			var result=intentHelper.version();
			test
			.string(result)
			.isEqualTo("0.0.1-alpha");
			done();
		});
		it('verifies invoke01.json read', function(done){
		var invoke = readJson("./tests/invoke01.json");
		test
		.object(invoke)
		.string(invoke.version)
			.isEqualTo("1.0")
		.object(invoke.request)
			.string(invoke.request.type)
				.isEqualTo("IntentRequest");
		done();
  });
  /*it('verifies get', function(done) {
    request.get('/').expect(200).end(function(err, result) {
        test.string(result.body.Output).contains('Hello');
        test.value(result).hasHeader('content-type', 'application/json; charset=utf-8');
        done(err);
    });
  });
  it('verifies get/data/id', function(done) {
    request.get('/data/id102030').expect(200).end(function(err, result) {
        test.string(result.body.Output).contains('id102030');
        test.value(result).hasHeader('content-type', 'application/json; charset=utf-8');
        done(err);
    });
  });
  it('verifies post', function(done) {
    request.post('/').expect(200).end(function(err, result) {
        test.string(result.body.Output).contains('Hello');
        test.value(result).hasHeader('content-type', 'application/json; charset=utf-8');
        done(err);
    });
  });*/
});
