/* global YELP_API_KEY */

const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/'
const yelpUrlBusinessSearch = 'https://api.yelp.com/v3/businesses/search'
const yelpUrlBusinessDetail = 'https://api.yelp.com/v3/businesses/'
const searchResult = document.querySelector('#searchResult')
const loadMore = document.querySelector('#loadMore')
const inputTerm = document.querySelector('#input-term')
const inputLocation = document.querySelector('#input-location')
const btnSearch = document.querySelector('#btn-search')
const queryLimit = 10
let searchStats = initStats()

// let masonry = new window.Masonry(searchResult, {
//   // options
//   itemSelector: '.grid-item',
//   columnWidth: 350
// })

console.assert(searchResult, 'searchResult is missing!')
console.assert(inputTerm, 'inputTerm is missing...')
console.assert(inputLocation, 'inputLocation is missing...')
console.assert(btnSearch, 'btnSearch is missing...')
// console.log(inputTerm.value)
// console.log(inputLocation.value)

btnSearch.addEventListener('click', searchBusiness)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBbt9u-aIn5UtC0JTcUEAwz9xrxzkzkJOc',
  authDomain: 'digitalcrafts-ph-1566664527167.firebaseapp.com',
  databaseURL: 'https://digitalcrafts-ph-1566664527167.firebaseio.com',
  projectId: 'digitalcrafts-ph-1566664527167',
  storageBucket: 'digitalcrafts-ph-1566664527167.appspot.com',
  messagingSenderId: '433077063857',
  appId: '1:433077063857:web:0f9d8ef862b9d6a6'
}
// Initialize Firebase
window.firebase.initializeApp(firebaseConfig)

function initStats () {
  return {
    params: {
      term: null,
      limit: null,
      latitude: null,
      longitude: null,
      location: null
    },
    total: null,
    page: null,
    totalPages: null
  }
}

function addEventListenersToResults () {
  const baseNodes = searchResult.querySelectorAll('.grid-item .inner')
  baseNodes.forEach(function (node) {
    const img = node.querySelector('img')
    // const classFilter = node.querySelector('.filter')
    const classIcon = node.querySelector('.icons')
    const link2favorites = node.querySelector('.link2favorites')

    console.assert(link2favorites, 'link2favorites is missing')
    img.addEventListener('mouseenter', toggleDisplayIcons)
    classIcon.addEventListener('mouseleave', toggleDisplayIcons)
    link2favorites.addEventListener('click', handleClickAddToFavorite)
  })
}

function handleClickAddToFavorite (e) {
  const elem = e.target
  const baseElement = elem.closest('.grid-item')
  if (elem.classList.contains('added')) {
    elem.classList.remove('added')
    elem.classList.remove('fas')
    elem.classList.add('far')
  } else {
    elem.classList.add('added')
    elem.classList.remove('far')
    elem.classList.add('fas')
  }

  const restaurantId = baseElement.getAttribute('restaurant-id')
  console.log(restaurantId)

  fetchYelpAPI(yelpUrlBusinessDetail + restaurantId, {}, true)
    .then(checkResponseAndReturnJson)
    .then(function (json) {
      const db = window.firebase.database()
      const favorites = db.ref('/everyone/favorites')
      favorites.push(json)
    })
    .catch(err => {
      console.error(err.message)
    })
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
        location: null,
        offset: searchStats.page !== null ? searchStats.page * queryLimit : 0
      }
      if (inputLocation.value === '') {
        params.latitude = position.latitude
        params.longitude = position.longitude
      } else {
        params.location = inputLocation.value
      }
      console.log(searchStats.params)
      console.log(params)
      console.log(isEquivalentObject(searchStats.params, params))

      if (!isEquivalentObject(searchStats.params, params)) {
        searchResult.innerHTML = ''
        searchStats = initStats()
      }
      searchStats.params = params
      fetchYelpAPI(yelpUrlBusinessSearch, params, true)
        .then(checkResponseAndReturnJson)
        .then(handleAPIReponse)
        .then(completeAllImageLoading)
        .then(organaizeImages)
        // .then(moveToSearchResult)
        .catch(err => {
          console.error(err.message)
        })
    })
    .catch(err => {
      console.error(err.message)
    })
}

function organaizeImages (promiseArray) {
  console.log(promiseArray)
  Promise.allSettled(promiseArray)
    .then(function () {
      // console.log('loaded all items!')
      // const imgs = searchResult.querySelectorAll('.grid-item')
      // masonry.appended(imgs)
      // masonry.layout()
      const imgs = document.querySelectorAll(`img.page-${searchStats.page}`)
      imgs.forEach(function (img) {
        img.style.display = 'block'
      })
      const masonry = new window.Masonry(searchResult, {
        // options
        itemSelector: '.grid-item',
        columnWidth: 350,
        fitWidth: true,
        isInitLayout: false
      })
      masonry.on('layoutComplete', function () {
        moveToSearchResult()
      })
      masonry.layout()
    })
    .then(addEventListenersToResults)
    .then(addLoadMoreButton)
    .catch(function (err) {
      console.error(err.message)
    })
}

function addLoadMoreButton () {
  console.log(searchStats)
  if (searchStats.page < searchStats.totalPages) {
    if (!loadMore.hasChildNodes()) {
      const btnLoadMore = document.createElement('button')
      btnLoadMore.innerText = 'Load More Images!'
      btnLoadMore.classList.add('btn', 'btn-default')
      btnLoadMore.style.color = '#92AC86'
      btnLoadMore.style.backgroundColor = 'rgba(29, 45, 68, 1)'
      btnLoadMore.style.margin = '10px'
      btnLoadMore.style.width = '80%'
      loadMore.style.textAlign = 'center'
      loadMore.appendChild(btnLoadMore)
      btnLoadMore.addEventListener('click', function () {
        searchBusiness()
      })
    }
  } else {
    if (loadMore.hasChildNodes()) {
      console.log(loadMore)
      loadMore.innerHTML = ''
    }
  }
}

function completeAllImageLoading () {
  const imgs = document.querySelectorAll(`img.page-${searchStats.page}`)
  const promiseArray = []
  imgs.forEach(function (img) {
    img.style.display = 'none'
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
  console.log(params)
  const url = corsAnywhere
    ? corsAnywhereUrl + generateUrlWithParams(yelpUrl, params)
    : generateUrlWithParams(yelpUrl, params)
  // console.log(url)
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
  searchStats.page = searchStats.page === null ? 1 : searchStats.page + 1
  searchStats.total = json.total
  searchStats.totalPages = Math.floor(json.total / queryLimit)
  const imageUrls = json.businesses.map(function (business) {
    const nextPath = window.location.pathname.endsWith('.html')
      ? 'restinfo.html'
      : 'restinfo'
    const nextUrl = nextPath + '?id=' + business.id
    return `<div class="grid-item" restaurant-id="${business.id}">
              <div class="inner">
                <div class="filter"></div>
                <div class="icons">
                  <div class="icon link2details">
                    <a href="${nextUrl}" target="_blank"><i class="fas fa-info-circle fa-5x"></i></a>
                  </div>
                  <div class="icon link2favorites">
                    <i class="far fa-heart fa-5x"></i>
                  </div>
                </div>
                <img class="page-${searchStats.page}" src=${business.image_url}>
              </div>
            </div>`
  })
  const dummyElement = document.createElement('div')
  dummyElement.innerHTML = imageUrls.join('')

  while (dummyElement.firstChild) {
    searchResult.appendChild(dummyElement.firstChild)
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

function isEquivalentObject (obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false
  Object.keys(obj1).forEach(function (key) {
    if (obj1[key] !== obj2[key]) return false
  })
  return true
}

function moveToSearchResult () {
  const speed = 500
  const imgs = document.querySelectorAll(`img.page-${searchStats.page}`)
  if (imgs.length > 0) {
    const offsetTop =
      $(searchResult).offset().top +
      Number(imgs[0].closest('.grid-item').style.top.replace('px', ''))
    $('html, body').animate({ scrollTop: offsetTop }, speed, 'swing')
  }
}
