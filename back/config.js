var config = require('../config.json');
var configDefaults = require('../configDefaults.json');

var allConfig = {};
if (config) {
    for (var i in configDefaults) {
        if (config[i] !== undefined) {
            allConfig[i] = config[i];
        } else {
            allConfig[i] = configDefaults[i];
        }
    }
}

module.exports = exports = allConfig;