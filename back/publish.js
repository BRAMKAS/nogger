var config = require("./config");
var redis = require("redis"),
    subscriber = redis.createClient(config.redisPort, config.redisIP);
    publisher = redis.createClient(config.redisPort, config.redisIP);
var connected = false;

subscriber.subscribe("pong" + config.redisMetricsDb);
subscriber.subscribe("log" + config.redisLogsDb);
subscriber.subscribe("metric" + config.redisMetricsDb);
subscriber.subscribe("restart" + config.redisLogsDb);

var pingStartTime;
var pingCallback;
var logCallback;
var metricCallback;

subscriber.on("message", function (channel, message) {
    console.log('got message', channel, message);
    if(channel === 'pong' + config.redisMetricsDb && pingCallback && pingStartTime){
        var t = Date.now() -  pingStartTime;
        pingStartTime = null;
        pingCallback(t, message);
    }

    if(channel === 'log' + config.redisLogsDb && logCallback){
        logCallback(JSON.parse(message));
    }

    if(channel === 'metric' + config.redisMetricsDb && metricCallback){
        metricCallback(JSON.parse(message));
    }

    if(channel === 'restart' + config.redisLogsDb){
        publisher.publish('clientChannel' + config.redisMetricsDb, connected ? 'connected' : 'disconnected')
    }
});

exports.ping = function (cb){
    pingCallback = cb;
    pingStartTime = Date.now();
    publisher.publish('ping' + config.redisMetricsDb, 'nogger')
};

exports.connected = function(){
    connected = true;
    publisher.publish('clientChannel' + config.redisMetricsDb, 'connected')
};

exports.disconnected = function(){
    connected = false;
    publisher.publish('clientChannel' + config.redisMetricsDb, 'disconnected')
};

exports.onLog = function(callback){
    logCallback = callback;
};

exports.onMetric = function(callback){
    metricCallback = callback;
};