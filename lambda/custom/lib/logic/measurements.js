'use strict';

var {LogicBase} = require("./logicBase.js");

class Measurement extends LogicBase{
    constructor(){
        super();
        this.ItemId = null;
        this.When = null;
        this.attributes = {
            Version: 1,
            Value: null,
            Notes: null
        }
    }
}

exports.Measurement = Measurement;