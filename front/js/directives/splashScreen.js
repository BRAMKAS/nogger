'use strict';
app.directive("splashScreen", function ($rootScope, $location) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "/views/splashScreen.html",
        link: function (scope) {

        }
    }
});