'use strict';
app.controller("SearchCtrl", function ($rootScope, $scope) {
    var showMax = 100;
    $scope.buffer = 20;
    $scope.showMax = showMax;
    $scope.logs = [];
    $scope.$watch('logs.length', function () {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            })
        }
    });

    $scope.increaseShowMax = function () {
        $scope.showMax += showMax;
    };

    window.scrollTo(0, document.body.scrollHeight)
});
