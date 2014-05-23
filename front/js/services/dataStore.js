'use strict';

app.factory('dataStore', function ($rootScope, $interval) { // jshint ignore:line
    var data = {
        metrics: {},
        logs: {
            now: [],
            files: {}
        }
    };

    $interval(function () {
        if (data.gauge && data.gauge.Uptime && data.gauge.Uptime.uptime) {
            data.gauge.Uptime.uptime = parseInt(data.gauge.Uptime.uptime);
            data.gauge.Uptime.uptime += 60;
        }
        if (data.gauge && data.gauge.Uptime && data.gauge.Uptime.osuptime) {
            data.gauge.Uptime.osuptime = parseInt(data.gauge.Uptime.osuptime);
            data.gauge.Uptime.osuptime += 60;
        }
    }, 1000 * 60);

    function addData(newData, data) {
        for (var i in newData) {
            if (typeof newData[i] === 'object' && Object.prototype.toString.call(newData[i]) !== '[object Array]') {
                if (!data[i]) {
                    data[i] = {};
                }
                addData(newData[i], data[i]);
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
            console.log('set setLogFiles', data.logs);
            for(var i in newData){
                data.logs.files[newData[i]] = null;
            }
        },
        addLog: function (newLog) {
            data.logs.now.push(newLog);
            $rootScope.$apply();
        },
        data: data
    };
});