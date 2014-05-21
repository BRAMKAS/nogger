var config = require("../config.json");
var redis = require("redis");
var db = redis.createClient(config.redisPort, config.redisIP, {
    auth_pass: config.redisPass
});
db.select(config.redisDb);

exports.getMetrics = function (callback) {
    db.keys("*", function (err, data) {
        if (err) {
            callback(err);
        } else {
            var re = {};
            var expect = data.length;
            var finished = 0;
            data.forEach(function (val) {
                var type = val.substr(0, val.indexOf("#"));
                var name = val.substr(val.indexOf("#") + 1);
                var add = function(err, data){
                    if (!err) {
                        re[type] = re[type] || {};
                        re[type][name] = data;
                    }
                    finished++;
                    if (finished === expect) {
                        callback(null, re);
                    }
                };
                if (type === "gauge") {
                    db.hgetall(val, add);
                } else {
                    db.lrange(val, 0, 100, add);
                }
            });
        }
    });
};

exports.getList = function(file, offset, callback){
    if(offset === null){
        db.lrange(file, 0, -1, callback);
    } else {
        db.lrange(file, offset, 100, callback);
    }
};
