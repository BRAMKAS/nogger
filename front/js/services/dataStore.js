'use strict';

app.factory('dataStore', function ($rootScope, $interval) { // jshint ignore:line
    var data = {
        metrics: {
            gauge: {
                Uptime: {}
            }
        },
        logs: {
            now: [],
            files: []
        }
    };


    $interval(function () {
        if (data.metrics.gauge && data.metrics.gauge.Uptime && data.metrics.gauge.Uptime.uptime) {
            data.metrics.gauge.Uptime.uptime = parseInt(data.metrics.gauge.Uptime.uptime);
            data.metrics.gauge.Uptime.uptime += 60;
        }
        if (data.metrics.gauge && data.metrics.gauge.Uptime && data.metrics.gauge.Uptime.osuptime) {
            data.metrics.gauge.Uptime.osuptime = parseInt(data.metrics.gauge.Uptime.osuptime);
            data.metrics.gauge.Uptime.osuptime += 60;
        }
    }, 1000 * 60);

    function addData(newData, data) {
        for (var i in newData) {
            if (typeof newData[i] === 'object' && Object.prototype.toString.call(newData[i]) !== '[object Array]') {
                if (!data[i]) {
                    data[i] = {};
                }
                addData(newData[i], data[i]);
            } else if (Object.prototype.toString.call(newData[i]) === '[object Array]') {
                var shouldParse = false;
                if (typeof newData[i][0] == 'string') {
                    try {
                        JSON.parse(newData[i][0]);
                        shouldParse = true;
                    } catch (e) {
                        console.warn(e);
                    }
                }
                if (shouldParse) {
                    for (var j in newData[i]) {
                        if (typeof newData[i][j] === 'string') {
                            try {
                                newData[i][j] = JSON.parse(newData[i][j]);
                            } catch (e) {
                                console.warn(e);
                            }
                        }
                    }
                }
                data[i] = newData[i];
            } else {
                data[i] = newData[i];
            }
        }
    }


    return {
        setHealth: function (health) {
            data.health = health;
            $rootScope.$apply();
        },
        setMetrics: function (newData) {
            addData(newData, data.metrics);
            $rootScope.$apply();
        },
        setLogNames: function (newData) {
            for (var i in newData) {
                var exists = false;
                for (var j in data.logs.files) {
                    if (data.logs.files[j].name == newData[i]) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    data.logs.files.push({name: newData[i], data: null});
                }
            }
            $rootScope.$apply(function () {
                $rootScope.logFiles = data.logs.files;
            })
        },
        setLogFile: function (name, file) {
            for (var i in data.logs.files) {
                if (data.logs.files[i].name === name) {
                    data.logs.files[i].data = file;
                    $rootScope.$apply();
                    return;
                }
            }
            console.warn('could not find logfile to store data');
        },
        addLog: function (newLog) {
            data.logs.now.push(newLog);
            $rootScope.$apply();
        },
        addMetric: function (newMetrics) {
            console.log('adding new metrics');
            newMetrics.forEach(function (newMetric) {
                if (data.metrics && data.metrics[newMetric.t] && data.metrics[newMetric.t][newMetric.n]) {
                    data.metrics[newMetric.t][newMetric.n].unshift(newMetric.v);
                }
            })
        },
        data: data
    };
});