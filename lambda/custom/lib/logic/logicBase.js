'use strict';

class LogicBase{
    constructor(){
    }

    getAttributes(){
        if (this.attributes) return this.attributes;
        else return null;
    }

    getInfo(){
        var attributes = this.getAttributes();
        if (attributes && attributes.Info) return attributes.Info;
        else return null;
    }

    hasChanges(){
        var info = this.getInfo();
        if (info && info.Changes) return info.Changes > 0;
        else return false;
    }
}

exports.LogicBase = LogicBase;