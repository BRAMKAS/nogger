var password = require("./back/password");
console.log('setting password to "' + process.argv[2] +'"');

password.set(process.argv[2], function () {
    console.log('password set');
    process.exit();
});