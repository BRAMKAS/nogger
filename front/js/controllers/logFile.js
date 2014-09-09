'use strict';
app.controller("LogFileCtrl", function ($rootScope, $scope, $routeParams, dataStore, socket) {
    $rootScope.navbar = {
        headline: 'LogFile ' + $routeParams.name,
        searchEnabled: true,
        filter: ['error', 'warn', 'info']
    };
    var showMax = 200;
    $scope.logFiles = dataStore.data.logs.files;
    $scope.showMax = showMax;
    $scope.logs = null;
    $rootScope.filters = ['error', 'warn', 'info'];
    for (var i in $scope.logFiles) {
        if ($scope.logFiles[i] === $routeParams.name) {
            $scope.logs = $scope.logFiles[i].data;
            break;
        }
    }
    if ($scope.logs === null) {
        if (socket.auth) {
            getLogFile();
        } else {
            $(document).on('auth', function () {
                getLogFile();
            });
        }
    }

    function getLogFile() {
        socket.emit('getLogFile', {name: $routeParams.name, offset: null}, function (re) {
            if (!re.err && re.data) {
                var data = [];
                for (var i in re.data) {
                    try {
                        data.push(JSON.parse(re.data[i]));
                    } catch (e) {
                        console.error(e);
                    }
                }
                $scope.logs = data;
                dataStore.setLogFile($routeParams.name, data);
            }
        });
    }

    $scope.increaseShowMax = function () {
        $scope.showMax += showMax;
    }
});