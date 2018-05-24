/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require('ask-sdk');
var aws_sdk_1 = require("aws-sdk");

const IntentHelper = require('./lib/intentHelper.js');

var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});


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
    return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;
    return responseBuilder
      .speak("Hi there")
      .reprompt("Lets start")
      .getResponse();
	/*
    const attributes = await attributesManager.getPersistentAttributes() || {};
    if (Object.keys(attributes).length === 0) {
      attributes.endedSessionCount = 0;
      attributes.gamesPlayed = 0;
    }

    attributesManager.setSessionAttributes(attributes);
    const speechOutput = `Welcome to Baby Log. You have played ${attributes.gamesPlayed.toString()} times. would you like to play?`;
    const reprompt = 'Say yes to start the game or no to quit.';
    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
	*/
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
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
    //return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechOutput = 'I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
            ' if it is higher or lower.';
    const reprompt = 'Try saying a number.';

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
    //return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
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
    //return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
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
    const outputSpeech = 'Say yes to continue, or no to end the game.';
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
    //return request.type === 'IntentRequest' && request.intent.name === 'FeedingIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
	

	var breast = IntentHelper.getSlotValueString(requestEnvelope.request, "Breast");
	var baby = IntentHelper.getSlotValueString(requestEnvelope.request, "Baby");
	var epoch = new Date().getTime();
	
    const sessionAttributes = attributesManager.getSessionAttributes();
	sessionAttributes.feeding = sessionAttributes.feeding || {};
	sessionAttributes.feeding.breast = breast;
	sessionAttributes.feeding.baby = baby;
	sessionAttributes.feeding.epoch = epoch;
	attributesManager.setPersistentAttributes(sessionAttributes);
	//commented next line to avoid saving data to db, while testing locally
	//await attributesManager.savePersistentAttributes();
	
    return handlerInput.responseBuilder
      .speak('You said ' + breast + ', correct?' + (baby ? ' And ' + baby + '.' : ''))
      .reprompt(breast + ' is what you said')
      .getResponse();
	  
    const guessNum = parseInt(requestEnvelope.request.intent.slots.number.value, 10);
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

const  PeeIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
	return IntentHelper.isIntent(request, 'PeeIntent');
    //return request.type === 'IntentRequest' && request.intent.name === 'PeeIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
	
	return responseBuilder
		.speak('Pee intent indeed')
		.reprompt('Pee intent')
		.getResponse();
  },
};

const PooIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
	return IntentHelper.isIntent(request, 'PooIntent');
    //return request.type === 'IntentRequest' && request.intent.name === 'PooIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

	return responseBuilder
		.speak('Poo intent indeed')
		.reprompt('Poo intent')
		.getResponse();
  },
};

const WeightIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
	return IntentHelper.isIntent(request, 'WeightIntent');
    //return request.type === 'IntentRequest' && request.intent.name === 'WeightIntent';
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
    console.log(`Error occured: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again. Line ' + error.lineNumber + '. ' + error.message)
      .reprompt('Sorry, I can\'t understand the command. Please say again. Line ' + error.lineNumber + '. ' + error.message)
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
