'use strict';

app.directive('histogram', function () { // jshint ignore:line

    function getData(data, label, highlight) {
        var lines = {
            show: true,
            fill: false,
            lineWidth: 2
        };
        if(highlight){
            lines.fill = true;
            lines.fillColor = { colors: [ { opacity: 0.4 }, { opacity: 0.1 } ] }
        }
        return {
            color: highlight ? "#14746f" : "#87cfcb",
            label: label,
            data: data,
            lines: lines
        };
    }

    return {
        restrict: 'E',
        scope: {
            values: '=',
            highlight: '=',
            minValue: '=',
            maxValue: '=',
            labels: '=',
            showYaxis: '='
        },
        template: '<div style="width: 100%; height:120px"></div>',
        replace: true,
        link: function (scope, elem) {
            var initialized = false;

            scope.$watch('values', function (values) {
                if (initialized) {

                } else {
                    init();
                }
            });

            setTimeout(function () {
                init();
            }, 2000);
            function init() {
                if (!initialized && scope.values && $.fn.plot) {
                    var data;
                    if (typeof scope.values[0].v === 'object') {
                        var splitValues = [];
                        data = [];
                        scope.values.forEach(function (value, index) {
                            value.v.forEach(function (v, i) {
                                if (!splitValues[i]) {
                                    splitValues[i] = [];
                                }
                                splitValues[i].push([value.d , v]);
                            });
                        });
                        splitValues.forEach(function (values, index) {
                            data.push(getData(values, scope.labels ? scope.labels[index] || "" : "", scope.highlight !== undefined ? scope.highlight === index : true));
                        })
                    } else {
                        data = [getData(scope.values, scope.labels ? scope.labels[0] || "" : "", true)];
                    }
                    initialized = true;

                    var options = {
                        grid: {
                            backgroundColor: {
                                colors: ["#fff", "#fff"]
                            },
                            borderWidth: 0,
                            borderColor: "#f0f0f0",
                            margin: 0,
                            minBorderMargin: 0,
                            labelMargin: 20,
                            hoverable: true,
                            clickable: true
                        },
                        tooltip: true,
                        tooltipOpts: {
                            content: scope.tooltips || "%s X: %x Y: %y",
                            shifts: {
                                x: -60,
                                y: 25
                            },
                            defaultTheme: false
                        },
                        legend: {
                            labelBoxBorderColor: "#ccc",
                            show: false,
                            noColumns: 0
                        },
                        series: {
                            stack: false,
                            shadowSize: 0,
                            highlightColor: 'rgba(30,120,120,.5)'
                        },
                        yaxis: {
                            show: scope.showYaxis,
                            labelWidth: 0,
                            min: scope.minValue,
                            max: scope.maxValue
                        },
                        xaxis: {
                            ticks: 3,
                            tickLength: 0,
                            mode: "time",
                            timezone: "browser"
                        },
                        points: {
                            show: false

                        }
                        // colors: getColors(length)
                    };
                    var plot = elem.plot(data, options);
                    return true
                }
                return false;
            }
        }
    };
});