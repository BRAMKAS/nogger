var config = require("./config");
var redis = require("redis");
var db = redis.createClient(config.redisPort, config.redisIP, {
    auth_pass: config.redisPass
});
db.select(config.redisMetricsDb);

exports.getMetrics = function (callback) {
    db.keys("*", function (err, data) {
        if (err) {
            callback(err);
        } else {
            var re = {};
            var expect = data.length;
            var finished = 0;
            if (expect === 0) {
                callback(null, []);
            } else {
                data.forEach(function (val) {
                    var type, name, labels;
                    if (val.indexOf("#") > 0) {
                        type = val.substr(0, val.indexOf("#"));
                        name = val.substr(val.indexOf("#") + 1);
                        if (type === 'histogram') {
                            name = name.substr(0, name.lastIndexOf("["));
                            labels = val.substr(val.lastIndexOf("["));
                        }
                    } else {
                        type = val;
                    }

                    var add = function (err, data) {
                        if (!err) {
                            re[type] = re[type] || {};
                            if (name) {
                                if(labels){
                                    data = {labels: labels, data: data};
                                }
                                re[type][name] = data;
                            } else {
                                re[type] = data;
                            }
                        }
                        finished++;
                        if (finished === expect) {
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
