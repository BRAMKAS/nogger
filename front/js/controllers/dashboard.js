'use strict';
app.controller("DashboardCtrl", function ($rootScope, $scope, dataStore) {
    $rootScope.navbar = {
        headline: 'Dashboard',
        searchEnabled: false,
        filter: false
    };
    $scope.data = dataStore.data;
    $scope.systemStatics = ['hostname', 'platform', 'arch', 'nodeStartTime', 'nodeVersions', 'osStartTime'];
    $scope.hasStatics = function () {
        for (var i in $scope.data.metrics.static) {
            if ($scope.systemStatics.indexOf(i) === -1)
                return true;
        }
        return false;
    };

    $scope.timerTickFormatter = function(val){
        console.log(val);
        return val;
    };

    $scope.enlarge = function($element){
        console.log($element)
    };

    $scope.col = { zoomed: false };
});