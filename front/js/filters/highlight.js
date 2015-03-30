app.filter('highlight', function ($sce) {
    return function (line, highlight, regex, caseSensitive, className) {
        if (!highlight) {
            return line;
        }
        if (regex) {
            return $sce.trustAsHtml(line.replace(new RegExp(highlight, 'g' + (caseSensitive ? '' : 'i')), '<span class="list-group-item-' + className + '">$&</span>'));
        } else {
            return $sce.trustAsHtml(line.replace(new RegExp(highlight, 'gi'), '<span class="list-group-item-' + className + '">$&</span>'));
        }
    };
});
