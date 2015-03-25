var fs = require('fs');

console.log(1);
setTimeout(function () {
    fs.writeFile('./argv', 'asdf' + Date.now(), function () {
        process.exit();
    });
}, 100000);

//require('./back/server');

