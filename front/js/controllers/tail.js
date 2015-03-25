'use strict';
app.controller("TailCtrl", function ($rootScope, $scope, socket) {
    $scope.buffer = 50;
    $scope.grep = '';
    $scope.grepRegex = false;
    $scope.grepSensitive = false;
    $scope.highlight = '';
    $scope.highlightRegex = false;
    $scope.highlightSensitive = false;
    $scope.paused = false;
    $scope.follow = true;

    var pauseQueue = [];

    // update messages
    var debounceApply = _.debounce(function () {
        $scope.$apply();
        scrollBottom();
    }, 100);

    socket.on('line', function (data) {
        if (!$scope.paused) {
            $rootScope.logs.push(data);
            console.log($rootScope.logs.length);
            if ($rootScope.logs.length > 500) {
                console.log('exeeded 500 lines in cache - removing first 100');
                $rootScope.logs.splice(0, 100);
            }
            debounceApply();
        } else {
            pauseQueue.push(data);
            if (pauseQueue.length > 500) {
                pauseQueue.splice(0, 100);
            }
        }
    });

    // scroll to bottom
    $rootScope.$watch('logs.length', scrollBottom);
    $rootScope.$watch('grep', scrollBottom);
    $rootScope.$watch('grepSensitive', scrollBottom);
    $rootScope.$watch('buffer', scrollBottom);
    window.scrollTo(0, document.body.scrollHeight);

    $scope.pause = function(){
        $scope.paused = !$scope.paused;
        if(!$scope.paused && pauseQueue.length > 0){
            $rootScope.logs = $rootScope.logs.concat(pauseQueue);
            if ($rootScope.logs.length > 500) {
                $rootScope.logs.splice(0, 100);
            }
        }
    };
    $scope.testHighlight = function (log) {
        if ($scope.highlight.length === 0) {
            return false;
        }
        return test(log, 'highlight');
    };

    $scope.testGrep = function (log) {
        if ($scope.grep.length === 0) {
            return true;
        }
        return test(log, 'grep');
    };

    function test(log, type) {
        if ($scope[type + 'Regex']) {
            try {
                return log.match(new RegExp($scope[type], $scope[type + 'CaseSensitive'] ? '' : 'i'));
            } catch (e) {
                return true;
            }
        } else {
            return log.toLowerCase().indexOf($scope[type].toLowerCase()) != -1;
        }
    }

    function scrollBottom() {
        if ($scope.follow) {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            });
            window.scrollTo(0, document.body.scrollHeight)
        }
    }
});
