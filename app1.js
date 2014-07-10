/**
 * Module dependencies.
 */


require('./fizzBuzz.js');

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
             resp.say('Enter a number and then press *')
                .gather({
                    action:'/doFizzbuzz',
                            finishOnKey:'*',
                            method:"GET"
                });
                 res.set('Content-Type', 'text/xml');

                res.send(resp.toString());
});
app.get('/doFizzbuzz', function(req, res) {

       console.log("query", req.query)

       var resp = new twilio.TwimlResponse();
        var output = []
        var number = parseInt(req.query.Digits)
        output.push(FizzBuzz.fizzBuzzLoop(number));

             resp.say(output.join(' '));
                res.set('Content-Type', 'text/xml');
                res.send(resp.toString());
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


