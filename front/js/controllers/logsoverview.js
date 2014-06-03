'use strict';
app.controller("LogsOverviewCtrl", function ($rootScope, $scope, dataStore) {
    $rootScope.navbar = {
        headline: 'Logs Overview',
        searchEnabled: true,
        filter: false
    };
    /*$scope.logFiles = dataStore.data.logs.files;
    $scope.$watch(function(){
        if(dataStore.data.logs.files){
            return dataStore.data.logs.files.length;
        } else {
            return 0;
        }
    }, function(){
        $scope.logFiles = dataStore.data.logs.files;
    })*/
});