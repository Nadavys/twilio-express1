/**
 * Module dependencies.
 */

function processFizzBuzzLogic( num ){
    var retVal;
    // FizzBuzz Logic
    if ((num % 3 === 0) && (num % 5 === 0)) {
        retVal = "FizzBuzz";
    } else if (num % 3 === 0) {
        retVal = "Fizz";
    } else if (num % 5 === 0) {
        retVal = "Buzz";
    } else {
        retVal = num;
    }

return retVal;
}

function fizzBuzzLoop(total){
    var retVal = []
    for (var i = 1; i <= total; i++) {
        retVal.push(processFizzBuzzLogic(i));
    }
return retVal.join(' ')
}

var express = require('express'),
    path = require('path'),
    twilio = require('twilio');

var app = express();



app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

//Twilio goodness
var config = {};

//prod/heroku
if (process.env.ACCOUNT_SID) {
    config.accountSid = process.env.ACCOUNT_SID;
    config.authToken = process.env.AUTH_TOKEN;
}

//local dev
else {
    config = require('./config');
}


app.get('/', function(req, res) {
       var resp = new twilio.TwimlResponse();
       console.log('hit1')
             resp.say('Enter a number and then press *')
                .gather({
                    action:'/fizzbuzz1',
                            finishOnKey:'*',
                            method:"GET"
                });
                 res.set('Content-Type', 'text/xml');

                res.send(resp.toString());
});
app.get('/fizzbuzz1', function(req, res) {
        console.log('hit-fizbuzz')
       console.log("query", req.query)

       var resp = new twilio.TwimlResponse();
        var output = []
        var number = parseInt(req.query.Digits)
        output.push(fizzBuzzLoop(number));

             resp.say(output.join(' '));
                res.set('Content-Type', 'text/xml');
                res.send(resp.toString());
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


