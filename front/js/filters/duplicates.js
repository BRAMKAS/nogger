app.filter('duplicates', function () {
    return function (items) {
        if (!items) {
            return [];
        }
        var newItems = [];
        var prev;
        var prevIndex;
        items.forEach(function (item, index) {
            if (prev && prev === item) {
                newItems[prevIndex].c++;
            } else {
                prevIndex = newItems.push({v: item, c: 1, index: index}) - 1;
                prev = item;
            }
        });
        return newItems;
    };
});
