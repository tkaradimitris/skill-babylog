'use strict';

var {LogicBase} = require("./logicBase.js");

class Baby extends LogicBase{
    constructor(){
        super();
        this.BabyId = null;
        this.attributes = {
            Version: 1,
            Name: null,
            Gender: null,
            Birthdate: null,
            PrematureByWeeks: null
        }
    }

    setName(name){
        this.attributes.Name = name;
    };

    getName(){
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
}

exports.Baby = Baby;