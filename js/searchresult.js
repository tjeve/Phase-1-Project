/* global YELP_API_KEY */

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

function addEventListenersToResults(){
  const baseNodes = searchResult.querySelectorAll('.grid-item .inner')
  baseNodes.forEach(function(node){
    const img = node.querySelector('img')
    const classFilter = node.querySelector('.filter')
    const classIcon = node.querySelector('.icons')
    const icons = node.querySelectorAll('.icon')
    console.assert(img, 'img is missing')
    img.addEventListener('mouseover', toggleIcons)
    classIcon.addEventListener('mouseout', toggleIcons)
  })
 
}

function openDetails (e) {
  e.preventDefault()
  e.stopPropagation()
  if(e.target.tagName.toLowerCase() === 'i'){
    //console.dir(e.target.parentNode.classList)
    const parent = e.target.parentNode
    if (parent.classList.contains('link2details')) {
      console.log(parent.getAttribute('restaurant-id'))
      const nextPath = (window.location.pathname.endsWith('.html')) ? 'restinfo.html' : 'restinfo'
      window.location.href = nextPath + '?id=' + parent.getAttribute('restaurant-id')
    }  
  }
}

function toggleIcons (e) {
  e.preventDefault()
  e.stopPropagation()
  console.log(e.target)
  if (
    e.target.tagName.toLowerCase() === 'img' || e.target.className === 'icons'
  ) {
    const baseNode = e.target.parentNode
    // console.log(baseNode)
    const classFilter = baseNode.querySelector('.filter')
    const classIcons = baseNode.querySelector('.icons')
    const icon = baseNode.querySelectorAll('.icon')
    // console.assert(baseNode, 'baseNode is missing')
    // console.assert(classFilter, 'classFilter is missing')
    // console.assert(classIcons, 'classIcons is missing')
    // console.assert(icon, 'icon is missing')
    // console.dir(baseNode)
    // console.log(e.type)
    if (e.type === 'mouseover' && e.target.tagName.toLowerCase() === 'img') {
      classFilter.style.display = 'block'
      classFilter.style['z-index'] = 1
      classIcons.style.display = 'flex'
      classIcons.style['z-index'] = 2

      icon.forEach(function (i) {
        i.style.display = 'block'
        i.style['z-index'] = 4
      })
    }
    // else if (e.type === 'mouseout' && e.target.className === 'icons') {
    //   classFilter.style.display = 'none'
    //   classIcons.style.display = 'none'
    //   icon.forEach(function (i) {
    //     i.style.display = 'none'
    //   })
    // }
  }
}

function searchBusiness () {
  getPositionFromIPData()
    .then(checkResponseAndReturnJson)
    .then(position => {
      // console.log(position)
      const params = {
        term: inputTerm.value,
        limit: 50
      }
      if (inputLocation.value === '') {
        params.latitude = position.latitude
        params.longitude = position.longitude
      } else {
        params.location = inputLocation.value
      }
      // console.log(params)
      fetchYelpAPI(yelpUrlBusinessSearch, params, true)
        .then(checkResponseAndReturnJson)
        .then(handleAPIReponse)
        .then(completeAllImageLoading)
        .then(function (promiseArray) {
          // console.log(promiseArray)
          Promise.allSettled(promiseArray)
            .then(masonry)
            .then(addEventListenersToResults)
            .catch(function (err) {
              console.error(err.message)
            })
        })
    })
    .catch(err => {
      console.error(err.message)
    })
}

function completeAllImageLoading () {
  const imgs = document.querySelectorAll('img')
  const promiseArray = []
  imgs.forEach(function (img) {
    const promise = new Promise(function (resolve, reject) {
      img.addEventListener('load', function () {
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
  return window.fetch(url, {
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
  const imageUrls = json.businesses.map(function (business) {
    return `<div class="grid-item">
              <div class="inner">
                <div class="filter"></div>
                <div class="icons">
                  <div restaurant-id="${business.id}" class="icon link2details">
                    <i class="fas fa-link fa-3x"></i>
                  </div>
                  <div class="icon link2favorites">
                    <i class="far fa-heart fa-3x"></i>
                  </div>
                </div>
                <img src=${business.image_url}>
              </div>
            </div>`
  })
  searchResult.innerHTML = imageUrls.join('')
  console.log(json.businesses)
}

// function getPosition (options) {
//   return new Promise(function (resolve, reject) {
//     navigator.geolocation.getCurrentPosition(resolve, reject, options)
//   })
// }

function getPositionFromIPData () {
  return window.fetch(
    'https://api.ipdata.co?api-key=1bf5329a7500c813f5c947083b124f22dbdd34a04647000ced91d64c'
  )
}

function generateUrlWithParams (baseUrl, params) {
  const ret = []
  for (const d in params) {
    if (params[d] !== null && params[d] !== undefined) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]))
    }
  }
  return baseUrl + '?' + ret.join('&')
}

function masonry () {
  const msnryArea = document.querySelector('.grid')
  return new window.Masonry(msnryArea, {
    // options
    itemSelector: '.grid-item',
    columnWidth: 350
  })
}
