'use strict';
app.controller("LiveLogsCtrl", function ($rootScope, $scope, dataStore) {
    $rootScope.navbar = {
        headline: 'Live Logs',
        searchEnabled: true,
        filter: ['error', 'warn', 'info', 'debug']
    };
    var showMax = 100;
    $scope.showMax = showMax;
    $scope.logs = dataStore.data.logs.now;
    $scope.$watch('logs.length', function () {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            })
        }
    });

    $scope.increaseShowMax = function () {
        $scope.showMax += showMax;
    }
});