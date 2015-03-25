'use strict';
app.directive("stickBottom", function ($rootScope, $location) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            console.log(scope.grep);
            var adjustSize = _.debounce(function () {
                console.log('adjustsize', hasOverflow());
                if (hasOverflow()) {
                    console.log('remove class')
                    if (element[0].classList.contains('stickToBottom')) {
                        element[0].classList.remove('stickToBottom');
                    }
                } else {
                    console.log('add class')
                    if (!element[0].classList.contains('stickToBottom')) {
                        element[0].classList.add('stickToBottom');
                    }
                }
            }, 50);

            $rootScope.$watch('logs.length', function () {
                adjustSize();
            });

            scope.$watch('grep', function () {
                adjustSize();
            });

            window.onresize = _.throttle(function (event) {
                console.log('window.resize');
                adjustSize();
            }, 200);

            adjustSize();
            function hasOverflow() {
                return window.innerHeight < document.body.offsetHeight;
            }
        }
    }
});
