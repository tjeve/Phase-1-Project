$(document).ready(init)

function init () {

    var yelpPromise = $.get("https://api.yelp.com/v3/businesses/C8BQYgLbpRyf9ENtVAujLQ")
    .then(function() {
        console.log("you now have the yelp data!")
    })
}