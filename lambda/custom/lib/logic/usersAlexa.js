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

    getBabyByName(babyName){
        if (!this.Babies || !Array.isArray(this.Babies) || this.Babies.length === 0) return null;
        var items = _.map(this.Babies, function(o) {
            var name = o.getName();
            if (name && name === babyName) return o;
        });
        if (items && items.length > 0)
            return items[0];
        else
            return null;
    };

    hasBabyByName(babyName){        
        var item = this.getBabyByName(babyName);
        var ok = (item && item.BabyId ? true : false);
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