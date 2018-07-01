
const moment = require('moment');
const numberToWords = require('number-to-words');

const helper = {
	version(){
		return "0.0.1-alpha";
	},
    /**
     * Gets the type of the request, as string
     * @param {object} request The request part of the requestEnvelope
     * @return {string} The request's type, eg LaunchRequest, IntentRequest, SessionEndedRequest
     */
	getRequestType(request){
		if (!request || !request.type) return null;
		return request.type;
	},
    /**
     * Gets the name of the requested intent
     * @param {object} request The request part of the requestEnvelope
     * @return {string} The intent's name or null if not on IntentRequest
     */
	getIntentName(request){
		var requestType = this.getRequestType(request);
		if (!requestType || !requestType === 'IntentRequest') return null;
		if (!request.intent || !request.intent.name) return null;
		return request.intent.name;		
	},
	isIntent(request, intentName){
		var intent = this.getIntentName(request);
		if (Array.isArray(intentName))
			return intentName.indexOf(intent) > -1;
		else
			return intentName === intent;
		//return request.type === 'IntentRequest' && request.intent.name === intentName;
	},
	getSlot(request, slotName){
		if (!request || !request.intent.slots[slotName]) return null;
		return request.intent.slots[slotName];
	},
    /**
     * Get's a slot's primary value.
	 * Used when synonyms have been defined for slot's values and it contains the main value
	 * while slot.value contains the original value of the user, before translating to its 
	 * primary value.
	 * eg We expect Up, and we have defined synonym Upwards.
	 * We want to use Up, but the slot.value=Upwards (user said Upwards)
	 * This method will return Up
     * @param {object} request The request containing all the details
     * @param {string} slotName The name of the slot we need
     * @return {object} The primary value value which matches user's input
     */
	getSlotPrimaryValue(slot){
		if (!slot) return null;
		if (!slot.resolutions || !slot.resolutions.resolutionsPerAuthority || slot.resolutions.resolutionsPerAuthority.length === 0) return null;
		var auth = slot.resolutions.resolutionsPerAuthority[0];
		if (!auth || !auth.status || !auth.status.code || auth.status.code != 'ER_SUCCESS_MATCH') return null;
		if (!auth.values || auth.values.length === 0) return null;
		var value = auth.values[0];
		if (!value || !value.value || !value.value.name) return null;
		return value.value.name;
	},
    /**
     * Get's a slot's value (slot.value)
     * @param {object} request The request containing all the details
     * @param {string} slotName The name of the slot we need
     * @return {object} The value set directly on the slot
     */
	getSlotOriginalValue(request, slotName){
		var slot = this.getSlot(request, slotName);
		if (!slot) return null;
		var value = slot.value;
		return value;
	},
    /**
     * Get's a slot's value, with a preference for Primary values
	 * ie, when users speaks a synonym, we prefer the primary value of the synonym
     * @param {object} request The request containing all the details
     * @param {string} slotName The name of the slot we need
     * @return {object} The slot's value
     */
	getSlotValue(request, slotName){
		var slot = this.getSlot(request, slotName);
		if (!slot) return null;
		var value = slot.value;
		var primary = this.getSlotPrimaryValue(slot);
		if (primary) value = primary;
		return value;
	},
	getSlotValueString(request, slotName){
		var value = this.getSlotValue(request, slotName);
		return value ? value + '' : null;
	},
	getSlotValueInt(request, slotName){
		var value = this.getSlotValueString(request, slotName);
		return parseInt(value, 10);
	},
    /**
     * Gets application, device and user for the caller
     * @param {object} context The context part of the requestEnvelope
     * @return {object} An object with ApplicationId, DeviceId and UserId
     */
	getActioner(context){
		if(!context || !context.System) return null;
		var applicationId = null;
		var userId = null;
		var deviceId = null;
		if (context.System.application) applicationId=context.System.application.applicationId;
		if (context.System.user) userId=context.System.user.userId;
		if (context.System.device) deviceId=context.System.device.deviceId;
		return {
			ApplicationId: applicationId,
			DeviceId: deviceId,
			UserId: userId
		};
	},
    /**
     * Gets the values of the current intent
     * @param {object} request The request part of the requestEnvelope
     * @return {object} An dynamic object with properties for the current Intent
	 * FeedingIntent: Baby (name), Breast, Notes
     */
	getIntentValues(request){
		var requestType = this.getRequestType(request);
		if (!requestType || !requestType === 'IntentRequest') return null;

		var intent = this.getIntentName(request);
		if (!intent) return null;
		var data = null;
		const cBaby='Baby', cBreast='Breast', cNotes='Notes', cWhen='When';

		switch(intent){
			case 'FeedingIntent':
				data = {};
				var breast = this.getSlotValueString(request, cBreast);
				var baby = this.getSlotValueString(request, cBaby);
				var when = this.getSlotValueString(request, cWhen);
				var notes = this.getSlotValueString(request, cNotes);
				if (breast) data.Breast = breast;
				if (baby) data.Baby = baby;
				if (when) data.When = when;
				if (notes) data.Notes = notes;
				break;
			case 'PeeIntent':
			case 'PooIntent':
				data = {};
				var baby = this.getSlotValueString(request, cBaby);
				var when = this.getSlotValueString(request, cWhen);
				var notes = this.getSlotValueString(request, cNotes);
				if (baby) data.Baby = baby;
				if (when) data.When = when;
				if (notes) data.Notes = notes;
				break;
		};
		return data;
	},
    /**
     * Expresses the difference between now a given time as a relative number of minues and a text duration
	 * eg twenty five minutes ago
     * @param {number} when The epoch of the previous event
     * @return {object{number, string}} The result as Minutes and Text
     */
	getRelativeTime(when){
		if (!when) return null;
		var now = (new Date).getTime();
		var start = moment(when);
		var end = moment();
		var diffMinutes = end.diff(start,'minutes');
		var diffHours = end.diff(start,'hours');
		var diffDays = end.diff(start,'days');
		var text = null;
		if (diffDays > 0)
			text = numberToWords.toWords(diffDays) + ' days';
		else if (diffHours > 0)
			text = numberToWords.toWords(diffHours) + ' hours';
		else if (diffMinutes > 0)
			text = numberToWords.toWords(diffMinutes) + ' minutes';
		return {Days: diffDays, Hours: diffHours, Minutes: diffMinutes, Text: text};
	},
};

module.exports = helper;