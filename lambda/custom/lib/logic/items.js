'use strict';

var {LogicBase} = require("./logicBase.js");

class Item extends LogicBase{
    constructor(){
        super();
        this.ItemId = null;
        this.Type = null;
        this.Last = {
            When: null,
            Value: null,
            Notes: null
        };
    }
}

exports.Item = Item;