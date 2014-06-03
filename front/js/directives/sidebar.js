'use strict';
app.directive("sidebar", function ($rootScope, $location) {
    return {
        restrict: 'E',
        scope: {
            active: "="
        },
        templateUrl: "/views/sidebar.html",
        link: function (scope) {
            scope.route = $location.path();
            $rootScope.$on('$routeChangeSuccess', function () {
                scope.route = $location.path();
            });

            $rootScope.$watch('logFiles', function(){
                scope.logFiles = $rootScope.logFiles;
            })
        }
    }
});