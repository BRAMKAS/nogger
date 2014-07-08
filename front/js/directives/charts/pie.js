'use strict';

app.directive('pie', function (colorGen) { // jshint ignore:line
    return {
        restrict: 'E',
        scope: {
            values: '=',
            labels: '='
        },
        template: '<div class="pie"></div>',
        replace: true,
        link: function (scope, elem) {
            var initialized = false;
            var plot;

            scope.$watch('values', function (values) {
                if (initialized) {
                    plot.setData(calcData());
                    plot.setupGrid();
                    plot.draw();
                } else {
                    init();
                }
            }, true);

            setTimeout(function () {
                init();
            }, 2000);

            function calcData() {
                var data = scope.values;
                if (!data) {
                    return [];
                }
                var re = [];
                data.forEach(function (val, index) {
                    var label = '';
                    if (scope.labels && scope.labels[index]) {
                        label = scope.labels[index];
                    }
                    re.push({label: label, data: val, color: colorGen(index)});
                });
                return re;
            }

            function labelFormatter() {
                return ['a', 'b'];
            }

            function init() {
                if (!initialized && scope.values && $.fn.plot) {
                    var onlyZero = true;
                    for (var i in scope.values) {
                        if (scope.values[i]) {
                            onlyZero = false;
                            break;
                        }
                    }


                    initialized = true;
                    var data = calcData();
                    var options = {
                        series: {
                            pie: {
                                show: true,
                                label: {
                                    show: true,
                                    background: {
                                        opacity: 1,
                                        color: '#f5f5f5'
                                    }
                                }
                            }
                        },
                        legend: {
                            show: onlyZero
                        }
                    };
                    plot = $.plot(elem, data, options);
                    return true
                }
                return false;
            }
        }
    };
});