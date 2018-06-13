'use strict';

var {LogicHelperBase} = require("./logicHelperBase.js");
var {UserAlexa} = require("./usersAlexa.js");

class UsersAlexaHelper extends LogicHelperBase{
    constructor(dynamoDbHelper){
        super(dynamoDbHelper);
    }
    get2(){
        return 2;
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
            __assign(item, dbItem);
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
        var usr = await UserAlexa.getById(userId);
        //var isValid = UserAlexa.isValid(usr);
        if (!usr){
            await UsersAlexaHelper.create(userId, actioner);
            usr = await UsersAlexaHelper.getById(userId);
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

}

exports.UsersAlexaHelper = UsersAlexaHelper;