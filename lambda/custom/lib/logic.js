'use strict';

//_assign copies over async function and ruins UserAlexa
//also, same prob when storing UserAlexa, since it stores also async funcs as {}!!!
var __assign = (this && this.__assign) /*|| Object.assign*/ || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) 
            if (Object.prototype.hasOwnProperty.call(s, p)){
                //do not copy over target functions
                if (!Object.prototype.hasOwnProperty.call(t, p) || typeof(t[p])!='function'){
                    console.log('copy ' + p);
                    t[p] = s[p];
                }
            }
    }
    return t;
};

const uuidv5 = require('uuid/v5');
var _ = require('lodash');
var aws_sdk_1 = require("aws-sdk");
const DynamoDbHelper_1 = require('../lib/dynamoDB.js');
var dynamoDbClient = new aws_sdk_1.DynamoDB({  endpoint: new aws_sdk_1.Endpoint('http://localhost:8000'), region: 'us-west1'});
var DynamoDbHelper = new DynamoDbHelper_1.DynamoDbHelper({dynamoDBClient: dynamoDbClient});//, tableName: "", createTable: false

var UserAlexa = function(){
    var self = this;
    const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

    this.UserId = null;
    this.Info = null;
    //this.Created = null;
    //this.CreatedBySkill = null;
    this.Items = [];

    this.hasItem = function(label){
        if (!self.Items) self.Items = [];
        var item = _.find(self.Items, {Label:label});
        return item;
    };
    this.getItem = function(label){
        if (!self.Items) self.Items = [];
        var item = _.find(self.Items, {Label:label});
        return item ? item : null;
    }
    this.getOrAddItem = async function(label){
        var item = self.getItem(label);
        if (!item){
            item = await self.addItem(label);
        }
        return item;
    };
    this.addItem = async function(label){
        var item = self.getItem(label);
        if (!item){
            var itemId = await Item.create(label);
            item = await Item.getById(itemId);
            if (Item.isValid(item)){
                self.Items.push(item);
                await self.saveItems();
            }
            else{
                item = null;
            }
        }
        return item;
    };
    this.saveItems = async function(){
        await DynamoDbHelper.UsersAlexa.updateItems(self);        
    };
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
    var usr = await DynamoDbHelper.UsersAlexa.getById(userId);
    var isUnknown = !usr || Object.keys(usr).length === 0;
    
    if (isUnknown) return null;
    else{
        var user = new UserAlexa();
        //console.log(user);
        //console.log(usr);
        __assign(user, usr);
        return user;
    }
};

/**
 * Creates and stores and new UserAlexa
 * @param {string} userId The user id as given as input to alexa intend
 * @param {string} skill The skill identifier creating the user
 * @return {Promise<object>}
 */
UserAlexa.create = async function(userId, skill){
    var user = new UserAlexa();
    user.UserId = userId;
    user.Info = {CreatedBySkill:skill};
    await DynamoDbHelper.UsersAlexa.put(user);
}

var Item = function(){
    var self = this;
    //const MY_NAMESPACE = 'EF1976BA-FDDA-433D-832E-45419F1442E0';

    this.ItemId = null;
    this.Label = null;
    this.Created = null;
    this.Last = null; //Measurement
};

Item.MY_NAMESPACE = 'EF1976BA-FDDA-433D-832E-45419F1442E0';

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
    var isUnknown = !dbItem || Object.keys(dbItem).length === 0;
    
    if (isUnknown) return null;
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
    item.ItemId = uuidv5('ItemId', Item.MY_NAMESPACE);
    item.Label = label;
    await DynamoDbHelper.Items.put(item);
    return item.ItemId;
}

var Measurement = function(){
    this.ItemId = null;
    this.When = null;
    this.Value = null;
    this.Created = null;
    this.CreatedBy = null;
    this.App = null;
    this.AppType = null; //Skill, Web, Android, IOS
};


exports.Logic = {
    UserAlexa: UserAlexa,
    Item: Item,
    Measurement: Measurement
};