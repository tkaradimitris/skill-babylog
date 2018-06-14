'use strict';

var {LogicBase} = require("./logicBase.js");

class Baby extends LogicBase{
    constructor(){
        super();
        this.BabyId = null;
        this.attributes = {
            Version: 1,
            Items: []
        }
    }
}

exports.Baby = Baby;