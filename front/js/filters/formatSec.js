'use strict';

app.filter('formatSec', function () { // jshint ignore:line
    return function (time) {
        var sec = parseInt(time) || 0;
        var days = Math.floor(sec / (60 * 60 * 24));
        sec = sec - (60 * 60 * 24 * days);
        var hours = Math.floor(sec / (60 * 60));

        if (days && hours) {
            return days + 'd ' + hours + 'h';
        }

        sec = sec - (60 * 60 * hours);
        var mins = Math.floor(sec / 60);

        if (hours && mins) {
            return hours + 'h ' + mins + 'm';
        }

        return mins + 'm';
    };
});
