'use strict';
var app = angular.module('app', [
        'ngSanitize',
        'ngAnimate',
        'ngRoute',
        'ui.bootstrap',
        'pasvaz.bindonce'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/others', {
                templateUrl: 'views/logsOverview.html',
                controller: 'LogsOverviewCtrl'
            })
            .when('/search', {
                templateUrl: 'views/search.html',
                controller: 'SearchCtrl'
            })
            .when('/', {
                templateUrl: 'views/tail.html',
                controller: 'TailCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function ($rootScope, $animate, $location, socket) {
        console.log('running');
        $animate.enabled(true);
        $rootScope.authenticated = null;
        $rootScope.show = {
            sidebar: false
        };
        $rootScope.logs = [];
        $rootScope.route = $location.path();
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.route = $location.path();
            $rootScope.show.sidebar = false;
        });
    });
