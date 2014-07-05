var config = require('./config');
var nogger = require('nogger-node-adapter');

nogger.init(config);

new nogger.metrics.Static(function(){
    return {
        "TestStatic" : "This is a text that will appear on the page"
    }
});

var meter = new nogger.metrics.Meter('TestMeter');
var counter = new nogger.metrics.Counter('TestCounter');
var timer = new nogger.metrics.Timer('TestTimer');
var histogramVal = Math.round(Math.random() * 1000);
var alphaVal = Math.round(Math.random() * 1000);
var betaVal = Math.round(Math.random() * 1000);
var histogram = new nogger.metrics.Histogram('TestHistogram', 'histogramVal', function(){
    return histogramVal;
});
var histogram2 = new nogger.metrics.Histogram('TestHistogram2', ['alphaVal', 'betaVal'], function(){
    return [
        alphaVal,
        betaVal
    ];
});
var gaugeVal = Math.round(Math.random() * 100);
var gauge = new nogger.metrics.Gauge(function(){
    return {
        'TestGauge': gaugeVal
    };
});



randomInterval(10000, function(){
    meter.mark();
});

randomInterval(10000, function(){
    if(Math.random() > 0.5 && counter.val > 0){
        counter.dec();
    } else {
        counter.inc();
    }
});

randomInterval(1000, function(){
    if(timer.running){
        timer.end();
        console.log('timer ended');
    } else {
        timer.start();
        console.log('timer started');
    }
});

randomInterval(10000, function(){
    gaugeVal = Math.round(Math.random() * 100);
});

randomInterval(10000, function(){
    histogramVal = Math.round(Math.random() * 1000);
    alphaVal = Math.round(Math.random() * 1000);
    betaVal =Math.round(Math.random() * 1000);
});

function randomInterval(t, fn){
    fn();
    setTimeout(function(){
        randomInterval(t, fn);
    }, Math.random() * t);
}