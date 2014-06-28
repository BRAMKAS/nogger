'use strict';

app.directive('histogram', function () { // jshint ignore:line

    function getData(data, label, highlight) {
        var lines = {
            show: true,
            fill: false,
            lineWidth: 2
        };
        if (highlight) {
            lines.fill = true;
            lines.fillColor = { colors: [ '#1fb5ad', '#1fb5ad' ] }
        }
        return {
            color: highlight ? "#14746f" : "#87cfcb",
            label: label,
            data: data,
            lines: lines
        };
    }


    $("<div id='tooltip'></div>").css({
        position: "absolute",
        display: "none",
        border: "1px solid #fdd",
        padding: "2px",
        "background-color": "#eee",
        opacity: 0.80
    }).appendTo("body");


    return {
        restrict: 'E',
        scope: {
            values: '=',
            highlight: '=',
            minValue: '=',
            maxValue: '=',
            labels: '=',
            showYaxis: '=',
            ticks: '=',
            yTickMult: '=',
            yTickPostFix: '=',
            yTickPreFix: '='
        },
        template: '<div class="histogram"></div>',
        replace: true,
        link: function (scope, elem) {
            var initialized = false;
            var plot, plotTimeout;

            scope.$watch(function () {
                return scope.values ? scope.values.length : 0;
            }, function (values) {
                if (initialized) {
                    plot.setData(calcData());
                    plot.setupGrid();
                    plot.draw();
                } else {
                    init();
                }
            });

            elem.bind("plothover", function (event, pos, item) {
                if (item) {
                    clearTimeout(plotTimeout);
                    $("#tooltip").html(formatVal(item.datapoint[1]))
                        .css({top: item.pageY - 30, left: item.pageX - 8})
                        .fadeIn(200);
                    plotTimeout = setTimeout(function () {
                        $("#tooltip").hide();
                    }, 1500);
                } else {
                    $("#tooltip").hide();
                }
            });

            setTimeout(function () {
                init();
            }, 2000);

            function calcData() {
                var data;
                if (typeof scope.values[0][1] === 'object') {
                    var splitValues = [];
                    data = [];
                    scope.values.forEach(function (value, index) {
                        value[1].forEach(function (v, i) {
                            if (!splitValues[i]) {
                                splitValues[i] = [];
                            }
                            splitValues[i].push([value[0] , v]);
                        });
                    });

                    splitValues.forEach(function (values, index) {
                        if (data.length < 10) {
                            data.push(getData(values, scope.labels ? scope.labels[index] || "" : "", scope.highlight !== undefined ? scope.highlight === index : true));
                        }
                    })
                } else {
                    data = [getData(scope.values, scope.labels ? scope.labels[0] || "" : "", true)];
                }
                return data;
            }

            function init() {
                if (!initialized && scope.values && $.fn.plot) {
                    initialized = true;
                    var data = calcData();
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
                            content: "%s X: %x Y: %y",
                            shifts: {
                                x: -60,
                                y: 25
                            },
                            defaultTheme: true
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
                            ticks: scope.ticks,
                            tickFormatter: function (val, axis) {
                                return formatVal(val);
                            },
                            labelWidth: 0,
                            min: scope.minValue,
                            max: scope.maxValue
                        },
                        xaxis: {
                            ticks: 3,
                            // tickSize: 0.1,
                            tickLength: 0,
                            mode: "time",
                            timezone: "browser",
                            alignTicksWithAxis: 2
                        },
                        points: {
                            show: false

                        }
                        // colors: getColors(length)
                    };
                    plot = $.plot(elem, data, options);
                    return true
                }
                return false;
            }

            function formatVal(val){
                if (scope.yTickMult) {
                    val = Math.round(val * scope.yTickMult);
                }
                if (scope.yTickPostFix) {
                    val = val + scope.yTickPostFix;
                }
                if (scope.yTickPreFix) {
                    val = scope.yTickPreFix + val;
                }
                return val;
            }
        }
    };
});