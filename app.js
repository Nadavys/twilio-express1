/**
 * Module dependencies.
 */

var FizzBuzz = require('./FizzBuzz.js');

console.log(FizzBuzz)
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

var phase1 = {
    phase1: function(req, res) {

        res.set('Content-Type', 'text/xml');
        res.send(phase1.queryFizzBuzzDigits());
    },
    doFizzbuzz: function(req, res) {
        console.log("query", req.query)

        var resp = new twilio.TwimlResponse();
        var output = []
        var number = parseInt(req.query.Digits)
        output.push(FizzBuzz.fizzBuzzLoop(number));

        resp.say(output.join(' '));
        res.set('Content-Type', 'text/xml');
        res.send(resp.toString());
    },
    queryFizzBuzzDigits:  function(){
        var resp = new twilio.TwimlResponse();
        resp.say('Enter a number and then press *')
            .gather({
                action:'/doFizzbuzz',
                finishOnKey:'*',
                method:"GET"
            });
        return resp.toString();
    }};
/////////
var phase2 = {
        phase2: function(req, res) {
        res.render('phase2/index',
            {  to: config.to }
        )
    },
    submitPhase2: function(req, res) {
        var phonenumber = req.query.phonenumber;
        phase2.makeCall(phonenumber);
        res.render('phase2/submit',
            {  phonenumber: phonenumber }
        )
    },
    phase2InitFizzBizz: function(req, res) {
        res.set('Content-Type', 'text/xml');
        res.send(phase1.queryFizzBuzzDigits());
    },
    makeCall: function(phonenumber){
        console.log("attempt to call" + phonenumber)
        client.makeCall({
            to: phonenumber,
            from: config.from,
            url: config.url+'/phase2InitFizzBizz'

        }, function(err, responseData) {

            //executed when the call has been initiated.
            console.log('err : %j', err);
            console.log('responseData : %j', responseData);
        });
    }
};
/////
//phase1
app.get('/phase1', phase1.phase1)
app.get('/doFizzbuzz', phase1.doFizzbuzz)


//phase2
app.get('/phase2', phase2.phase2)
app.get('/submitPhase2', phase2.submitPhase2)
app.get('/phase2InitFizzBizz',phase2.phase2InitFizzBizz)


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})




