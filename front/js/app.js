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
            .when('/live-logs', {
                templateUrl: 'views/livelogs.html',
                controller: 'LiveLogsCtrl'
            })
            .when('/logs', {
                templateUrl: 'views/logsOverview.html',
                controller: 'LogsOverviewCtrl'
            })
            .when('/logfile/:name', {
                templateUrl: '/views/logFile.html',
                controller: 'LogFileCtrl'
            })
            .when('/', {
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function ($rootScope, $animate, socket) {
        console.log('running');
        $animate.enabled(true);
        $rootScope.authenticated = null;
    });