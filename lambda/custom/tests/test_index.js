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
		if(err) console.error(err);
		else console.log(response);
	  };
	app.handler(invoke, context, callback);
	done();
  });
  
});
