'use strict';

//_assign copies over async function and ruins UserAlexa
//also, same prob when storing UserAlexa, since it stores also async funcs as {}!!!
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) 
            if (Object.prototype.hasOwnProperty.call(s, p) && typeof(s[p])!='function'){
                //do not copy over target functions
                if (!Object.prototype.hasOwnProperty.call(t, p) || typeof(t[p])!='function'){
                    //console.log('copy ' + p);
                    t[p] = s[p];
                }
            }
    }
    return t;
};


const uuidv1 = require('uuid/v1');
var _ = require('lodash');

var aws_sdk_1 = require("aws-sdk");

const DynamoDbHelper_1 = require('../lib/dynamoDB.js');
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient, prefix: "BabyLog"});//, tableName: "", createTable: false

var UserAlexa = function(){
    this.UserId = null;
};

/**
 * Checks if the given user is an actual UserAlexa instance
 * @param {object} user The instance to examine
 * @return {boolean}
 */
UserAlexa.isValid = function(user){
    var isUnknown = !user || Object.keys(user).length === 0;
    if (isUnknown) return false;
    
    if(!user.UserId) return false;
    return true;
};

/**
 * Retrieve an Alexa User using its id
 * @param {string} userId The user id as given as input to alexa intend
 * @return {Promise<object>}
 */
UserAlexa.getById = async function(userId){
    if (!userId) throw new Error('userId is required');
    var usr = await DynamoDbHelper.UsersAlexa.getById(userId);
    //var isValid = UserAlexa.isValid(usr);
    
    if (!usr) return null;
    else{
        var user = new UserAlexa();
        __assign(user, usr);
        return user;
    }
};

/**
 * Retrieve an Alexa User using its id. Create one if its does not exist in db.
 * @param {string} userId The user id as given as input to alexa intend
 * @param {string} skillId The skill id used by the user
 * @return {Promise<UserAlexa>}
 */
UserAlexa.getOrCreateById = async function(userId, actioner){
    if (!userId) throw new Error('userId is required');
    var usr = await UserAlexa.getById(userId);
    //var isValid = UserAlexa.isValid(usr);
    if (!usr){
        await UserAlexa.create(userId, actioner);
        usr = await UserAlexa.getById(userId);
        //isValid = UserAlexa.isValid(usr);
    }
    
    if (!usr) return null;
    else return usr;
};

/**
 * Creates and stores and new UserAlexa
 * @param {string} userId The user id as given as input to alexa intend
 * @param {string} skill The skill identifier creating the user
 * @return {Promise<object>}
 */
UserAlexa.create = async function(userId, actioner){
    if (!userId) throw new Error('userId is required');
    var user = new UserAlexa();
    user.UserId = userId;
    //user.Info = {CreatedBySkill:skill};
    await DynamoDbHelper.UsersAlexa.put(user, actioner);
}

UserAlexa.scan = async function(){
    var response = await DynamoDbHelper.UsersAlexa.scan();
    return response;
};

/**
 * Check if a user has a baby by the given name
 * @param {UserAlexa} user The user to examine
 * @param {string} babyName The name of the baby to check for
 * @return {boolean}
 */
UserAlexa.hasBaby = function(user, babyName){
    var item = UserAlexa.getBaby(user, babyName);
    return (item ? true : false);
}

/**
 * Get the user's item which matches the given label, or add it if it is new
 * @param {UserAlexa} user The user to examine
 * @param {string} itemLabel The label of the item to get
 * @return {Item}
 */
UserAlexa.getOrAddItem = async function(user, itemLabel){
    var item = UserAlexa.getItem(user, itemLabel);
    if (!item){
        item = await UserAlexa.addItem(user, itemLabel);
    }
    return item;
}

/**
 * Add a new baby to the user's list of babies
 * @param {UserAlexa} user The user in reference
 * @param {string} babyName The name of the baby to add
 * @return {Promise<Baby>}
 */
UserAlexa.addBaby = async function(user, babyName){
    if (!user) throw new Error('user is required');
    if (!babyName) throw new Error('babyName is required');
    //verify item not part of user's items
    var baby = UserAlexa.getBaby(user, babyName);
    //create new item
    if (!baby){
        var itemId = await Item.create(babyName);
        console.log('itemId='+itemId);
        baby = await Item.getById(itemId);
        if (Item.isValid(baby)){
            user.attributes.Items.push(baby);
            await UserAlexa.saveItems(user);
        }
        else{
            baby = null;
        }
    }
    return baby;
};


/**
 * Store the user 
 * @param {UserAlexa} user The user in reference
 * @return {void}
 */
UserAlexa.save = async function(user){
    if (!user) throw new Error('user is required');
    await DynamoDbHelper.UsersAlexa.update(user);        
};


/**
 * Get the user's baby which matches the given label
 * @param {UserAlexa} user The user to examine
 * @param {string} babyName The name of the baby to get
 * @return {Item}
 */
UserAlexa.getItem = function(user, babyName){
    if (!user) throw new Error('user is required');
    if (!babyName) throw new Error('babyName is required');
    if (!user.attributes.Babies) user.attributes.Babies = [];
    var baby = _.find(user.attributes.Babies, {Name:babyName});
    return baby ? baby : null;
}

/**
 * Check if a user has a skill by the given label
 * @param {UserAlexa} user The user to examine
 * @param {string} itemLabel The label of the item to check for
 * @return {boolean}
 */
UserAlexa.hasItem = function(user, itemLabel){
    var item = UserAlexa.getItem(user, itemLabel);
    return (item ? true : false);
}

/**
 * Get the user's item which matches the given label
 * @param {UserAlexa} user The user to examine
 * @param {string} itemLabel The label of the item to get
 * @return {Item}
 */
UserAlexa.getItem = function(user, itemLabel){
    if (!user) throw new Error('user is required');
    if (!itemLabel) throw new Error('itemLabel is required');
    if (!user.attributes.Items) user.attributes.Items = [];
    var item = _.find(user.attributes.Items, {Label:itemLabel});
    var isValid = Item.isValid(item);
    return isValid ? item : null;
}

/**
 * Get the user's item which matches the given label, or add it if it is new
 * @param {UserAlexa} user The user to examine
 * @param {string} itemLabel The label of the item to get
 * @return {Item}
 */
UserAlexa.getOrAddItem = async function(user, itemLabel){
    var item = UserAlexa.getItem(user, itemLabel);
    if (!item){
        item = await UserAlexa.addItem(user, itemLabel);
    }
    return item;
}

/**
 * Add a new item to the user's items
 * @param {UserAlexa} user The user in reference
 * @param {string} itemLabel The label of the item to add
 * @return {Promise<Item>}
 */
UserAlexa.addItem = async function(user, itemLabel){
    if (!user) throw new Error('user is required');
    if (!itemLabel) throw new Error('itemLabel is required');
    //verify item not part of user's items
    var item = UserAlexa.getItem(user, itemLabel);
    //create new item
    if (!item){
        var itemId = await Item.create(itemLabel);
        console.log('itemId='+itemId);
        item = await Item.getById(itemId);
        if (Item.isValid(item)){
            user.attributes.Items.push(item);
            await UserAlexa.saveItems(user);
        }
        else{
            item = null;
        }
    }
    return item;
};


/**
 * Store the user's items in db
 * @param {UserAlexa} user The user in reference
 * @return {void}
 */
UserAlexa.saveItems = async function(user){
    if (!user) throw new Error('user is required');
    if (!user.attributes.Items) user.attributes.Items = [];
    await DynamoDbHelper.UsersAlexa.update(user);        
};


var Baby = function(){
    var self = this;

    this.BabyId = null;
    this.attributes = {
        Name: null,
        Gender: null,
        Birthdate: null,
        PrematureByWeeks: null
    };

    this.setName = function(name){
        self.attributes.Name = name;
    };

    this.getName = function(){
        return self.attributes.Name;
    };

    this.setBirthdate = function(epoch){
        self.attributes.Birthdate = epoch;
    };

    this.getBirthdate = function(){
        return self.attributes.Birthdate;
    };
};

Baby.generateId = function(){
    return "baby-" + uuidv1();
};

/**
 * Checks if the given baby is an actual Baby instance
 * @param {object} item The instance to examine
 * @return {boolean}
 */
Baby.isValid = function(item){
    var isUnknown = !item || Object.keys(item).length === 0;
    if (isUnknown) return false;
    
    if(!item.BabyId || !item.attributes) return false;
    return true;
};

/**
 * Retrieve a Baby using its id
 * @param {string} babyId The id assigned to the baby
 * @return {Promise<Baby>} The baby or null if unknown
 */
Baby.getById = async function(babyId){
    var dbItem = await DynamoDbHelper.Babies.getById(babyId);
    var isValid = Baby.isValid(dbItem);
    if (!isValid) return null;
    else{
        var item = new Baby();
        __assign(item, dbItem);
        return item;
    }
};

/**
 * Creates and stores and new Baby
 * @param {Baby} baby The baby instance
 * @return {Promise<string>} The item uuid
 */
Baby.create = async function(baby, actioner){
    if (!baby) throw new Error('baby is required');
    if (!baby.BabyId) baby.BabyId = Baby.generateId();
    await DynamoDbHelper.Babies.put(baby, actioner);
    return baby.BabyId;
};

/**
 * Creates and stores and new Baby using the given name
 * @param {string} name The name of the baby
 * @return {Promise<string>} The item uuid
 */
Baby.createByName = async function(name, actioner){
    if (!name) throw new Error('name is required');
    var baby = new Baby();
    baby.BabyId = Baby.generateId();
    baby.setName(name);
    await DynamoDbHelper.Babies.put(baby, actioner);
    return baby.BabyId;
};

/**
 * Saves a baby in the db
 * @param {Baby} baby The baby in reference
 * @param {Actioner} actioner The details about the user/app performing the action
 * @return {void}
 */
Baby.save = async function(baby, actioner){
    if (!baby) throw new Error('baby is required');
    await DynamoDbHelper.Babies.update(baby, actioner);        
};

Baby.scan = async function(){
    var response = await DynamoDbHelper.Babies.scan();
    return response;
};


var Item = function(){
    var self = this;

    this.ItemId = null;
    this.Label = null;
    this.Last = null; //Measurement
};

/**
 * Checks if the given item is an actual Item instance
 * @param {object} item The instance to examine
 * @return {boolean}
 */
Item.isValid = function(item){
    var isUnknown = !item || Object.keys(item).length === 0;
    if (isUnknown) return false;
    
    if(!item.ItemId || !item.Label) return false;
    return true;
};

/**
 * Retrieve an Item using its id
 * @param {string} userIitemIdd The item id assign to the item
 * @return {Promise<object>} The item or null if unknown
 */
Item.getById = async function(itemId){
    var dbItem = await DynamoDbHelper.Items.getById(itemId);
    var isValid = Item.isValid(dbItem);
    
    if (!isValid) return null;
    else{
        var item = new Item();
        __assign(item, dbItem);
        return item;
    }
};

/**
 * Creates and stores and new Item
 * @param {string} label The label of the item
 * @return {Promise<string>} The item uuid
 */
Item.create = async function(label){
    if (!label) throw new Error('label is required');
    var item = new Item();
    item.BabyId = "item-" + uuidv1(); //5('ItemId', Item.MY_NAMESPACE);
    item.Label = label;
    await DynamoDbHelper.Items.put(item);
    return item.BabyId;
};

Item.scan = async function(){
    var response = await DynamoDbHelper.Items.scan();
    return response;
};

var Measurement = function(){
    this.ItemId = null;
    this.When = null;
    this.Value = null;
    this.App = null;
    this.AppType = null; //Skill, Web, Android, IOS
};

Measurement.MY_NAMESPACE = 'f6deeafc-5e24-5b10-a7bd-f64fcf3238c4';

/**
 * Checks if the given measurement is an actual Item instance
 * @param {object} item The instance to examine
 * @return {boolean}
 */
Measurement.isValid = function(item){
    var isUnknown = !item || Object.keys(item).length === 0;
    if (isUnknown) return false;
    
    if(!item.ItemId || !item.Label || !item.When) return false;
    return true;
};

/**
 * Retrieve a Measurement using its id
 * @param {string} measurementId The id assigned to the measurement
 * @return {Promise<Measurement>} The measurement or null if unknown
 */
Measurement.getByItemIdWhen = async function(itemId, when){
    var dbItem = await DynamoDbHelper.Measurements.getByItemIdWhen(itemId, when);
    var isValid = Measurement.isValid(dbItem);
    
    if (!isValid) return null;
    else{
        var item = new Measurement();
        __assign(item, dbItem);
        return item;
    }
};

/**
 * Creates and stores and new Measurement
 * @param {string} label The label of the Measurement
 * @return {Promise<string>} The Measurement uuid
 */
Measurement.create = async function(itemId, appType, app, when, value){
    if (!itemId) throw new Error('itemId is required');
    if (!appType) throw new Error('appType is required');
    if (!appType) throw new Error('app is required');
    var item = new Measurement();
    item.ItemId = itemId;
    item.AppType = appType;
    item.App = app;
    item.When = when ? when : (new Date()).getTime();
    item.Value = value ? value : null;
    await DynamoDbHelper.Measurements.put(item);
    return item.When;
};

exports.Logic = {
    Actioner: DynamoDbHelper.Actioner,
    UserAlexa: UserAlexa,
    Baby: Baby,
    Item: Item,
    Measurement: Measurement
};