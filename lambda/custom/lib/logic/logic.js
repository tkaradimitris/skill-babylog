'use strict';


//var aws_sdk_1 = require("aws-sdk");
const DynamoDbHelper_1 = require('../dynamoDB.js');
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
        //get or create the item for the given type
        var item = baby.getItemByType(itemType);
        if (!item){
            item = this.BabiesHelper.generateItem(baby, itemType);
        }
        var item = await this.BabiesHelper.addItem(baby, itemType, actioner);
        //create a new measurement
        var entry = this.MeasurementsHelper.generate(item.ItemId);
        entry.When = when ? when : (new Date).getTime();
        entry.setValue(value);
        entry.setNotes(notes);
        //store new measurement
        await this.MeasurementsHelper.create(entry, actioner);
        //update last measurement, if it is later than the previous one
        if (!item.Last || item.Last.When < entry.When){
            item.Last.When = entry.When;
            item.Last.Value = entry.getValue();
            item.Last.Notes = entry.getNotes();
        }
        //store baby with item (maybe new) and latest measurement        
        await this.DynamoDbHelper.Babies.update(baby, actioner);
        return baby;
        //this.DynamoDbHelper.Measurements.
    }
}

exports.Logic = Logic;