var config = require("./config");
var redis = require("redis");
var db = redis.createClient(config.redisPort, config.redisIP, {
    auth_pass: config.redisPass
});
db.select(config.redisLogsDb);

exports.getLogNames = function (callback) {
    db.keys("*", callback);
};

exports.getLogs = function(file, offset, callback){
    if(offset === null){
        db.lrange(file, 0, -1, callback);
    } else {
        db.lrange(file, offset, 100, callback);
    }
};