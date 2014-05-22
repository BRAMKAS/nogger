var config = require("../config.json");
var redis = require("redis"),
    subscriber = redis.createClient(config.redisPort, config.redisIP);
    publisher = redis.createClient(config.redisPort, config.redisIP);

subscriber.subscribe("pong");

var startTime;
var callback;

subscriber.on("message", function (channel, message) {
    console.log('Message ', channel, message);
    if(channel === 'pong' && callback && startTime){
        var t = Date.now() -  startTime;
        startTime = null;
        callback(t, message);
    }
});

module.exports = function (cb){
    callback = cb;
    startTime = Date.now();
    publisher.publish('ping', 'nogger')
};