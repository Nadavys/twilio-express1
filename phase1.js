/**
 * Module dependencies.
 */

var queryFizzBuzzDigits = function(){
    var resp = new twilio.TwimlResponse();
    resp.say('Enter a number and then press *')
        .gather({
            action:'/doFizzbuzz',
            finishOnKey:'*',
            method:"GET"
        });
    return resp.toString();
}

/*todo: add verification its twilio client*/
app.get('/phase1', function(req, res) {

    res.set('Content-Type', 'text/xml');
    res.send(queryFizzBuzzDigits());
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


