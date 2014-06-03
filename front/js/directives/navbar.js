'use strict';
app.directive("navbar", function ($rootScope) {
    return {
        restrict: 'E',
        scope: {
            active: "="
        },
        templateUrl: "/views/navbar.html",
        link: function (scope) {
            $rootScope.$watch('navbar', function(){
                scope.navbar = $rootScope.navbar;
            })
        }
    }
});