let map = null
function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 15
  })
}

$(document).ready(init)

function init () {
  // var yelpPromise = $.get('https://api.yelp.com/v3/businesses/hNNkC569C1yVpJLDasJ4yA')
  //   .then(function () {
  //     console.log('you now have the yelp data!')
  //   })
  function renderRestaurantInfo (restinfo) {
    return `<div class="rest-info">
    <div class="rest-name"><a href="${restinfo.url}">${restinfo.name}</a></div>
    <div class="rest-number">${restinfo.phone}</div>
    <div class="rest-address">${restinfo.location.display_address.join(
    ' '
  )}</div>
    <div class="rest-distance-from-user">Restaurant distance from user goes here</div>
    </div>
    <div class="rest-map-container">
        <div>Google Map goes here</div>
        <div>Get directions goes here</div>
    </div>`
  }
  // Request for Yelp information
  const YELP_API_KEY =
    'C-sgeaqD6bJ8p85VOY5iFKlakVsPJEtPg-BsWiFQA_v1sejEWgzEoFO3wE5RZq4bghLIMFbkCtQ8AA2ChnXzD6ZXW2NRrs8YCbQhQnngkR4sE46mBuhoYUVMNmRhXXYx'
  const clickedrestID = window.location.search
  console.log(clickedrestID.slice(4))
  $.ajax({
    url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${clickedrestID.slice(
      4
    )}`, // swap out restaurant id for variable from Kazue
    headers: {
      Authorization: `Bearer ${YELP_API_KEY}`
    },
    method: 'GET',
    dataType: 'json',
    success: function (restInfo) {
      const restInfoContainer = document.getElementById('rest-info-container')
      restInfoContainer.innerHTML = renderRestaurantInfo(restInfo)
      console.log(restInfo)
      map.setCenter(
        new google.maps.LatLng(
          restInfo.coordinates.latitude,
          restInfo.coordinates.longitude
        )
      )
    }
  })
}
