$(document).ready(init)

function init () {

    var yelpPromise = $.get("https://api.yelp.com/v3/businesses/{id}")
    .then(function() {
        console.log("you now have the yelp data!")
    })

}

//Questions:
// Why is $.get() not a function?
// Why is VSCODE spazzing and marking errors for all of my js. My guess is it has something to do with package.json?