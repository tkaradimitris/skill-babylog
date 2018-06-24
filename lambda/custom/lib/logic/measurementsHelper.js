'use strict';

const uuidv1 = require('uuid/v1');

var {LogicHelperBase} = require("./logicHelperBase.js");
var {Measurement} = require("./measurements.js");

class MeasurementsHelper extends LogicHelperBase{
    constructor(dynamoDbHelper){
        super(dynamoDbHelper);
    }

    /**
     * Generates a new measurement instance for the given item id
     * @return {object}
     */
    generate(itemId){
        var item = new Measurement();
        item.ItemId = itemId;
        return item;
    };
    
    /**
     * Retrieve a Measurement using the itemId and its timestamp (epoch)
     * @param {string} itemId The item id
     * @param {number} when The timestamp (epoch) of the measurement
     * @return {Promise<object>}
     */
    async get(itemId, when){
        if (!itemId) throw new Error('itemId is required');
        if (!when) throw new Error('when is required');
        var dbItem = await this.DynamoDbHelper.Measurements.get(itemId, when);
        if (!dbItem) return null;
        else{
            var item = new Measurement();
            this.__assign(item, dbItem);
            return item;
        }
    };
    
    /**
     * Retrieve a measuments for a given item, in the given time frame
     * @param {string} itemId The item id
     * @param {number} from The starting timestamp (epoch) of the measurement
     * @param {number} to The ending timestamp (epoch) of the measurement
     * @return {Promise<object>}
     */
    async getRange(itemId, from, to){
        if (!itemId) throw new Error('itemId is required');
        if (!from) throw new Error('from is required');
        if (!to) to = (new Date).getTime();
        var dbItems = await this.DynamoDbHelper.Measurements.getRange(itemId, from, to);
        if (!dbItems) return null;
        else{
            var items = [];
            for(var i=0;i<dbItems.length;i++){
                var item = new Measurement();
                this.__assign(item, dbItems[i]);
                items.push(item);
            }
            return items;
        }
    };

    /**
     * Creates and stores and new Measurement
     * @param {object} measurement The Measurement instance
     * @param {string} actioner Details about the user and the app creatign the record
     * @return {Promise<void>}
     */
    async create(measurement, actioner){
        if (!measurement) throw new Error('measurement is required');
        if (!measurement.ItemId) throw new Error('measurement.ItemId is required');
        if (!measurement.When) throw new Error('measurement.When is required');
        await this.DynamoDbHelper.Measurements.put(measurement, actioner);
    }

    /**
     * Saves an existing measurement in the db, in its current state
     * @param {object} measurement The measurement in reference
     * @param {Actioner} actioner The details about the user/app performing the action
     * @return {void}
     */
    async save(measurement, actioner){
        if (!measurement) throw new Error('measurement is required');
        if (!measurement.ItemId) throw new Error('measurement.ItemId is required');
        if (!measurement.When) throw new Error('measurement.When is required');
        await this.DynamoDbHelper.Measurements.update(measurement, actioner);        
    }

    /**
     * Deletes an existing measurement from the db
     * @param {object} measurement The measurement to delete
     * @return {void}
     */
    async delete(measurement){
        if (!measurement) throw new Error('measurement is required');

        var id = null;
        var when = null;
        if (typeof measurement == "object"){
            await this.DynamoDbHelper.Measurements.delete(measurement);
        }
        else{
            var id = measurement;
            if (!arguments[1]) throw new Error('arguments[1] must be set to When when the 1st argument is the ItemId');
            var when = arguments[1];
            await this.DynamoDbHelper.Measurements.delete(id, when);
        };        
    }

    async scan(limit){
        return await this.DynamoDbHelper.Measurements.scan(limit);
    }

}

exports.MeasurementsHelper = MeasurementsHelper;