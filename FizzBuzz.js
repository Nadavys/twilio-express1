module.exports = {
     processFizzBuzzLogic: function( num ){
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
    },

    fizzBuzzLoop: function(total){
        var retVal = []
        for (var i = 1; i <= total; i++) {
            retVal.push(this.processFizzBuzzLogic(i));
        }
        return retVal.join(' ')
    }
}
