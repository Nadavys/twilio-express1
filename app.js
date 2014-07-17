/**
 * Module dependencies.
 */

var FizzBuzz = require('./FizzBuzz.js');

console.log(FizzBuzz)
var express = require('express'),
    path = require('path'),
    twilio = require('twilio');

var app = express();
var Q = require("q");

app.set('view engine', 'jade');
app.set('views', __dirname + '/views')

app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname + '/public'))


var MongoClient = require('mongodb').MongoClient;


var TwillioLog = {
    collection: function(){
        var deferred = Q.defer();
        MongoClient.connect("mongodb://localhost:27017/twilioLogDb", function(err, db) {
            if(!err) {
                console.log("We are connected");
            }else{
                console.log("mongodb connection error", err)
            }
            db.collection('twilio', function(err, collection) {});
            var collection = db.collection('log');
            deferred.resolve(collection);
        });
        return deferred.promise;
    },
    create: function(newEntry){
        var deferred = Q.defer();
        this.collection().then(function(collection){
            collection.insert(newEntry, function(err,row){
                deferred.resolve(row._id);
            })
        });
        return deferred.promise;
    },
    list: function(){
        var deferred = Q.defer();

        this.collection().then(function(collection){
            collection.find().toArray(function(err, items) {
                deferred.resolve(items);
            })
        })
        return deferred.promise;
    },
    update: function(id, number){

        this.collection().then(function(collection){
            collection.update( { id: id },
                { $set: {
                    number: number
                }
                }
            )
        })
    },
    destroy: function(){
        this.collection().then(function(collection){
            collection.remove(function(){})
            })
    }
//
}


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
////


var phase3 = {
    phase3: function(req, res) {
        res.render('phase3/index',
            {  to: config.to }
        )
    },
    submitPhase3: function(req, res) {
        var phonenumber = req.query.phonenumber;
        var delay = req.query.delay;
        var delayMillisecond = parseInt(delay) * 1000

        setTimeout(function(){phase2.makeCall(phonenumber)}, delayMillisecond);

        res.render('phase3/submit',
            {  phonenumber: phonenumber, delay:  req.query.delay}
        )
    }
};////
var phase4 = {
    phase4: function(req, res) {
//        TwillioLog.collection().then(function(){
//            console.log('responseData : %j', arguments );
//        })
//
//        var newEntry = {'phonenumber':'qwerty', delay: 9999191919};
//        TwillioLog.create(newEntry)
        TwillioLog.list().then(function(twilioLog){
//                console.log(twilioLog)
            res.render('phase4/index',
                {  to: config.to, twilioLog: twilioLog });
        });
    },
    submitPhase4: function(req, res) {
        var phonenumber = req.query.phonenumber;
        var delay = req.query.delay;
        //create db row, missing insert id, append that later
        TwillioLog.create({phonenumber: phonenumber, delay: delay}).then(function(row){
            var delayMillisecond = parseInt(delay) * 1000;
            setTimeout(function(){phase4.makeCall(row)}, delayMillisecond);
        });
        res.render('phase4/submit',
            {  phonenumber: phonenumber, delay:  req.query.delay}
        )
    },
    phase4InitFizzBizz: function(req, res) {
        var id = req.query.id
        res.set('Content-Type', 'text/xml');
        res.send(phase4.queryFizzBuzzDigits(id));
    },
    makeCall: function(row){
        client.makeCall({
            to: row.phonenumber,
            from: config.from,
            url: config.url+'/phase4InitFizzBizz?id='+row._id

        }, function(err, responseData) {

            //executed when the call has been initiated.
            console.log('err : %j', err);
            console.log('responseData : %j', responseData);
        });
    },
    doFizzbuzz: function(req, res) {

        var resp = new twilio.TwimlResponse();
        var output = []
        var number = parseInt(req.query.Digits)
        TwillioLog.update(id, number)

        output.push(FizzBuzz.fizzBuzzLoop(number));

        resp.say(output.join(' '));
        res.set('Content-Type', 'text/xml');
        res.send(resp.toString());
    },
    queryFizzBuzzDigits:  function(id){
        var resp = new twilio.TwimlResponse();
        resp.say('Enter a number and then press *')
            .gather({
                action:'/doFizzbuzz4?id='+id,
                finishOnKey:'*',
                method:"GET"
            });
        return resp.toString();
    },
    phase4Destroy: function(){
        TwillioLog.destroy()
    }
};


/////
//phase1
app.get('/phase1', phase1.phase1)
app.get('/doFizzbuzz', phase1.doFizzbuzz)


//phase2
app.get('/phase2', phase2.phase2)
app.get('/submitPhase2', phase2.submitPhase2)
app.post('/phase2InitFizzBizz',phase2.phase2InitFizzBizz)

//phase3
app.get('/phase3', phase3.phase3)
app.get('/submitPhase3', phase3.submitPhase3)

//phase4
app.get('/phase4', phase4.phase4)
app.post('/phase4InitFizzBizz',phase4.phase4InitFizzBizz)
app.get('/submitPhase4', phase4.submitPhase4)
app.get('/phase4Destroy', phase4.phase4Destroy)

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
})




