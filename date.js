// Here module.exports is a keyword ans we are sending getDate Fucntion
module.exports = getDate ;

function getDate() {
    let today = new Date();
    let options = {
        weekday : "long",
        day : "numeric",
        month : "long",
        //year : "numeric"
    };
    let day = today.toLocaleDateString("en-US" , options)
    return day 
}