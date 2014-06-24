'use strict';
app.controller("DashboardCtrl", function ($rootScope, $scope, dataStore) {
    $rootScope.navbar = {
        headline: 'Dashboard',
        searchEnabled: false,
        filter: false
    };
    $scope.data = dataStore.data;
});