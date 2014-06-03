'use strict';
app.controller("DashboardCtrl", function ($rootScope, $scope, dataStore) {
    $rootScope.navbar = {
        headline: 'Dashboard',
        searchEnabled: false,
        filter: false
    };
    $scope.data = dataStore.data;

    $scope.histograms = [];
    var units = {
        Memory: 'MB',
        CPU: '%'
    };

    $scope.$watch('data.metrics.histogram', function (histograms) {
        redrawHistograms(histograms);
    });



    function redrawHistograms(histograms) {
        if (histograms) {
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
                    }
                }
                if (histograms[i].length > 0) {
                    var ykeys = [];
                    for (var k in histograms[i][0]) {
                        if (k !== 'd') {
                            ykeys.push(k);
                        }
                    }
                    Morris.Line({
                        element: 'histogram-' + i,
                        data: histograms[i],
                        xkey: 'd',
                        ykeys: ykeys,
                        labels: ykeys,
                        lineColors: ['#188983', '#1fb5ad', '#26D6CD'],
                        postUnits: units[i],
                        resize: true,
                        redraw: true
                    });
                }
            }

            if (histograms.Memory && histograms.Memory.length > 0) {
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
                });
            }
        }
    }
});