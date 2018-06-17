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

    setValue(value){
        this.attributes.Value = value;
    };

    getValue(){
        return this.attributes.Value;
    };

    setNotes(notes){
        this.attributes.Notes = notes;
    };

    getNotes(){
        return this.attributes.Notes;
    };
}

exports.Measurement = Measurement;