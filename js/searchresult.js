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
  const imgs = document.querySelectorAll(`img.page-${searchStats.page}`)
  imgs.forEach(function (img) {
    const baseNode = img.closest('.inner')
    // const img = node.querySelector('img')
    const classIcon = baseNode.querySelector('.icons')
    const link2favorites = baseNode.querySelector('.link2favorites')
    console.assert(link2favorites, 'link2favorites is missing')
    img.addEventListener('mouseenter', toggleDisplayIcons)
    classIcon.addEventListener('mouseleave', toggleDisplayIcons)
    link2favorites.addEventListener('click', handleClickFavorite)
  })
  const db = window.firebase.database()
  const favorites = db.ref('/everyone/favorites')
  favorites.once('value', function (data) {
    if (data.exists()) {
      const favoritesData = data.val()
      const favoriteBusinessIds = Object.keys(favoritesData).map(function (key) {
        return favoritesData[key].id
      })
      imgs.forEach(function (img) {
        const baseNode = img.closest('.grid-item')
        const link2favorites = baseNode.querySelector('.link2favorites i')
        if (
          favoriteBusinessIds.includes(baseNode.getAttribute('restaurant-id'))
        ) {
          // console.log(baseNode.getAttribute('restaurant-id'))
          toggleFavoriteIcon(link2favorites)
        }
      })
    }
  })
}

function handleClickFavorite (e) {
  const elem = e.target
  const baseElement = elem.closest('.grid-item')
  // console.log(elem)
  toggleFavoriteIcon(elem)
  const restaurantId = baseElement.getAttribute('restaurant-id')
  // console.log(restaurantId)
  const db = window.firebase.database()
  const favorites = db.ref('/everyone/favorites')
  favorites.once('value', function (data) {
    if (data.exists()) {
      const favoritesData = data.val()
      const favoriteBusinessIds = {}
      Object.keys(favoritesData).map(function (key) {
        favoriteBusinessIds[favoritesData[key].id] = key
      })
      if (Object.keys(favoriteBusinessIds).includes(restaurantId)) {
        const deleteKey = favoriteBusinessIds[restaurantId]
        favorites.child(deleteKey).remove()
        // console.log(deleteKey)
      } else {
        fetchDetailedBusinessAndSave(restaurantId, favorites)
      }
    } else {
      fetchDetailedBusinessAndSave(restaurantId, favorites)
    }
  })
}

function fetchDetailedBusinessAndSave (restaurantId, firebaseRef) {
  fetchYelpAPI(yelpUrlBusinessDetail + restaurantId, {}, true)
    .then(checkResponseAndReturnJson)
    .then(function (json) {
      // console.log(json)
      firebaseRef.push(json)
    })
    .catch(err => {
      console.error(err.message)
    })
}

function toggleFavoriteIcon (elem) {
  if (elem.classList.contains('added')) {
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
      // console.log(searchStats.params, params)
      // console.log(isEquivalentObject(searchStats.params, params))
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
        .catch(err => {
          console.error(err.message)
        })
    })
    .catch(err => {
      console.error(err.message)
    })
}

function organaizeImages (promiseArray) {
  // console.log(promiseArray)
  Promise.all(promiseArray)
    .then(function () {
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
  // console.log(searchStats)
  if (searchStats.page < searchStats.totalPages) {
    if (!loadMore.hasChildNodes()) {
      const btnLoadMore = document.createElement('button')
      btnLoadMore.innerText = 'Still Hungry???'
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
      // console.log(loadMore)
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
  // console.log(params)
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
  // console.log(json.businesses)
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
  let result = true
  Object.keys(obj1).forEach(function (key) {
    // console.log(key, obj1[key] === obj2[key])
    if (key !== 'offset' && obj1[key] !== obj2[key]) {
      result = false
    }
  })
  return result
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
