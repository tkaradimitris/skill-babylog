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

    getLast(){
        if (!this.Last || !this.Last.When) return null;
        return this.Last.When;
    }

    getValue(){
        if (!this.Last || !this.Last.Value) return null;
        return this.Last.Value;
    }

    getNotes(){
        if (!this.Last || !this.Last.Notes) return null;
        return this.Last.Notes;
    }
}

exports.Item = Item;