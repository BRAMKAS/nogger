'use strict';
app.directive("stickBottom", function ($rootScope, $location) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var adjustSize = _.debounce(function () {
                element[0].style.minHeight = window.innerHeight - 262 + 'px';
            }, 50);

            window.onresize = _.throttle(function (event) {
                adjustSize();
            }, 200);

            adjustSize();
            function hasOverflow() {
                return window.innerHeight < document.body.offsetHeight;
            }
        }
    }
});
