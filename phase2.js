/**
 * Module dependencies.
 */

var makeCall = function(phonenumber){
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
};

app.get('/phase2', function(req, res) {
     res.render('phase2/index',
  {  to: config.to }
  )
});

app.get('/submitPhase2', function(req, res) {
    var phonenumber = req.query.phonenumber;
     makeCall(phonenumber);
     res.render('phase2/submit',
  {  phonenumber: phonenumber }
  )
});

app.get('/phase2InitFizzBizz', function(req, res) {
    res.set('Content-Type', 'text/xml');
    res.send(queryFizzBuzzDigits());
});





