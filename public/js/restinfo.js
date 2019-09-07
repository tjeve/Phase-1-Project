/* global google */

$(document).ready(init)

// Google Map
function initMap (coordinates) {
  // console.log(coordinates)
  const mapContainer = document.getElementById('map')
  // console.log(mapContainer)
  // The map, centered at Restaurant
  const restaurantLocation = {
    lat: coordinates.latitude,
    lng: coordinates.longitude
  }
  var map = new google.maps.Map(mapContainer, {
    zoom: 15,
    center: { lat: coordinates.latitude, lng: coordinates.longitude }
  })
  // The marker, positioned at the Restaurant
  return new google.maps.Marker({ position: restaurantLocation, map: map })
}
function fixPhoneNum (phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    var intlCode = (match[1] ? '+1 ' : '')
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return null
}
const fontAwesomeStar = '<i class="fas fa-star"></i>'

function renderRestaurantInfo (restinfo) {
  console.log()
  return `
  <div class="rest-name"><h1><a class='rest-name' href="${restinfo.url}">${restinfo.name}</a></h1></div>
  <div class="rest-rating">${fontAwesomeStar.repeat(restinfo.rating)}</div>
  <div class="rest-phone"><a class='link-color' href="tel:${restinfo.phone}">${fixPhoneNum(restinfo.phone)}</a></div>
  <div class="rest-address"><a class='link-color' href=https://www.google.com/maps/@${restinfo.coordinates.latitude},${restinfo.coordinates.longitude}>${restinfo.location.display_address.join(', ')}</a></div>
`
}
function init () {
  const db = window.firebase.database()
  const firebasePath = '/apikey'
  const apikeys = db.ref(firebasePath)
  apikeys.once('value', function (data) {
    const apiKeys = data.val()
    // Request for Yelp information
    const restaurantID = window.location.search
    $.ajax({
      url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${restaurantID.slice(
        4
      )}`, // swap out restaurant id for variable from Kazue
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

  //   function mapAPI() { // if initMap doesn't work, try this method and see if it does.
  //     $.ajax({
  //       url: `https://www.google.com/maps/embed/v1/MODE?key=${GOOGLE_API_KEY}&parameters`
  //       success: console.log("OMG, IT WORKED!")
  //     })
  //   }
  // }
  // Google Maps
}

// const restMapContainer = document.getElementById('map')
// restMapContainer.innerHTML = initMap()

// function initMap (coordinates) {
//   // The map, centered at Restaurant
//   var map = new google.maps.Map(
//     document.getElementById('map'), { zoom: 4, center: coordinates })
//   // The marker, positioned at Uluru
//   var marker = new google.maps.Marker({ position: coordinates, map: map })
// }

// function initMap() {
//   // The location of Uluru
//   var uluru = { lat: -25.344, lng: 131.036 }
//   // The map, centered at Uluru
//   var map = new google.maps.Map(
//     document.getElementById('map'), { zoom: 4, center: uluru })
//   // The marker, positioned at Uluru
//   var marker = new google.maps.Marker({ position: uluru, map: map })
// }

// function initMap (coordinates) {
//   console.log(coordinates)
//   // The map, centered at Restaurant
//   var map = new google.maps.Map(
//     document.getElementById('map'), { zoom: 4, center: coordinates })
//   // The marker, positioned at Uluru
//   var marker = new google.maps.Marker({ position: coordinates, map: map })
// }
// initMap(yelpPromise.coordinates)

// Request for Google Map
// const GOOGLE_API_KEY = 'AIzaSyBKpVPcTeEAp1nDw7UigighCQJvjO62mq8'

// let mapPromise = $.get(`https://www.google.com/maps/embed/v1/MODE?key=${GOOGLE_API_KEY}&parameters`)
//   .then(function () {
//     console.log('Hello')
//   })

// Place the code below into the google map api request
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
