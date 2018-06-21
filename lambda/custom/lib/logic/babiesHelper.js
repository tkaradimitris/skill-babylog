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

    isValidItemType(itemType){
        if (!itemType) return false;
        return (
            itemType === this.cItemTypeFeeding |
            itemType === this.cItemTypeHeight |
            itemType === this.cItemTypeIll |
            itemType === this.cItemTypePee |
            itemType === this.cItemTypePoo |
            itemType === this.cItemTypeWeight
        );
    };
    
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

    /**
     * Gets a number of Babies by their ids
     * @param {string[]} babyIds The ids of the Babies
     * @return {Promise<Baby[]>}
     */
    async getByIds(babyIds){
        if (!babyIds) throw new Error('babyIds is required');
        if (!Array.isArray(babyIds)) throw new Error('babyIds must be an array');
        var dbItems = await this.DynamoDbHelper.Babies.getByIds(babyIds);
        if (!dbItems) return null;
        else{
            var items = [];
            for(var i=0;i<dbItems.length;i++){
                var item = new Baby();
                this.__assign(item, dbItems[i]);
                items.push(item);
            }
            return items;
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
     * Generates a new baby instance, just with a BabyId
     * @return {object}
     */
    generateItem(baby, itemType, actioner){
        if (!baby) throw new Error('baby is required');
        if (!itemType) throw new Error('itemType is required');
        var item = new Item();
        item.ItemId = baby.BabyId + "-" + itemType; //this.generateId(itemType);
        item.Type = itemType;
        this.DynamoDbHelper.__created(item, actioner);
        baby.addItem(item);
        return item;
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

    async scan(limit){
        return await this.DynamoDbHelper.Babies.scan(limit);
    }

}

exports.BabiesHelper = BabiesHelper;