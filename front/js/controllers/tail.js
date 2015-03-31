'use strict';
app.controller("TailCtrl", function ($rootScope, $scope, socket, $location) {
    $scope.settings = {
        buffer: 50,
        grep: '',
        grepRegex: false,
        grepCaseSensitive: false,
        highlight: '',
        highlightRegex: false,
        highlightCaseSensitive: false,
        paused: false,
        follow: true
    };

    var pauseQueue = [];




    // update messages
    var debounceApply = _.debounce(function () {
        $scope.$apply();
        scrollBottom();
    }, 100);

    socket.on('line', addLine);

    // scroll to bottom
    $rootScope.$watch('logs.length', scrollBottom);
    $rootScope.$watch('settings.grep', scrollBottom);
    $rootScope.$watch('settings.grepCaseSensitive', scrollBottom);
    $rootScope.$watch('settings.buffer', scrollBottom);
    $rootScope.$watch('authenticated', getTail);
    window.scrollTo(0, document.body.scrollHeight);

    $scope.pause = function () {
        $scope.settings.paused = !$scope.settings.paused;
        if (!$scope.settings.paused && pauseQueue.length > 0) {
            $rootScope.logs = $rootScope.logs.concat(pauseQueue);
            if ($rootScope.logs.length > 500) {
                $rootScope.logs.splice(0, 100);
            }
        }
    };
    $scope.testHighlight = function (log) {
        if ($scope.settings.highlight.length === 0) {
            return false;
        }
        return test(log, 'highlight');
    };

    $scope.testGrep = function (log) {
        if ($scope.settings.grep.length === 0) {
            return true;
        }
        return test(log, 'grep');
    };

    $scope.clear = function(){
        $rootScope.logs = [];
    };

    function addLine(data) {
        if (!$scope.settings.paused) {
            $rootScope.logs.push(data);
            if ($rootScope.logs.length > 500) {
                console.log('exceeded 500 lines in cache - removing first 100');
                $rootScope.logs.splice(0, 100);
            }
            debounceApply();
        } else {
            pauseQueue.push(data);
            if (pauseQueue.length > 500) {
                pauseQueue.splice(0, 100);
            }
        }
    }

    function test(log, type) {
        if ($scope.settings[type + 'Regex']) {
            try {
                return log.match(new RegExp($scope.settings[type], $scope.settings[type + 'CaseSensitive'] ? '' : 'i'));
            } catch (e) {
                return true;
            }
        } else {
            return log.toLowerCase().indexOf($scope.settings[type].toLowerCase()) != -1;
        }
    }

    function scrollBottom() {
        if ($scope.settings.follow && $location.path() === '/') {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            });
            window.scrollTo(0, document.body.scrollHeight)
        }
    }

    function getTail(){
        if(!$rootScope.authenticated){
            return;
        }
        // get initial logs
        socket.emit('search', {
            limit: 20
        }, function (re) {
            console.log('search returned: ', re);
            if (re.err) {
                if (re.err && re.err.code === 'ENOENT') {
                    alert('search not supported on this system')
                } else {
                    alert(re.err);
                }
            } else {
                $rootScope.logs = re.data.result.reverse();
            }
            $scope.$apply();
        });
    }

    $scope.$on('$destroy', function () {
        socket.removeListener('line', addLine);
    })
});
