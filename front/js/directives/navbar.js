'use strict';
app.directive("navbar", function ($rootScope, $location) {
    return {
        restrict: 'E',
        templateUrl: "/views/navbar.html",
        link: function (scope) {
            $rootScope.search = "";
            scope.route = $location.path();
            $rootScope.$on('$routeChangeSuccess', function () {
                scope.route = $location.path();
            });

            scope.show = $rootScope.show;
        }
    }
});
