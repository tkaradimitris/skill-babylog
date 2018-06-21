'use strict';

var {LogicHelperBase} = require("./logicHelperBase.js");
var {UserAlexa} = require("./usersAlexa.js");

class UsersAlexaHelper extends LogicHelperBase{
    constructor(dynamoDbHelper){
        super(dynamoDbHelper);
    }
    
    /**
     * Retrieve an Alexa User using its id
     * @param {string} userId The user id as given as input to alexa intend
     * @return {Promise<object>}
     */
    async getById(userId){
        if (!userId) throw new Error('userId is required');
        var dbItem = await this.DynamoDbHelper.UsersAlexa.getById(userId);
        if (!dbItem) return null;
        else{
            var item = new UserAlexa();
            this.__assign(item, dbItem);
            return item;
        }
    };

    /**
     * Retrieve an Alexa User using its id. Create one if its does not exist in db.
     * @param {string} userId The user id as given as input to alexa intend
     * @param {string} skillId The skill id used by the user
     * @return {Promise<UserAlexa>}
     */
    async getOrCreateById(userId, actioner){
        if (!userId) throw new Error('userId is required');
        var usr = await this.getById(userId);
        if (!usr){
            await this.create(userId, actioner);
            usr = await this.getById(userId);
        }
        
        if (!usr) return null;
        else return usr;
    };

    /**
     * Creates and stores and new UserAlexa
     * @param {string} userId The user id as given as input to alexa intend
     * @param {string} skill The skill identifier creating the user
     * @return {Promise<object>}
     */
    async create(userId, actioner){
        if (!userId) throw new Error('userId is required');
        var user = new UserAlexa();
        user.UserId = userId;
        //user.Info = {CreatedBySkill:skill};
        await this.DynamoDbHelper.UsersAlexa.put(user, actioner);
    }

    /**
     * Saves an alexa user in the db
     * @param {UserAlexa} user The user in reference
     * @param {Actioner} actioner The details about the user/app performing the action
     * @return {void}
     */
    async save(user, actioner){
        if (!user) throw new Error('user is required');
        await this.DynamoDbHelper.UsersAlexa.update(user, actioner);        
    }

    async scan(limit){
        return await this.DynamoDbHelper.UsersAlexa.scan(limit);
    }

}

exports.UsersAlexaHelper = UsersAlexaHelper;