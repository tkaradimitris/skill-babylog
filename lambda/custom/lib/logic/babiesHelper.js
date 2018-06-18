'use strict';

const uuidv1 = require('uuid/v1');

var {LogicHelperBase} = require("./logicHelperBase.js");
var {Baby} = require("./babies.js");
var {Item} = require("./items.js");

class BabiesHelper extends LogicHelperBase{
    constructor(dynamoDbHelper){
        super(dynamoDbHelper);
        this.cItemTypeFeeding = "Feeding";
        this.cItemTypeWeight = "Weight";
        this.cItemTypeHeight = "Height";
        this.cItemTypePee = "Pee";
        this.cItemTypePoo = "Poo";
        this.cItemTypeIll = "Ill";
    }
    
    test(input){
        return input;
    }
    
    /**
     * Retrieve a Baby using its id
     * @param {string} babyId The baby id
     * @return {Promise<object>}
     */
    async getById(babyId){
        if (!babyId) throw new Error('babyId is required');
        var dbItem = await this.DynamoDbHelper.Babies.getById(babyId);
        if (!dbItem) return null;
        else{
            var item = new Baby();
            this.__assign(item, dbItem);
            return item;
        }
    };

    // /**
    //  * Retrieve an Alexa User using its id. Create one if its does not exist in db.
    //  * @param {string} userId The user id as given as input to alexa intend
    //  * @param {string} skillId The skill id used by the user
    //  * @return {Promise<UserAlexa>}
    //  */
    // async getOrCreateById(userId, actioner){
    //     if (!userId) throw new Error('userId is required');
    //     var usr = await this.getById(userId);
    //     if (!usr){
    //         await this.create(userId, actioner);
    //         usr = await this.getById(userId);
    //     }
        
    //     if (!usr) return null;
    //     else return usr;
    // };

    /**
     * Generates a new baby instance, just with a BabyId
     * @return {object}
     */
    generate(){
        var baby = new Baby();
        baby.BabyId = this.generateId('baby');
        return baby;
    }

    /**
     * Creates and stores and new Baby
     * @param {string} baby The baby instance
     * @param {string} actioner Details about the user and the app creatign the record
     * @return {Promise<string>} The id of the baby
     */
    async create(baby, actioner){
        if (!baby) throw new Error('baby is required');
        if (!baby.BabyId) baby.BabyId = this.generateId();
        await this.DynamoDbHelper.Babies.put(baby, actioner);
        return baby.BabyId;
    }

    /**
     * Creates and stores and new Baby usings its name
     * @param {string} name The name of the baby
     * @param {string} actioner Details about the user and the app creatign the record
     * @return {Promise<object>}
     */
    async createByName(name, actioner){
        if (!name) throw new Error('name is required');
        var baby = this.generate();
        baby.setName(name);
        await this.DynamoDbHelper.Babies.put(baby, actioner);
        return baby.BabyId;
    }

    /**
     * Saves a baby in the db
     * @param {Baby} baby The baby in reference
     * @param {Actioner} actioner The details about the user/app performing the action
     * @return {void}
     */
    async save(baby, actioner){
        if (!baby) throw new Error('baby is required');
        await this.DynamoDbHelper.Babies.update(baby, actioner);        
    }

    /**
     * Adds a new item of the givenp type to the given baby, assuming it does not already have one
     * The concept is to keep a single item per type, eg for feeding, weight, height etc
     * @param {object} baby The baby in which to add the new item
     * @param {string} itemType The type of the new item to add in the baby
     * @param {Actioner} actioner The details about the user/app performing the action
     * @return {Promise<object>}
     */
    async addItem(baby, itemType, actioner){
        if (!baby) throw new Error('baby is required');
        if (!itemType) throw new Error('itemType is required');
        var item = baby.getItemByType(itemType);
        if (!item){
            item = new Item();
            item.ItemId = baby.BabyId + "-" + itemType; //this.generateId(itemType);
            item.Type = itemType;
            this.DynamoDbHelper.__created(item, actioner);
            baby.addItem(item);
            await this.DynamoDbHelper.Babies.update(baby, actioner);
        }
        return item;
    }

    /**
     * Adds a new measurement on the baby's given item type
     * @param {object} baby The baby in which to add the new item
     * @param {string} itemType The type of the new item to add in the baby
     * @param {number} when The timestamp of the measurement (epoch). Leave null to set it to current epoch
     * @param {number} value The value of the measurement. Null for for simple timed items
     * @param {string} notes Notes to accompany the measurement
     * @param {Actioner} actioner The details about the user/app performing the action
     * @return {Promise<object>}
     */
    async addMeasurement(baby, itemType, when, value, notes, actioner){
        if (!baby) throw new Error('baby is required');
        if (!itemType) throw new Error('itemType is required');
        //get or create the item
        var item = await this.addItem(baby, itemType, actioner);
        //create a new measurement
        var entry = Logic.MeasurementsHelper.generate(item.ItemId);
        entry.When = when ? when : (new Date).getTime();
        entry.setValue(value);
        entry.setNotes(notes);
        //store new measurement
        await Logic.MeasurementsHelper.create(entry, actioner);
        //update last measurement, if it is later than the previous one
        if (!item.Last || item.Last.When < entry.When){
            item.Last.When = entry.When;
            item.Last.Value = entry.Value;
            item.Last.Notes = entry.Notes;
        }
        //this.DynamoDbHelper.Measurements.
    }

    async scan(limit){
        return await this.DynamoDbHelper.Babies.scan(limit);
    }

}

exports.BabiesHelper = BabiesHelper;