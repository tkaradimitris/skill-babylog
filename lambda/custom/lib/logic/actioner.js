'use strict';

class Actioner{
    constructor(type, appId, userId, deviceId){
        if (type) this.Type = type;
        if (appId) this.AppId = appId;
        if (userId) this.UserId = userId;
        if (deviceId) this.DeviceId = deviceId;
    }
}

exports.Actioner = Actioner;