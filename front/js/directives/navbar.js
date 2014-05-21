'use strict';
app.directive("navbar", function () {
    return {
        restrict: 'E',
        scope: {
            active: "="
        },
        templateUrl: "views/navbar.html",
        link: function () {

        }
    }
});