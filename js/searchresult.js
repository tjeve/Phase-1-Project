/* global YELP_API_KEY */

const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/'
const yelpUrlBusinessSearch = 'https://api.yelp.com/v3/businesses/search'
const searchResult = document.querySelector('#searchResult')
const loadMore = document.querySelector('#loadMore')
const inputTerm = document.querySelector('#input-term')
const inputLocation = document.querySelector('#input-location')
const btnSearch = document.querySelector('#btn-search')
const queryLimit = 50
let searchStats = {
  'params': {
    term: null,
    limit: null,
    latitude: null,
    longitude: null,
    location: null
  },
  'total': null,
  'page': null,
  'totalPages': null
}

console.assert(searchResult, 'searchResult is missing!')
console.assert(inputTerm, 'inputTerm is missing...')
console.assert(inputLocation, 'inputLocation is missing...')
console.assert(btnSearch, 'btnSearch is missing...')
//console.log(inputTerm.value)
//console.log(inputLocation.value)

btnSearch.addEventListener('click', searchBusiness)

function addEventListenersToResults () {
  const baseNodes = searchResult.querySelectorAll('.grid-item .inner')
  baseNodes.forEach(function (node) {
    const img = node.querySelector('img')
    const classFilter = node.querySelector('.filter')
    const classIcon = node.querySelector('.icons')
    const link2favorites = node.querySelector('.link2favorites')

    console.assert(link2favorites, 'link2favorites is missing')
    img.addEventListener('mouseenter', toggleDisplayIcons)
    classIcon.addEventListener('mouseleave', toggleDisplayIcons)
    link2favorites.addEventListener('click', handleClickAddToFavorite)
  })
}

function handleClickAddToFavorite(e){
  const elem = e.target
  if (elem.classList.contains('added')){
    elem.classList.remove('added')
    elem.classList.remove('fas')
    elem.classList.add('far')
  } else {
    elem.classList.add('added')
    elem.classList.remove('far')
    elem.classList.add('fas')
  }

}


function toggleDisplayIcons (e) {
  e.preventDefault()
  e.stopPropagation()
  if (
    e.target.tagName.toLowerCase() === 'img' ||
    e.target.className === 'icons'
  ) {
    const baseNode = e.target.parentNode
    const classFilter = baseNode.querySelector('.filter')
    const classIcons = baseNode.querySelector('.icons')
    const icon = baseNode.querySelectorAll('.icon')

    if (e.type === 'mouseenter' && e.target.tagName.toLowerCase() === 'img') {
      classFilter.style.display = 'block'
      classFilter.style['z-index'] = 1
      classIcons.style.display = 'flex'
      classIcons.style['z-index'] = 2
      icon.forEach(function (i) {
        i.style.display = 'block'
        i.style['z-index'] = 3
      })
    } else if (e.type === 'mouseleave' && e.target.className === 'icons') {
      classFilter.style.display = 'none'
      classIcons.style.display = 'none'
      icon.forEach(function (i) {
        i.style.display = 'none'
      })
    }
  }
}

function searchBusiness () {
  getPositionFromIPData()
    .then(checkResponseAndReturnJson)
    .then(position => {
      // console.log(position)
      const params = {
        term: inputTerm.value,
        limit: queryLimit,
        latitude: null,
        longitude: null,
        location: null
      }
      if (inputLocation.value === '') {
        params.latitude = position.latitude
        params.longitude = position.longitude
      } else {
        params.location = inputLocation.value
      }
      searchStats.params = params
      fetchYelpAPI(yelpUrlBusinessSearch, params, true)
        .then(checkResponseAndReturnJson)
        .then(handleAPIReponse)
        .then(completeAllImageLoading)
        .then(function (promiseArray) {
          // console.log(promiseArray)
          Promise.allSettled(promiseArray)
            .then(masonry)
            .then(addEventListenersToResults)
            .then(addLoadMoreButton)
            .catch(function (err) {
              console.error(err.message)
            })
        })
    })
    .catch(err => {
      console.error(err.message)
    })
}

function addLoadMoreButton(){
  const btnLoadMore = document.createElement('button')
  btnLoadMore.innerText = 'Load More Images!'
  if (searchStats.page < searchStats.totalPages) {
    loadMore.appendChild(btnLoadMore)
  } else {
    loadMore.removeChild()
  }
  btnLoadMore.addEventListener('click', loadMoreImages)
}

function loadMoreImages(e){

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
  //console.log(url)
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
  searchStats.total = json.total
  searchStats.page = 1
  searchStats.totalPages = Math.floor(json.total / queryLimit)
  console.log(searchStats)
  const imageUrls = json.businesses.map(function (business) {
    const nextPath = window.location.pathname.endsWith('.html') ? 'restinfo.html': 'restinfo'
    const nextUrl = nextPath + '?id=' + business.id
    return `<div class="grid-item">
              <div class="inner">
                <div class="filter"></div>
                <div class="icons">
                  <div restaurant-id="${business.id}" class="icon link2details">
                    <a href="${nextUrl}" target="_blank"><i class="fas fa-info-circle fa-5x"></i></a>
                  </div>
                  <div class="icon link2favorites">
                    <i class="far fa-heart fa-5x"></i>
                  </div>
                </div>
                <img src=${business.image_url}>
              </div>
            </div>`
  })
  let dummyElement = document.createElement('div')
  dummyElement.innerHTML = imageUrls.join('')

  while(dummyElement.firstChild) {
      searchResult.appendChild(dummyElement.firstChild);
  }
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
