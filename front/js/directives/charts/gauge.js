'use strict';

app.directive('gauge', function () { // jshint ignore:line
    return {
        restrict: 'E',
        scope: {
            maxValue: '=',
            value: '='
        },
        template: '<canvas class="chart-gauge"></canvas>',
        replace: true,
        link: function (scope, elem) {
            var opts, gauge;
            var initialized = false;

            scope.$watch('value', function (value) {
                if (initialized) {
                    gauge.set(value || 1);
                } else {
                    init();
                }
            });

            scope.$watch('maxValue', function (maxValue) {
                init();
            });

            function init() {
                if (!initialized && scope.maxValue !== undefined && scope.value !== undefined) {
                    initialized = true;
                    opts = {
                        lines: 12, // The number of lines to draw
                        angle: 0, // The length of each line
                        lineWidth: 0.48, // The line thickness
                        pointer: {
                            length: 0.6, // The radius of the inner circle
                            strokeWidth: 0.03, // The rotation offset
                            color: '#464646' // Fill color
                        },
                        limitMax: 'true', // If true, the pointer will not go past the end of the gauge
                        colorStart: '#1B8F89', // Colors
                        colorStop: '#1fb5ad', // just experiment with them
                        strokeColor: '#F1F1F1', // to see which ones work best for you
                        generateGradient: true
                    };

                    gauge = new Gauge(elem[0]).setOptions(opts); // create sexy gauge!
                    gauge.maxValue = scope.maxValue || 1; // set max gauge value
                    gauge.animationSpeed = 32; // set animation speed (32 is default value)
                    gauge.set(scope.value || 1); // set actual value
                    return true
                }
                return false;
            }
        }
    };
});