/**
 * Module dependencies.
 */

var makeCall = function(phonenumber){
    console.log("attempt to call" + phonenumber)
    client.makeCall({
        to: phonenumber,
        from: config.from,
        url: '/say'

    }, function(err, responseData) {

        //executed when the call has been initiated.
        console.log("error: " +err , " responseData: " +responseData); // outputs "+14506667788"

    });
};

///-----

require('./FizzBuzz.js');

var express = require('express'),
    path = require('path'),
    twilio = require('twilio');

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views')

app.set('port', (process.env.PORT || 3000))
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

var client = new twilio.RestClient('ACCOUNT_SID', 'AUTH_TOKEN')

app.get('/', function(req, res) {
     res.render('phase2/index',
  {  to: config.to }
  )
});

app.get('/submitPhase1', function(req, res) {
    var phonenumber = req.query.phonenumber;
     makeCall(phonenumber);
     res.render('phase2/submitPhase1',
  {  phonenumber: phonenumber }
  )
});

app.get('/say', function(req, res) {
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




