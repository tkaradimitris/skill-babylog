'use strict';

//_assign copies over async function and ruins UserAlexa
//also, same prob when storing UserAlexa, since it stores also async funcs as {}!!!
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) 
            if (Object.prototype.hasOwnProperty.call(s, p) && typeof(s[p])!='function'){
                //do not copy over target functions
                if (!Object.prototype.hasOwnProperty.call(t, p) || typeof(t[p])!='function'){
                    //console.log('copy ' + p);
                    t[p] = s[p];
                }
            }
    }
    return t;
};

exports.__assign = __assign;