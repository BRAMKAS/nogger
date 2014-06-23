'use strict';
app.directive("navbar", function ($rootScope, $location) {
    return {
        restrict: 'E',
        scope: {
            active: "="
        },
        templateUrl: "/views/navbar.html",
        link: function (scope) {
            scope.route = $location.path();
            $rootScope.$on('$routeChangeSuccess', function () {
                scope.route = $location.path();
            });

            $rootScope.$watch('navbar', function(){
                scope.navbar = $rootScope.navbar;
            })
        }
    }
});