var express = require('express');
var app = express();
var nogger = require('nogger').adapter();

app.get('/', function(req, res){
    res.send('hello world');
});

app.listen(3000);