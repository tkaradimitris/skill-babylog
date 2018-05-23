
const helper = {
	version(){
		return "0.0.1-alpha";
	},
	isIntent(request, intentName){
		return request.type === 'IntentRequest' && request.intent.name === intentName;
	},
	getSlot(request, slotName){
		if (!request || !request.intent.slots[slotName]) return null;
		return request.intent.slots[slotName];
	},
	//get the actual value, or the primary value when synonyms exist
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
	//get the actual value, or the primary value when synonyms exist
	getSlotOriginalValue(request, slotName){
		var slot = this.getSlot(request, slotName);
		if (!slot) return null;
		var value = slot.value;
		return value;
	},
	//get the actual value, or the primary value when synonyms exist
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
	}
};

module.exports = helper;