'use strict';
app.controller("DashboardCtrl", function ($scope, dataStore) {
    new Morris.Donut({
        element: 'donut-example',
        colors: ['#188983', '#1fb5ad', '#26D6CD'],
        data: [
            {label: "Download Sales", value: 12},
            {label: "In-Store Sales", value: 30},
            {label: "Mail-Order Sales", value: 20}
        ]
    });
    new Morris.Donut({
        element: 'donut-example2',
        colors: ['#188983', '#1fb5ad', '#26D6CD'],
        data: [
            {label: "Download Sales", value: 12},
            {label: "In-Store Sales", value: 30},
            {label: "Mail-Order Sales", value: 20}
        ]
    });
    new Morris.Donut({
        element: 'donut-example3',
        colors: ['#188983', '#1fb5ad', '#26D6CD'],
        data: [
            {label: "Download Sales", value: 12},
            {label: "In-Store Sales", value: 30},
            {label: "Mail-Order Sales", value: 20}
        ]
    });
    new Morris.Donut({
        element: 'donut-example4',
        colors: ['#188983', '#1fb5ad', '#26D6CD'],
        data: [
            {label: "Download Sales", value: 12},
            {label: "In-Store Sales", value: 30},
            {label: "Mail-Order Sales", value: 20}
        ]
    });

    Morris.Area({
        element: 'area-example',
        data: [
            { y: '2006', a: 30, b: 10 },
            { y: '2007', a: 45,  b: 25 },
            { y: '2008', a: 50,  b: 40 },
            { y: '2009', a: 75,  b: 65 },
            { y: '2010', a: 50,  b: 40 },
            { y: '2011', a: 75,  b: 65 },
            { y: '2012', a: 100, b: 90 }
        ],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        lineColors: ['#188983', '#1fb5ad', '#26D6CD']
    });
});