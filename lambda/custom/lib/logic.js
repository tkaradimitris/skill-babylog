'use strict';

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
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
    this.addItem = function(label){
        var item = self.getItem(label);
        if (!item){
            item = Item.create(label);
            self.Items.push(item);
        }
        return item;
    };
};

UserAlexa.getById = async function(userId){
    var usr = await DynamoDbHelper.UsersAlexa.getById(userId);
    var isUnknown = !usr || Object.keys(usr).length === 0;
    
    if (isUnknown) return null;
    else{
        var user = new UserAlexa();
        __assign(user, usr);
        return user;
    }
};

var Item = function(){
    var self = this;
    const MY_NAMESPACE = 'EF1976BA-FDDA-433D-832E-45419F1442E0';

    this.ItemId = null;
    this.Label = null;
    this.Created = null;
    this.Last = null; //Measurement
};

Item.create = function(label){
    var item = new Item();
    item.ItemId = uuidv5('ItemId', MY_NAMESPACE);
    item.Label = label || 'Baby';
    item.Created = (new Date()).getTime();
    return item;
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