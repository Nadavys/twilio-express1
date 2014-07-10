/**
 * Module dependencies.
 */

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

var client = new twilio.RestClient(config.accountSid, config.authToken)

require('./phase1');
require('./phase2');

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})




