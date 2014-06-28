var config = require("../config.json");
var redis = require("redis");
var db = redis.createClient(config.redisPort, config.redisIP, {
    auth_pass: config.redisPass
});
db.select(config.redisMetricsDb);

var Timer = require('nogger-node-adapter').metrics.Timer;


exports.getMetrics = function (callback) {

    var authTimer = new Timer('getMetrics', 10000);
    authTimer.start();
    db.keys("*", function (err, data) {
        if (err) {
            authTimer.end();
            callback(err);
        } else {
            var re = {};
            var expect = data.length;
            var finished = 0;

            data.forEach(function (val) {
                var type, name;
                if (val.indexOf("#") > 0) {
                    type = val.substr(0, val.indexOf("#"));
                    name = val.substr(val.indexOf("#") + 1);
                } else {
                    type = val;
                }

                var add = function (err, data) {
                    if (!err) {
                        re[type] = re[type] || {};
                        if(name){
                            re[type][name] = data;
                        } else {
                            re[type] = data;
                        }
                    }
                    finished++;
                    if (finished === expect) {
                        authTimer.end();
                        callback(null, re);
                    }
                };
                if (type === "static" || type === "gauge") {
                    db.hgetall(val, add);
                } else {
                    db.lrange(val, 0, 100, add);
                }
            });
        }
    });
};

exports.getList = function (file, offset, callback) {
    if (offset === null) {
        db.lrange(file, 0, -1, callback);
    } else {
        db.lrange(file, offset, 100, callback);
    }
};
