'use strict';

app.directive('histogram', function () { // jshint ignore:line
    var colors = ["#87cfcb", "#48a9a7", "#1F9B94", "#14746f"];

    function getColors(num) {
        switch (num) {
            case 1:
                return colors[colors.length - 1];
            case 2:
                return [colors[0], colors[colors.length - 1]];
            case 3:
                return [colors[0], colors[Math.round(colors.length / 2)], colors[colors.length - 1]];
            default:
                return colors.slice(0, num);
        }
    }

    function getFillColors(num) {
        var re = [];
        for (var i = 0; i < num; i++) {
            re.push("rgba(255,255,255,." + (i + 1) + ")");
        }
        console.log(re);
        return re;
    }

    function getData(data, label, highlight) {
        console.log(highlight);
        return {
            color: highlight ? "#14746f" : "#87cfcb",
            label: label,
            data: data,
            lines: {
                show: true,
                fill: false,
                lineWidth: 2
            }
        };
    }

    return {
        restrict: 'E',
        scope: {
            values: '=',
            highlight: '=',
            tooltips: '=',
            labels: '='
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
                            data.push(getData(values, scope.labels ? scope.labels[index] || "" : "", scope.highlight !==undefined ? scope.highlight === index : true));
                        })
                    } else {
                        data = [getData(scope.values, scope.labels ? scope.labels[0] || "" : "", true)];
                    }
                    console.log(data);
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
                        xaxis: {
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