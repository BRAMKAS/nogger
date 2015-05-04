app.directive('logline', function () {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            highlight: '=',
            update: '='
        },
        template: ['<span ng-repeat="item in overlays" ng-class="{\'list-group-item-warning\': item.highlight}" bo-text="item.data"></span>'],
        link: function (scope, element, attrs) {
            if(scope.update){
                scope.$watch('highlight', update, true);
            }
            update();

            function update() {
                scope.overlays = [];
                if (scope.highlight.input) {
                    var found = [];
                    if (scope.highlight.regex) {
                        found = scope.data.match(new RegExp(scope.highlight.input, 'g' + (scope.highlight.caseSensitive ? '' : 'i')));
                    } else {
                        found = scope.data.match(new RegExp(escape(scope.highlight.input), 'gi'));
                    }

                    var searchPointer = 0;
                    found.forEach(function (result) {
                        var index = scope.data.indexOf(result, searchPointer);
                        if (index > searchPointer) {
                            scope.overlays.push({
                                highlight: false,
                                data: scope.data.substring(searchPointer, index)
                            });
                        }
                        searchPointer = index;
                        scope.overlays.push({
                            highlight: true,
                            data: scope.data.substr(searchPointer, result.length)
                        });
                        searchPointer = searchPointer + result.length;
                    });
                    if(searchPointer < scope.data.length){
                        scope.overlays.push({
                            highlight: false,
                            data: scope.data.substring(searchPointer, scope.data.length)
                        });
                    }
                } else {
                    scope.overlays = [{
                        highlight: false,
                        data: scope.data
                    }];
                }
            }

            function escape(text){
                return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            }
        }
    }
});

