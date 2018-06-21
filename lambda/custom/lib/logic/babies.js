'use strict';

var _ = require('lodash');
var {LogicBase} = require("./logicBase.js");
var {Item} = require("./items.js");

class Baby extends LogicBase{
    constructor(){
        super();
        this.BabyId = null;
        this.attributes = {
            Version: 1,
            Name: null,
            Gender: null,
            Birthdate: null,
            PrematureByWeeks: null,
            Items: []
        }
    }

    setName(name){
        this.attributes.Name = name;
    };

    getName(){
        if (!this.attributes || !this.attributes.Name) return null;
        return this.attributes.Name;
    };

    setGender(gender){
        this.attributes.Gender = gender;
    };

    getGender(){
        return this.attributes.Gender;
    };

    setBirthdate(epoch){
        this.attributes.Birthdate = epoch;
    };

    getBirthdate(){
        return this.attributes.Birthdate;
    };

    setPrematureByWeeks(weeks){
        this.attributes.PrematureByWeeks = weeks;
    };

    getPrematureByWeeks(){
        return this.attributes.PrematureByWeeks;
    };

    setItems(items){
        this.attributes.Items = items;
    };

    getItems(){
        return this.attributes.Items;
    };

    getItemByType(itemType){
        var items = this.getItems();
        if (!items || items.length === 0) return null;
        var item = _.find(items, {Type:itemType});
        return item;
    };

    hasItem(itemType){
        var item = this.getItemByType(itemType);
        var ok = (item && item.ItemId ? true : false);
        return ok;
    };

    addItem(item){
        var items = this.getItems();
        if (!items) items = [];
        items.push(item);
        this.setItems(items);
    };
}

exports.Baby = Baby;