const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/'
const yelpUrlBusinessSearch = 'https://api.yelp.com/v3/businesses/search'
const searchResult = document.querySelector('#searchResult')
const inputTerm = document.querySelector('#input-term')
const inputLocation = document.querySelector('#input-location')
const btnSearch = document.querySelector('#btn-search')

console.assert(searchResult, 'searchResult is missing!')
console.assert(inputTerm, 'inputTerm is missing...')
console.assert(inputLocation, 'inputLocation is missing...')
console.assert(btnSearch, 'btnSearch is missing...')
console.log(inputTerm.value)
console.log(inputLocation.value)

btnSearch.addEventListener('click', searchBusiness)

function searchBusiness(){
  getPosition()
  .then(position => {
    console.log(position)
    let params = {
      term: inputTerm.value,
      limit: 50
    }
    if(inputLocation.value === ''){
      params.latitude = position.coords.latitude
      params.longitude = position.coords.longitude
    }else{
      params.location = inputLocation.value
    }
    console.log(params)
    fetchYelpAPI(yelpUrlBusinessSearch, params, true)
    .then(checkYelpAPIResponse)
    .then(handleAPIReponse)
  })
  .catch(err => {
    console.error(err.message)
  })
}


function fetchYelpAPI (yelpUrl, params, corsAnywhere) {
  const url = corsAnywhere
    ? corsAnywhereUrl + generateUrlWithParams(yelpUrl, params)
    : generateUrlWithParams(yelpUrl, params)
  return fetch(url, {
    headers: {
      Authorization: 'Bearer ' + YELP_API_KEY
    }
  })
}

function checkYelpAPIResponse (res) {
  if (res.status === 200) {
    return res.json()
  } else {
    console.error(res)
    throw new Error('Response is not 200')
  }
}

function handleAPIReponse (json) {
  const image_urls = json.businesses.map(function (business) {
    return `<img src=${business.image_url} width="300px">`
  })
  searchResult.innerHTML = image_urls.join('')
  console.log(json.businesses)
}

function getPosition (options) {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function generateUrlWithParams (baseUrl, params) {
  const ret = []
  for (let d in params) {
    if (params[d] !== null && params[d] !== undefined) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]))
    }
  }
  return baseUrl + '?' + ret.join('&')
}
