/**
 * Module dependencies.
 */

var makeCall = function(phonenumber){

    var phone = client.getPhoneNumber(config.from);
    phone.makeCall('phonenumber', null, function(call) {
        console.log('Making Call to '+ phonenumber);
        // 'call' is an OutgoingCall object. This object is an event emitter.
        // It emits two events: 'answered' and 'ended'
        call.on('answered', function(reqParams, res) {

            // reqParams is the body of the request Twilio makes on call pickup.
            // For instance, reqParams.CallSid, reqParams.CallStatus.
            // See: http://www.twilio.com/docs/api/2010-04-01/twiml/twilio_request
            // res is a Twiml.Response object. This object handles generating
            // a compliant Twiml response.

            console.log('Call answered');

            // We'll append a single Say object to the response:
            res.append(new Twiml.Say('Hello, there!'));

            // And now we'll send it.
            res.send();
        });

        call.on('ended', function(reqParams) {
            console.log('Call ended');
        });
    })};

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


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})




