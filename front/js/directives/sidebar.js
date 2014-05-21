'use strict';
app.directive("sidebar", function ($rootScope, $location) {
    return {
        restrict: 'E',
        scope: {
            active: "="
        },
        templateUrl: "views/sidebar.html",
        link: function (scope) {
            scope.route = $location.path();
            $rootScope.$on('$routeChangeSuccess', function () {
                console.log('changed path to', $location.path());
                scope.route = $location.path();
            });
        }
    }
});