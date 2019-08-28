$(document).ready(init)

function init () {
  // var yelpPromise = $.get('https://api.yelp.com/v3/businesses/hNNkC569C1yVpJLDasJ4yA')
  //   .then(function () {
  //     console.log('you now have the yelp data!')
  //   })
  
  function renderRestaurantInfo (restinfo) {
    return `<div class="rest-info-container">
    <div class="rest-info">
        <div class="rest-name">${restinfo.name}</div>
        <div class="rest-number">Restaurant Phone number goes here</div>
        <div class="rest-website">Restaurant Website goes here</div>
        <div class="rest-address">Restaurant address goes here</div>
        <div class="rest-distance-from-user">Restaurant distance from user goes here</div>
    </div>
    <div class="rest-map-container">
        <div>Google Map goes here</div>
        <div>Get directions goes here</div>
    </div>
  </div>`
  }
  
  const GOOGLE_API_KEY = 'AIzaSyBKpVPcTeEAp1nDw7UigighCQJvjO62mq8'
  const YELP_API_KEY = 'C-sgeaqD6bJ8p85VOY5iFKlakVsPJEtPg-BsWiFQA_v1sejEWgzEoFO3wE5RZq4bghLIMFbkCtQ8AA2ChnXzD6ZXW2NRrs8YCbQhQnngkR4sE46mBuhoYUVMNmRhXXYx'
  const YELP_API_CLIENT_ID = 'C8BQYgLbpRyf9ENtVAujLQ'

  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/hNNkC569C1yVpJLDasJ4yA', //swap out restaurant id for variable from Kazue
    headers: {
      'Authorization': `Bearer ${YELP_API_KEY}`,
    },
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      console.log('success: ' + data)
    }
  })
}
