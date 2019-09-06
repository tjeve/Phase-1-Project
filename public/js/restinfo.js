/* global google, marker */

$(document).ready(init)

// Google Map
function initMap (coordinates) {
  // console.log(coordinates)
  const mapContainer = document.getElementById('map')
  // console.log(mapContainer)
  // The map, centered at Restaurant
  const restaurantLocation = { lat: coordinates.latitude, lng: coordinates.longitude }
  var map = new google.maps.Map(
    mapContainer, {
      zoom: 15,
      center: { lat: coordinates.latitude, lng: coordinates.longitude }
    })
  // The marker, positioned at the Restaurant
  var marker = new google.maps.Marker({ position: restaurantLocation, map: map })
}

function renderRestaurantInfo (restinfo) {
  return `
  <div class="rest-name"><h3><a href="${restinfo.url}">${restinfo.name}</a></h3></div>
  <div class="rest-rating">${restinfo.rating} / 5</div>
  <div class="rest-number">${restinfo.phone}</div>
  <div class="rest-address">${restinfo.location.display_address.join(' ')}</div>
`
}

function init () {
  const db = window.firebase.database()
  const firebasePath = '/apikey'
  const apikeys = db.ref(firebasePath)
  apikeys.once('value', function (data) {
    const apiKeys = data.val()
    console.log(apiKeys)
     // Request for Yelp information
  const restaurantID = window.location.search
  $.ajax({
    url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${restaurantID.slice(4)}`, // swap out restaurant id for variable from Kazue
    headers: {
      Authorization: `Bearer ${apiKeys.yelp_api_key}`
    },
    method: 'GET',
    dataType: 'json',
    success: function (restInfo) {
      const restInfoContainer = document.getElementById('rest-info-container')
        restInfoContainer.innerHTML = renderRestaurantInfo(restInfo)
        initMap(restInfo.coordinates)
        }

      
      })

  })
}

var origin1 = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);
var origin2 = 'Greenwich, England';
var destinationA = 'Stockholm, Sweden';
var destinationA = `${location.city}, ${location.country}`;
var destinationB = new google.maps.LatLng(50.087692, 14.421150);

var service = new google.maps.DistanceMatrixService();
service.getDistanceMatrix(
  {
    origins: [origin1, origin2],
    destinations: [destinationA, destinationB],
    travelMode: 'DRIVING',
    transitOptions: TransitOptions,
    drivingOptions: DrivingOptions,
    unitSystem: UnitSystem,
    avoidHighways: Boolean,
    avoidTolls: Boolean,
  }, callback);

function callback(response, status) {
  // See Parsing the Results for
  // the basics of a callback function.
}
