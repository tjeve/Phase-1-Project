$(document).ready(init)

function init () {
  function renderRestaurantInfo (restinfo) {
    return `<div class="rest-info">
    <div class="rest-name"><a href="${restinfo.url}">${restinfo.name}</a></div>
    <div class="rest-rating">${restinfo.rating}/5</div>
    <div class="rest-price">${restinfo.price}</div>
    <div class="rest-number">${restinfo.phone}</div>
    <div class="rest-address">${restinfo.location.display_address.join(' ')}</div>
    <div class="rest-distance-from-user">Restaurant distance from user goes here</div>
</div>
<div class="rest-map-container">
    <div>Google Map goes here</div>
    <div>Get directions goes here</div>
</div>`
  }
  // Request for Yelp information
  const YELP_API_KEY = 'C-sgeaqD6bJ8p85VOY5iFKlakVsPJEtPg-BsWiFQA_v1sejEWgzEoFO3wE5RZq4bghLIMFbkCtQ8AA2ChnXzD6ZXW2NRrs8YCbQhQnngkR4sE46mBuhoYUVMNmRhXXYx'
  const clickedrestID = window.location.search
  console.log(clickedrestID.slice(4))
  $.ajax({
    url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${clickedrestID.slice(4)}`, // swap out restaurant id for variable from Kazue
    headers: {
      Authorization: `Bearer ${YELP_API_KEY}`
    },
    method: 'GET',
    dataType: 'json',
    success: function (restInfo) {
      const restInfoContainer = document.getElementById('rest-info-container')
      restInfoContainer.innerHTML = renderRestaurantInfo(restInfo)
      console.log(restInfo.coordinates)
      // mapAPI()
      const restMapContainer= document.getElementById('rest-map-container')
      restMapContainer.innerHTML= initMap(restInfo)
    }
  })

//   function mapAPI() { // if initMap doesn't work, try this method and see if it does.
//     $.ajax({
//       url: `https://www.google.com/maps/embed/v1/MODE?key=${GOOGLE_API_KEY}&parameters`
//       success: console.log("OMG, IT WORKED!")
//     })
//   }
// }
  // Google Maps
  function initMap (restInfo) {
    // The location of Restaurant
    var coordinates = restInfo.coordinates
    // The map, centered at Restaurant
    var map = new google.maps.Map(
      document.getElementById('map'), { zoom: 4, center: coordinates })
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({ position: coordinates, map: map })
  }
  // Request for Google Map
  // const GOOGLE_API_KEY = 'AIzaSyBKpVPcTeEAp1nDw7UigighCQJvjO62mq8'
  
  // let mapPromise = $.get(`https://www.google.com/maps/embed/v1/MODE?key=${GOOGLE_API_KEY}&parameters`)
  //   .then(function () {
  //     console.log('Hello')
  //   })

  //Place the code below into the google map api request
  // const restMapContainer= document.getElementById('rest-map-container')
  // restMapContainer.innerHTML=  


// let map = new google.maps.Map(document.getElementById('map'), {
//   center: {lat: -34.397, lng: 150.644},
//   zoom: 8
// });

// const directionsRequest = {
//   origin: LatLng | String | google.maps.Place,
//   destination: LatLng | String | google.maps.Place,
//   travelMode: TravelMode,
//   transitOptions: TransitOptions,
//   drivingOptions: DrivingOptions,
//   unitSystem: UnitSystem,
//   waypoints[]: DirectionsWaypoint,
//   optimizeWaypoints: Boolean,
//   provideRouteAlternatives: Boolean,
//   avoidFerries: Boolean,
//   avoidHighways: Boolean,
//   avoidTolls: Boolean,
//   region: String
// }