'use strict';

//const supertest = require('supertest'); 
var fs = require("fs");
const test = require('unit.js');
const app = require('../index.js');

//http://unitjs.com/guide/quickstart.html

const readJson = function(filename){
	var contents = fs.readFileSync(filename);
	var json = JSON.parse(contents);
	return json;
}

describe('Index', function() {

  it('FeedIntent Sample', function(done){		
		var invoke = readJson("./tests/invoke01.json");
		const { request, session, context } = invoke;
		
			var event = {};
			var callback = function(err, response){
			//if(err) console.error(err);
			//else console.log(response);
			if(err) reject(err);
			else done();
			};
		app.handler(invoke, context, callback);
		//done();
  });

  it('ExitIntent - AMAZON.CancelIntent', function(done){		
		var invoke = readJson("./tests/invoke01.json");
		const { request, session, context } = invoke;
		request.intent.name = "AMAZON.CancelIntent";
		app.handler(invoke, context, function(err, response){
			//if(err) console.error(err);
			//else console.log(response);
			if(err) throw err;
			else {
				test.object(response);
				test.object(response.response);
				test.object(response.response.outputSpeech);
				test.string(response.response.outputSpeech.ssml).isEqualTo('<speak>Goodbye!</speak>');
				done();
			}
		});
  });

  it('ExitIntent - AMAZON.StopIntent', function(done){		
		var invoke = readJson("./tests/invoke01.json");
		const { request, session, context } = invoke;
		var callback = function(err, response){
			//if(err) console.error(err);
			//else console.log(response);
			if(err) done(err);
			else {
				console.log(response);
				test.object(response);
				test.object(response.response);
				test.object(response.response.outputSpeech);
				test.string(response.response.outputSpeech.ssml).isEqualTo('<speak>Goodbye!</speak>');
				done();
			}
		};
		request.intent.name = "AMAZON.StopIntent";
		app.handler(invoke, context, callback);
  });
  
});
