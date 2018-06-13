'use strict';

var {LogicBase} = require("./logicBase.js");

class UserAlexa extends LogicBase{
    constructor(){
        super();
        this.UserId = null;
        this.attributes = {
            Version: 1
        }
    }
}

exports.UserAlexa = UserAlexa;