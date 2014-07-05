'use strict';

app.factory('colorGen', function () {
    var colors = [ '#1fb5ad', '#188F88', '#19A6CC', '#19CC90', '#17C258', '#1771C2' ];

    return function (index) {
        if (colors[index]) {
            return colors[index];
        }
        return '#1fb5ad';
    }
});