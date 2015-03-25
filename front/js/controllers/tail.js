'use strict';
app.controller("TailCtrl", function ($rootScope, $scope, socket) {
    $scope.buffer = 20;
    $scope.grep = '';
    $scope.highlight = '';
    $scope.paused = false;
    $scope.userRegex = false;

    // update messages
    var debounceApply = _.debounce(function () {
        $scope.$apply();
    }, 100);

    socket.on('line', function (data) {
        $rootScope.logs.push(data);
        console.log($rootScope.logs.length);
        if ($rootScope.logs.length > 500) {
            console.log('exeeded 500 lines in cache - removing first 100');
            $rootScope.logs.splice(0, 100);
        }
        debounceApply();
    });

    // scroll to bottom
    $rootScope.$watch('logs.length', function () {
        if (hasOverflow()) {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            })
        }
    });
    window.scrollTo(0, document.body.scrollHeight);


    $scope.testHighlight = function (log) {
        if ($scope.highlight.length === 0) {
            return false;
        }
        return (log.indexOf($scope.highlight) !== -1);
    };

    function adjustSize() {
        if (!hasOverflow()) {

        } else {

        }
    }

    function hasOverflow() {
        return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
    }
});
