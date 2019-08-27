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

  getPositionFromIPData()
  .then(checkResponseAndReturnJson)
  .then(position => {
    console.log(position)
    let params = {
      term: inputTerm.value,
      limit: 50
    }
    if(inputLocation.value === ''){
      params.latitude = position.latitude
      params.longitude = position.longitude
    }else{
      params.location = inputLocation.value
    }
    console.log(params)
    fetchYelpAPI(yelpUrlBusinessSearch, params, true)
    .then(checkResponseAndReturnJson)
    .then(handleAPIReponse)
    .then(completeAllImageLoading)
    .then(function(promiseArray){
      console.log(promiseArray)
      Promise.allSettled(promiseArray)
      .then(masonry)
      .catch(function(err){
        console.error(err.message)
      })
    })
  })
  .catch(err => {
    console.error(err.message)
  })
}

function completeAllImageLoading(){
  const imgs = document.querySelectorAll('img')
  let promiseArray = []
  imgs.forEach(function(img){
    const promise =  new Promise(function(resolve, reject){
      img.addEventListener('load', function(){
        resolve()
      })
    })
    promiseArray.push(promise)
  })
  return promiseArray
}

function fetchYelpAPI (yelpUrl, params, corsAnywhere) {
  const url = corsAnywhere
    ? corsAnywhereUrl + generateUrlWithParams(yelpUrl, params)
    : generateUrlWithParams(yelpUrl, params)
    console.log(url)
  return fetch(url, {
    headers: {
      Authorization: 'Bearer ' + YELP_API_KEY
    }
  })
}

function checkResponseAndReturnJson (res) {
  if (res.status === 200) {
    return res.json()
  } else {
    console.error(res)
    throw new Error('Response is not 200')
  }
}

function handleAPIReponse (json) {
  const image_urls = json.businesses.map(function (business) {
    return `<div class="grid-item"><img src=${business.image_url}></div>`
  })
  searchResult.innerHTML = image_urls.join('')
  console.log(json.businesses)
}

function getPosition (options) {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function getPositionFromIPData(){
  return fetch('https://api.ipdata.co?api-key=1bf5329a7500c813f5c947083b124f22dbdd34a04647000ced91d64c')
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

function masonry(){
  const msnryArea = document.querySelector('.grid');
  const msnry = new Masonry( msnryArea, {
    // options
    itemSelector: '.grid-item',
    columnWidth: 350
  });
  
}
