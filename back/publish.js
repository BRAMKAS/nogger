var config = require("../config.json");
var redis = require("redis"),
    subscriber = redis.createClient(config.redisPort, config.redisIP);
    publisher = redis.createClient(config.redisPort, config.redisIP);

subscriber.subscribe("pong");
subscriber.subscribe("log");
subscriber.subscribe("metric");

var pingStartTime;
var pingCallback;
var logCallback;
var metricCallback;

subscriber.on("message", function (channel, message) {

    if(channel === 'pong' && pingCallback && pingStartTime){
        var t = Date.now() -  pingStartTime;
        pingStartTime = null;
        pingCallback(t, message);
    }

    if(channel === 'log' && logCallback){
        logCallback(JSON.parse(message));
    }

    if(channel === 'metric' && metricCallback){
        metricCallback(JSON.parse(message));
    }
});

exports.ping = function (cb){
    pingCallback = cb;
    pingStartTime = Date.now();
    publisher.publish('ping', 'nogger')
};

exports.connected = function(){
    publisher.publish('clientChannel', 'connected')
};

exports.disconnected = function(){
    publisher.publish('clientChannel', 'disconnected')
};

exports.onLog = function(callback){
    logCallback = callback;
};

exports.onMetric = function(callback){
    metricCallback = callback;
};