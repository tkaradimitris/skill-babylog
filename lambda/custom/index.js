/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require('ask-sdk');
const util = require('util');
var aws_sdk_1 = require("aws-sdk");

const IntentHelper = require('./lib/intentHelper.js');
var Logic_1 = require('./lib/logic/logic.js');


var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
//var dynamoDbClient = new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
var Logic = new Logic_1.Logic(dynamoDbClient); 

//new aws_sdk_1.DynamoDB({ apiVersion: 'latest' })
//new AWS.DynamoDB({  endpoint: new AWS.Endpoint('http://localhost:8000')});
// const sessionHelper = {
	// async getData(attributesManager){
		// var data = await attributesManager.getPersistentAttributes() || {};
		// return data;
	// },
	// isEmpty(data){
		// return Object.keys(data).length === 0;
	// },
	// setData(attributesManager, data){
		// attributesManager.setSessionAttributes(data);
	// },
	// saveData(){
	// }
		// if (Object.keys(attributes).length === 0) {
		  // attributes.endedSessionCount = 0;
		  // attributes.gamesPlayed = 0;
		// }
	// }
// };

const LaunchRequest = {
  canHandle(handlerInput) {
    //we may need to ignore session.new if the user starts the skill with an Intent attached, tell skill that Freddy peed
    return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;
    return responseBuilder
      .speak("Hi there")
      .reprompt("Lets start")
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, ['AMAZON.CancelIntent','AMAZON.StopIntent']);
    /*return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');*/
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Goodbye!')
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, 'AMAZON.HelpIntent');
  },
  handle(handlerInput) {
    const speechOutput = 'I can log and recover information for when your baby was fed, peed or pooed.' +
            'Also about its weight and height.';
    const reprompt = 'Feeding, pee, poo, weight and height.';

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, 'AMAZON.YesIntent');
  },
  handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.guessNumber = Math.floor(Math.random() * 100);

    return responseBuilder
      .speak('Great! Try saying a number to start the game.')
      .reprompt('Try saying a number.')
      .getResponse();
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, 'AMAZON.NoIntent');
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.endedSessionCount += 1;
    attributesManager.setPersistentAttributes(sessionAttributes);
    await attributesManager.savePersistentAttributes();

    return responseBuilder.speak('Ok, see you next time!').getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const outputSpeech = 'Not sure what you mean. Say Help to know how to use my skills.';
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};

const FeedingIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
	  return IntentHelper.isIntent(request, 'FeedingIntent');
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    var intentValues = IntentHelper.getIntentValues(requestEnvelope.request);

    var act = IntentHelper.getActioner(requestEnvelope.context);
    Logic.setActioner('ALEXA', act.ApplicationId, act.UserId, act.DeviceId);
    
    var usr = await Logic.getUserAlexa(act.UserId);
    /*
    var babies1 = 0;
    if (usr && usr.Babies) babies1 = usr.Babies.length;
    console.log('babies1', babies1);

    var names = usr.getBabyNames();
    console.log('babies1 names', names);
    */
    //console.log('usr', usr);
    //console.log('intentValues',intentValues);
    //console.log(util.inspect(usr, {showHidden: false, depth: 3}));
    var notes = intentValues.Breast ? intentValues.Breast : null;
    await Logic.addBabyFeedingToUserAlexa(usr, intentValues.Baby, notes);
    /*
    var babies2 = 0;
    if (usr && usr.Babies) babies2 = usr.Babies.length;
    console.log('babies2', babies2);
    await Logic.addBabyFeedingToUserAlexa(usr, intentValues.Baby, notes);
    var babies3 = 0;
    if (usr && usr.Babies) babies3 = usr.Babies.length;
    console.log('babies3', babies3);
    
    var usr1 = await Logic.getUserAlexa(act.UserId);
    await Logic.addBabyFeedingToUserAlexa(usr1, intentValues.Baby, notes);
    var babies4 = 0;
    if (usr1 && usr1.Babies) babies4 = usr1.Babies.length;
    console.log('babies4', babies4);
    */

    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.Last = sessionAttributes.Last || {};
    sessionAttributes.Last.IntentName = IntentHelper.getIntentName(requestEnvelope.request);
    sessionAttributes.Last.Values = intentValues;
    sessionAttributes.Last.When = (new Date).getTime();
    sessionAttributes.User = usr;
	  attributesManager.setSessionAttributes(sessionAttributes);
	  //commented next line to avoid saving data to db, while testing locally
    //await attributesManager.savePersistentAttributes();
    //getRequestAttributes() setRequestAttributes(requestAttributes : {[key : string] : any}) : void;
    //getSessionAttributes() setSessionAttributes(sessionAttributes : {[key : string] : any}) : void;
    //getPersistentAttributes() setPersistentAttributes(persistentAttributes : {[key : string] : any}) : void;
    //  savePersistentAttributes() : Promise<void>;
	
    return handlerInput.responseBuilder
      .speak('You said ' + intentValues.Breast + ', correct?' + (intentValues.Baby ? ' And ' + intentValues.Baby + '.' : ''))
      .reprompt(intentValues.Breast + ' is what you said')
      .getResponse();
  },
};

const  PeeIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, 'PeeIntent');
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    var intentValues = IntentHelper.getIntentValues(requestEnvelope.request);
    //console.log('intentValues',intentValues);
    var act = IntentHelper.getActioner(requestEnvelope.context);
    Logic.setActioner('ALEXA', act.ApplicationId, act.UserId, act.DeviceId);
    
    var usr = await Logic.getUserAlexa(act.UserId);
    var last = Logic.getBabyLastPee(usr, intentValues.Baby);
    var when = null, value = null, notes = null;
    if (last){
      when = last.When;
      value = last.Value;
      notes = last.Notes;
    }

    await Logic.addBabyPeeToUserAlexa(usr, intentValues.Baby, null);

    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.Last = sessionAttributes.Last || {};
    sessionAttributes.Last.IntentName = IntentHelper.getIntentName(requestEnvelope.request);
    sessionAttributes.Last.Values = intentValues;
    sessionAttributes.Last.When = (new Date).getTime();
    sessionAttributes.User = usr;
	  attributesManager.setSessionAttributes(sessionAttributes);

    var speak = `Ok, pee time for ${intentValues.Baby} has been logged.`;
    //add info for last time
    if (when){
      var diff = IntentHelper.getRelativeTime(when);
      if (diff.Text){
        speak += ' Last time was ' + diff.Text + ' ago.'
      }
    }

    return responseBuilder
    .speak(speak)
    .reprompt('Pee logged.')
      .getResponse();
    },
};

const PooIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, 'PooIntent');
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    var intentValues = IntentHelper.getIntentValues(requestEnvelope.request);

    var act = IntentHelper.getActioner(requestEnvelope.context);
    Logic.setActioner('ALEXA', act.ApplicationId, act.UserId, act.DeviceId);
    
    var usr = await Logic.getUserAlexa(act.UserId);
    await Logic.addBabyPooToUserAlexa(usr, intentValues.Baby, null);

    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.Last = sessionAttributes.Last || {};
    sessionAttributes.Last.IntentName = IntentHelper.getIntentName(requestEnvelope.request);
    sessionAttributes.Last.Values = intentValues;
    sessionAttributes.Last.When = (new Date).getTime();
    sessionAttributes.User = usr;
	  attributesManager.setSessionAttributes(sessionAttributes);

    return responseBuilder
    .speak(`Ok, I logged the poo time for ${intentValues.Baby}.`)
    .reprompt('Poo logged.')
    .getResponse();
    },
};

const WeightIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return IntentHelper.isIntent(request, 'WeightIntent');
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

    const baby = IntentHelper.getSlotValueString(requestEnvelope.request, "Baby");
    const weightMajor = IntentHelper.getSlotValueInt(requestEnvelope.request, "WeightMajor");
    const weightMinor = IntentHelper.getSlotValueInt(requestEnvelope.request, "WeightMinor");
    const weightUnitMajor = IntentHelper.getSlotValueString(requestEnvelope.request, "WeightUnitMajor");
    const weightUnitMinor = IntentHelper.getSlotValueString(requestEnvelope.request, "WeightUnitMinor");
    var epoch = new Date().getTime();
	
    var paramsMajor = (weightMajor ? weightMajor + (weightUnitMajor ? ' ' + weightUnitMajor : '') : '');
    var paramsMinor = (weightMinor ? ' ' + weightMinor + (weightUnitMinor ? ' ' + weightUnitMinor : '') : '');
    var params = (baby ? baby : 'baby') + ' weighs ' + paramsMajor + paramsMinor;
	
    return responseBuilder
      .speak('Weight intent indeed, ' + params)
      .reprompt('Weight intent, ' + params)
      .getResponse();
    },
};

const NumberGuessIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
	return IntentHelper.isIntent(request, 'NumberGuessIntent');
    //return request.type === 'IntentRequest' && request.intent.name === 'NumberGuessIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

    const guessNum = parseInt(requestEnvelope.request.intent.slots.number.value, 10);
    const sessionAttributes = attributesManager.getSessionAttributes();
    const targetNum = sessionAttributes.guessNumber;

    if (guessNum > targetNum) {
      return responseBuilder
        .speak(`${guessNum.toString()} is too high.`)
        .reprompt('Try saying a smaller number.')
        .getResponse();
    } else if (guessNum < targetNum) {
      return responseBuilder
        .speak(`${guessNum.toString()} is too low.`)
        .reprompt('Try saying a larger number.')
        .getResponse();
    } else if (guessNum === targetNum) {
      sessionAttributes.gamesPlayed += 1;
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
      return responseBuilder
        .speak(`${guessNum.toString()} is correct! Would you like to play a new game?`)
        .reprompt('Say yes to start a new game, or no to end the game.')
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t get that. Try saying a number.')
      .reprompt('Try saying a number.')
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    var errorMessage = error.message;
    console.log('Error', error);
    var say = `Something went wrong. This error message is ${error.message} and it occured in line ${error.lineNumber}.`;
    var reprompt = `${error.message}. Line ${error.lineNumber}.`;
    return handlerInput.responseBuilder
      .speak(say)
      .reprompt(reprompt)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();
/*
var dynamoDbClient = new AWS.DynamoDB({  endpoint: new AWS.Endpoint('http://localhost:8000')});
*/
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
	FeedingIntent,
	PeeIntent,
	PooIntent,
	WeightIntent,
    NumberGuessIntent,
    UnhandledIntent,
  )
  .addErrorHandlers(ErrorHandler)
  .withDynamoDbClient(dynamoDbClient)
  .withTableName('BabyLog')
  //.withReadCapacityUnits(1)
  //.withWriteCapacityUnits(1)
  .withAutoCreateTable(true)
  .lambda();
