'use strict';
app.controller("DashboardCtrl", function ($rootScope, $scope, dataStore) {
    $rootScope.navbar = {
        headline: 'Dashboard',
        searchEnabled: false,
        filter: false
    };
    $scope.gauge = {};
    $scope.data = dataStore.data;

    $scope.inResize = false;

    $scope.histograms = [];
    var units = {
        Memory: 'MB',
        CPU: '%'
    };

    setTimeout(function () {
        $scope.$watch('data.metrics.histogram', function (histogram) {
            //redrawhistogram(histogram);
            console.log('histogram', histogram);
            console.log('data', $scope.data);
            if (histogram && histogram.Memory && histogram.Memory.length > 0) {
                $scope.gauge.memProc = histogram.Memory[0].v[0];
                $scope.gauge.memSys = histogram.Memory[0].v[1];
                $scope.gauge.memTotal = histogram.Memory[0].v[2];

                console.log($scope.gauge);
            }
            //initCharts();
            if (histogram && histogram.CPU && histogram.CPU.length > 0) {
                $scope.gauge.cpu = histogram.CPU[0].v;
            }
        });
    }, 100);

    var resizeTimeout;
    $(window).on('resize', function () {
        if (!$scope.inResize) {
            $scope.$apply(function () {
                $scope.inResize = true;
            });
        }
        console.log('resize');
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            $scope.$apply(function () {
                $scope.inResize = false;
            });
        }, 300);
    });

    function initCharts() {
        var histograms, opts, target, gauge;
        if ($scope.data && $scope.data.metrics) {
            histograms = $scope.data.metrics.histogram;
        }
        if (histograms) {
            if (Gauge && histograms.Memory && histograms.Memory.length > 0) {
                $scope.memProc = histograms.Memory[0].process;
                $scope.memTotal = histograms.Memory[0].total;
                $scope.memSys = histograms.Memory[0].used;
                /*Process Memory Now*/
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
                    colorStart: '#188983', // Colors
                    colorStop: '#188983', // just experiment with them
                    strokeColor: '#F1F1F1', // to see which ones work best for you
                    generateGradient: true
                };


                target = document.getElementById('gauge-proc-mem'); // your canvas element
                gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
                gauge.maxValue = $scope.memTotal; // set max gauge value
                gauge.animationSpeed = 32; // set animation speed (32 is default value)
                gauge.set($scope.memProc); // set actual value

                /*System Memory Now*/
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
                    colorStart: '#188983', // Colors
                    colorStop: '#188983', // just experiment with them
                    strokeColor: '#F1F1F1', // to see which ones work best for you
                    generateGradient: true
                };


                target = document.getElementById('gauge-sys-mem'); // your canvas element
                gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
                gauge.maxValue = $scope.memTotal; // set max gauge value
                gauge.animationSpeed = 32; // set animation speed (32 is default value)
                gauge.set($scope.memSys); // set actual value
            }


            if (Gauge && histograms.CPU && histograms.CPU.length > 0) {
                $scope.cpu = histograms.CPU[0].CPU;
                console.log($scope.cpu);

                /*Knob*/
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
                    colorStart: '#188983', // Colors
                    colorStop: '#188983', // just experiment with them
                    strokeColor: '#F1F1F1', // to see which ones work best for you
                    generateGradient: true
                };

                target = document.getElementById('gauge-sys-cpu'); // your canvas element
                gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
                gauge.maxValue = 100; // set max gauge value
                gauge.animationSpeed = 32; // set animation speed (32 is default value)
                gauge.set($scope.cpu || 1); // set actual value
            }
        }
    }

    function redrawHistograms(histograms) {
        if (histograms) {
            console.log('redrawHistograms');
            var data;
            for (var i in histograms) {
                data = null;
                for (var j in histograms[i]) {
                    if (typeof histograms[i][j] === 'string') {
                        try {
                            histograms[i][j] = JSON.parse(histograms[i][j]);
                        } catch (e) {
                            console.warn(e);
                        }
                    } else {
                        break;
                    }
                }
                if (histograms[i].length > 0) {
                    var ykeys = [];
                    for (var k in histograms[i][0]) {
                        if (k !== 'd') {
                            ykeys.push(k);
                        }
                    }
                    // console.log('line', histograms[i])
                    var a = Morris.Line({
                        element: 'histogram-' + i,
                        data: histograms[i],
                        xkey: 'd',
                        ykeys: ykeys,
                        labels: ykeys,
                        lineColors: ['#188983', '#1fb5ad', '#26D6CD'],
                        postUnits: units[i]
                        // resize: true

                    });
                    console.log(a);
                }
            }

            if (histograms.Memory && histograms.Memory.length > 0) {
                /*console.log(histograms.Memory[0].process, histograms.Memory[0].used - histograms.Memory[0].process, histograms.Memory[0].total - histograms.Memory[0].used - histograms.Memory[0].process);
                 new Morris.Donut({
                 element: 'donut-Memory',
                 colors: ['#188983', '#1fb5ad', '#26D6CD'],
                 data: [
                 {label: "Process", value: histograms.Memory[0].process},
                 {label: "Used by other processes", value: histograms.Memory[0].used - histograms.Memory[0].process},
                 {label: "Free", value: histograms.Memory[0].total - histograms.Memory[0].used - histograms.Memory[0].process}
                 ],
                 postUnits: 'MB',
                 resize: true,
                 redraw: true
                 });*/
            }
        }
    }
});