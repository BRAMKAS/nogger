var password = require("./lib/password");

password.set("TEST123", function () {
    password.match("TEST123", function (success) {
        console.log(1, success);
        password.match("TEST1234", function (success) {
            console.log(2, success);
        })
    });
});