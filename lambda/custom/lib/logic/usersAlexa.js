'use strict';

var _ = require('lodash');
var {LogicBase} = require("./logicBase.js");

class UserAlexa extends LogicBase{
    constructor(){
        super();
        this.UserId = null;
        this.attributes = {
            Version: 1,
            BabyIds: []
        };
    }

    setBabyIds(ids){
        this.attributes.BabyIds = ids;
    };

    getBabyIds(){
        if (!this.attributes || !this.attributes.BabyIds)
            return [];
        return this.attributes.BabyIds;
    };

    getBabyNames(){
        //console.log('getBabyByName', babyName);
        if (!this.Babies || !Array.isArray(this.Babies) || this.Babies.length === 0)
        {
            //console.log('no babies', this.Babies);
            return [];
        }
        var items = _.map(this.Babies, function(o) {
            var name = o.getName();
            return name;
        });
        return items;
    };

    getBabyByName(babyName){
        //console.log('getBabyByName', babyName);
        if (!this.Babies || !Array.isArray(this.Babies) || this.Babies.length === 0)
        {
            //console.log('no babies', this.Babies);
            return null;
        }
        var items = _.filter(this.Babies, function(o) {
            var name = o.getName();
            return (name && name.toLowerCase() === babyName.toLowerCase());
        });
        if (items && items.length > 0){
            //console.log('found');
            //console.log(babyName, items[0], items);
            return items[0];
        }
        else{
            //console.log('not found');
            return null;
        }
    };

    hasBabyByName(babyName){        
        var item = this.getBabyByName(babyName);
        var ok = (item && item.BabyId ? true : false);
        /*if (!ok){
            var names = this.getBabyNames();
            if (!item) console.log('hasBabyByName', babyName, 'item is null', item, names);
            else console.log('hasBabyByName', babyName, 'item has not BabyId', item, names);
        }*/
        return ok;
    };

    addBabyId(babyId){
        var ids = this.getBabyIds();
        ids.push(babyId);
    };

    addBabyInstance(baby){
        if (!this.Babies) this.Babies = [];
        if (baby)
            this.Babies.push(baby);
    };
}

exports.UserAlexa = UserAlexa;