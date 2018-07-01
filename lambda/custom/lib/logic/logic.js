'use strict';


//var aws_sdk_1 = require("aws-sdk");
const DynamoDbHelper_1 = require('../db/dynamoDB.js');
const {Actioner} = require('./actioner.js');
const {UserAlexa} = require("./usersAlexa.js");
const {Baby} = require("./babies.js");
const {Measurement} = require("./measurements.js");
const {UsersAlexaHelper} = require("./usersAlexaHelper.js");
const {BabiesHelper} = require("./babiesHelper.js");
const {MeasurementsHelper} = require("./measurementsHelper.js");

class Logic{
    constructor(dynamoDbClient){
        this.dynamoDbClient = dynamoDbClient ? dynamoDbClient : new aws_sdk_1.DynamoDB({ apiVersion: 'latest' });
        this.DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: this.dynamoDbClient, prefix: "BabyLog"});
        
        //classes
        this.Actioner = Actioner;
        this.UserAlexa = UserAlexa;
        this.Baby = Baby;
        this.Measurement = Measurement;
        //helpers
        this.UsersAlexaHelper = new UsersAlexaHelper(this.DynamoDbHelper);
        this.BabiesHelper = new BabiesHelper(this.DynamoDbHelper);
        this.MeasurementsHelper = new MeasurementsHelper(this.DynamoDbHelper);
    }

    /**
     * Set details for the current user/app
     * They will be used to record any action he/she performs
     * @param {string} type The type of app used. ALEXA for skill, WEB, IOS, ANDROID etc
     * @param {string} applicationId Skill id or app name
     * @param {string} userId The user identifier on hir/her current app
     * @param {string} deviceId The device identifier used by the user
     * @return {void}
     */
    setActioner(type, applicationId, userId, deviceId){
        this.actioner = new this.Actioner(type, applicationId, userId, deviceId);
    };

    /**
     * Gets or creates an alexa skill user
     * If it has associated babies, these are also returned
     * @param {string} userId The alexa user identifier
     * @return {Promise<UserAlexa>}
     */
    async getUserAlexa(userId){
        if (!userId) throw new Error('userId is required');
        var usr = await this.UsersAlexaHelper.getOrCreateById(userId, this.actioner);
        if (!usr) return null;
        //get associated babies
        var babyIds = usr.getBabyIds();
        if (babyIds && Array.isArray(babyIds) && babyIds.length > 0){
            usr.Babies = await this.BabiesHelper.getByIds(babyIds);
        }
        return usr;
    };

    /**
     * Adds a new baby to the given user
     * If the user already has a baby by that name, no changes is performed
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby
     * @return {Promise<UserAlexa>}
     */
    async addBabyToUserAlexa(user, babyName){
        if (!user) throw new Error('user is required');
        if (!babyName) throw new Error('babyName is required');
        if (typeof(user) != 'object') throw new Error('user must be an object');
        if (user.hasBabyByName(babyName)) return user;
        /*var names = user.getBabyNames();
        if (names && names.indexOf(babyName) > -1) return user;
        console.log('addBaby - not found, adding new');*/
        //create new baby
        var babyId = await this.BabiesHelper.createByName(babyName, this.actioner);
        if (!babyId) throw new Error('Failed to create new baby');
        //associate user with the new baby
        user.addBabyId(babyId);
        await this.UsersAlexaHelper.save(user, this.actioner);
        //get full baby instance from db
        var baby = await this.BabiesHelper.getById(babyId);
        if (!baby || !baby.BabyId) throw new Error('Failed to retrieve baby by id ' + babyId);
        //add baby in the local user instance also
        user.addBabyInstance(baby);
        return user;
    };

    /**
     * Adds a new measurement on the user's baby for feeding
     * If the baby by the given name does not exist, it is created
     * If the the baby does not have an entry for pee, it is created
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to add the new measurement
     * @param {string} notes Notes to accompany the measurement
     * @return {Promise<boolean>}
     */
    async addBabyFeedingToUserAlexa(user, babyName, notes){
        return this.addBabyMeasurementToUserAlexa(
            user, 
            babyName,
            this.BabiesHelper.cItemTypeFeeding,
            null,
            null,
            notes
        );
    };

    /**
     * Adds a new measurement on the user's baby for pee
     * If the baby by the given name does not exist, it is created
     * If the the baby does not have an entry for pee, it is created
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to add the new measurement
     * @param {string} notes Notes to accompany the measurement
     * @return {Promise<boolean>}
     */
    async addBabyPeeToUserAlexa(user, babyName, notes){
        return this.addBabyMeasurementToUserAlexa(
            user, 
            babyName,
            this.BabiesHelper.cItemTypePee,
            null,
            null,
            notes
        );
    };

    /**
     * Adds a new measurement on the user's baby for poo
     * If the ababy by the given name does not exist, it is created
     * If the the baby does not have an entry for poo, it is created
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to add the new measurement
     * @param {string} notes Notes to accompany the measurement
     * @return {Promise<boolean>}
     */
    async addBabyPooToUserAlexa(user, babyName, notes){
        return this.addBabyMeasurementToUserAlexa(
            user, 
            babyName,
            this.BabiesHelper.cItemTypePoo,
            null,
            null,
            notes
        );
    }

    /**
     * Adds a new measurement on the user's baby for the given item type
     * If the ababy by the given name does not exist, it is created
     * If the the baby does not have an entry for the given item type, it is created
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to add the new measurement
     * @param {string} itemType The type of the new item to add in the baby
     * @param {number} when The timestamp of the measurement (epoch). Leave null to set it to current epoch
     * @param {number} value The value of the measurement. Null for for simple timed items
     * @param {string} notes Notes to accompany the measurement
     * @return {Promise<boolean>}
     */
    async addBabyMeasurementToUserAlexa(user, babyName, itemType, when, value, notes){
        if (!user) throw new Error('user is required');
        if (!babyName) throw new Error('babyName is required');
        if (!itemType) throw new Error('itemType is required');
        if (typeof(user) != 'object') throw new Error('user must be an object');
        if (!this.BabiesHelper.isValidItemType(itemType)) throw new Error(itemType + ' is not a valid item type');

        //var names = user.getBabyNames();
        //console.log('baby names - before', names);
        //verify baby exists, or simply add it to the user
        var usr = await this.addBabyToUserAlexa(user, babyName);
        //var names = usr.getBabyNames();
        //console.log('baby names - after', names);
        var baby = usr.getBabyByName(babyName);
        if (!baby) console.log('baby is null');
        var timestamp = when ? when : (new Date).getTime();
        var bby = await this.addMeasurement(baby, itemType, timestamp, value, notes);
        return true;
    }

    /**
     * Adds a new measurement on the baby's given item type
     * @param {object} baby The baby in which to add the new item
     * @param {string} itemType The type of the new item to add in the baby
     * @param {number} when The timestamp of the measurement (epoch). Leave null to set it to current epoch
     * @param {number} value The value of the measurement. Null for for simple timed items
     * @param {string} notes Notes to accompany the measurement
     * @return {Promise<object>}
     */
    async addMeasurement(baby, itemType, when, value, notes){//, actioner){
        if (!baby) throw new Error('baby is required');
        if (!itemType) throw new Error('itemType is required');
        //get or create the item for the given type
        var item = await this.BabiesHelper.addItem(baby, itemType, this.actioner);
        //create a new measurement
        var entry = this.MeasurementsHelper.generate(item.ItemId);
        entry.When = when ? when : (new Date).getTime();
        entry.setValue(value);
        entry.setNotes(notes);
        //store new measurement
        await this.MeasurementsHelper.create(entry, this.actioner);
        //update last measurement, if it is later than the previous one
        if (!item.Last || !item.Last.When || item.Last.When < entry.When){
            item.Last.When = entry.When;
            item.Last.Value = entry.getValue();
            item.Last.Notes = entry.getNotes();
        }
        //store baby with item (maybe new) and latest measurement        
        await this.DynamoDbHelper.Babies.update(baby, this.actioner);
        return baby;
        //this.DynamoDbHelper.Measurements.
    };    

    /**
     * Gets the last feeding measurement for the user's baby
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to ge the last measurement
     * @return {object}
     */
    getBabyLastFeeding(user, babyName){
        return this.getBabyLastByItemType(
            user, 
            babyName,
            this.BabiesHelper.cItemTypeFeeding
        );
    };  

    /**
     * Gets the last pee measurement for the user's baby
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to ge the last measurement
     * @return {object}
     */
    getBabyLastPee(user, babyName){
        return this.getBabyLastByItemType(
            user, 
            babyName,
            this.BabiesHelper.cItemTypePee
        );
    };  

    /**
     * Gets the last poo measurement for the user's baby
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to ge the last measurement
     * @return {object}
     */
    getBabyLastPoo(user, babyName){
        return this.getBabyLastByItemType(
            user, 
            babyName,
            this.BabiesHelper.cItemTypePoo
        );
    };

    /**
     * Gets the last measurement for the user's baby and the given item type
     * If the baby by the given name does not exist, it is created
     * If the the baby does not have an entry for pee, it is created
     * @param {UserAlexa} user The alexa user
     * @param {string} babyName The name of the baby in which to add the new measurement
     * @param {string} itemType The type of the item in question
     * @return {object}
     */
    getBabyLastByItemType(user, babyName, itemType){
        if (!user) throw new Error('user is required');
        if (!babyName) throw new Error('babyName is required');
        if (!itemType) throw new Error('itemType is required');
        if (!this.BabiesHelper.isValidItemType(itemType)) throw new Error(`${itemType} is not a valid type`);
        //find user's baby
        var baby = user.getBabyByName(babyName);
        if (!baby) return null;
        //find baby's item
        var item = baby.getItemByType(itemType);
        if (!item || !item.Last) return null;
        //return last
        return item.Last;
    };
    
    
    /**
     * Retrieve measuments for a given item, in the given time frame
     * @param {string} itemId The item id
     * @param {number} from The starting timestamp (epoch) of the measurement
     * @param {number} to The ending timestamp (epoch) of the measurement
     * @return {Promise<object>}
     */
    async getItemMeasurementRange(itemId, from, to){
        if (!itemId) throw new Error('itemId is required');
        if (!from) throw new Error('from is required');
        if (!to) to = (new Date).getTime();

        return this.MeasurementsHelper.getRange(itemId, from, to);
    };
}

exports.Logic = Logic;