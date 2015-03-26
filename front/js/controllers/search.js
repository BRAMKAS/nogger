'use strict';
app.controller("SearchCtrl", function ($rootScope, $scope, socket) {
    $scope.start = 0;
    $scope.limit = 100;
    $scope.regex = false;
    $scope.caseSensitive = false;
    $scope.searchInput = '';
    $scope.searchResults = [];
    $scope.searched = false;
    $scope.searching = false;
    $scope.total = 0;

    $scope.search = function () {
        if (!$scope.searching) {
            $scope.searching = true;
            $scope.searchResults = [];
            $scope.reqLimit = $scope.limit;
            socket.emit('search', {
                input: $scope.searchInput,
                start: $scope.start,
                limit: $scope.limit,
                regex: $scope.regex,
                caseSensitive: $scope.caseSensitive
            }, function (re) {
                console.log(re);
                $scope.searched = true;
                $scope.searching = false;
                if (re.err) {
                    if (re.err && re.err.code === 'ENOENT') {
                        alert('search not supported on this system')
                    } else {
                        alert(re.err);
                    }
                } else {
                    $scope.searchResults = re.data.result || [];
                    $scope.total = re.data.total;
                }
                $scope.$apply();
            });
        }
    }
});
