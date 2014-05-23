'use strict';
app.controller("LogsOverviewCtrl", function ($scope, dataStore) {
    $scope.logs = dataStore.logs;
    $scope.$watch(function(){
        if(dataStore.logs){
            return dataStore.logs.length;
        } else {
            return 0;
        }
    }, function(){
        console.log('updated logs', dataStore.logs);
        $scope.logs = dataStore.logs;
    })
});