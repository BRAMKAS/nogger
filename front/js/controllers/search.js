'use strict';
app.controller("SearchCtrl", function ($rootScope, $scope, socket) {
    $scope.settings = {
        start: 0,
        limit: 100,
        search: {
            input: '',
            regex: false,
            caseSensitive: false
        },
        totoal: 0,
        searching: false,
        searched: false,
        searchResults: []
    };

    $scope.search = function () {
        if (!$scope.settings.searching) {
            $scope.settings.searching = true;
            $scope.settings.searchResults = [];
            $scope.settings.reqLimit = $scope.settings.limit;
            socket.emit('search', {
                input: $scope.settings.search.input,
                regex: $scope.settings.search.regex,
                caseSensitive: $scope.settings.search.caseSensitive,

                start: $scope.settings.start,
                limit: $scope.settings.limit
            }, function (re) {
                console.log(re);
                $scope.settings.searched = true;
                $scope.settings.searching = false;
                if (re.err) {
                    if (re.err && re.err.code === 'ENOENT') {
                        alert('search not supported on this system')
                    } else {
                        alert(re.err);
                    }
                } else {
                    $scope.settings.searchResults = re.data.result || [];
                    $scope.settings.total = re.data.total;
                }
                $scope.$apply();
            });
        }
    }
});
