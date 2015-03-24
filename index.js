var fs = require('fs');

console.log(1);
setTimeout(function(){

},99999);

//require('./back/server');

process.on('uncaughtException', function (err) {
    fs.writeFileSync('err', err.message);
});
