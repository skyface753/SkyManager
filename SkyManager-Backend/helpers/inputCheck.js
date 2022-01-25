let inputCheck = {
    checkSpaces: function (input) {     // For Login
        input = trimText(input);
        if(!input){
            return false;
        }
        if (/\s/.test(input)) { // Check for Spaces inside the input
            return false;
        }else{
            return input;
        }
    },
    checkEmail: function (input) {
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (emailAdress.match(regexEmail)) {
            return true; 
        } else {
            return false; 
        }
    },
    trimInput: function (input) {
        input = trimText(input);
        if(!input){
            return false;
        }
        return input;
    }


}

function trimText(text) {
    text = text.trim();
    if (!text) {
        // is empty or whitespace
        return false;
    }else{
        return text;
    }
}

module.exports = inputCheck;