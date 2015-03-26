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
            scope.host = 'https://' + document.location.hostname;
            $rootScope.$on('$routeChangeSuccess', function () {
                scope.route = $location.path();
            });
            scope.otherInstances = $rootScope.otherInstances;

            $rootScope.$watch('otherInstances', function () {
                scope.otherInstances = $rootScope.otherInstances;
            });

            scope.logout = function () {
                localStorage.removeItem('p');
                sessionStorage.removeItem('p');
                document.location = document.location;
            };

            scope.show = $rootScope.show;
        }
    }
});
