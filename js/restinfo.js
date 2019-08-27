$(document).ready(init)

function init () {

    var yelpPromise = jQuery.get("https://api.yelp.com/v3/businesses/C8BQYgLbpRyf9ENtVAujLQ")
    .then(function() {
        console.log("you now have the yelp data!")
    })
}

//Questions:
// Why is $.get() not a function?
// Why is VSCODE spazzing and marking errors for all of my js. My guess is it has something to do with package.json?