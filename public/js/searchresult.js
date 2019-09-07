const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/'
const yelpUrlBusinessSearch = 'https://api.yelp.com/v3/businesses/search'
const yelpUrlBusinessDetail = 'https://api.yelp.com/v3/businesses/'
const searchResult = document.querySelector('#searchResult')
const loadMore = document.querySelector('#loadMore')
const inputTerm = document.querySelector('#input-term')
const inputLocation = document.querySelector('#input-location')
const btnSearch = document.querySelector('#btn-search')
const messageBox = document.querySelector('#messageBox')

const queryLimit = 10
let searchStats = initStats()
let loginUser = null
let apiKeys = null

window.firebase.auth().onAuthStateChanged(function (user) {
  loginUser = user
})

getAPIKeys()

btnSearch.addEventListener('click', searchBusiness)
inputTerm.addEventListener('keypress', function (e) {
  if (e.which === 13) {
    searchBusiness()
  }
})
inputLocation.addEventListener('keypress', function (e) {
  if (e.which === 13) {
    searchBusiness()
  }
})

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

  getFavorites(function (data) {
    if (data.exists()) {
      const favoritesData = data.val()
      // console.log(favoritesData)
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

function getAPIKeys () {
  const db = window.firebase.database()
  const firebasePath = '/apikey'
  const apikeys = db.ref(firebasePath)
  apikeys.once('value', function (data) {
    apiKeys = data.val()
    // console.log(apiKeys)
  })
}

function getFavorites (callback) {
  const db = window.firebase.database()
  const firebasePath = loginUser
    ? `/users/${loginUser.uid}/favorites`
    : '/everyone/favorites'
  // console.log(firebasePath)
  const favorites = db.ref(firebasePath)
  favorites.once('value', function (data) {
    callback(data, favorites)
  })
}

function handleClickFavorite (e) {
  const elem = e.target
  const baseElement = elem.closest('.grid-item')
  // console.log(elem)
  toggleFavoriteIcon(elem)
  const restaurantId = baseElement.getAttribute('restaurant-id')
  // console.log(restaurantId)
  getFavorites(function (data, ref) {
    if (data.exists()) {
      const favoritesData = data.val()
      const favoriteBusinessIds = {}
      Object.keys(favoritesData).map(function (key) {
        favoriteBusinessIds[favoritesData[key].id] = key
      })
      if (Object.keys(favoriteBusinessIds).includes(restaurantId)) {
        const deleteKey = favoriteBusinessIds[restaurantId]
        ref.child(deleteKey).remove()
        // console.log(deleteKey)
      } else {
        fetchDetailedBusinessAndSave(restaurantId, ref)
      }
    } else {
      fetchDetailedBusinessAndSave(restaurantId, ref)
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
      btnLoadMore.innerHTML =
        '<span><i class="fas fa-question"></i> Still Hungry <i class="fas fa-question"></i></span>'
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
      Authorization: 'Bearer ' + apiKeys.yelp_api_key
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
  if (json.total === 0) {
    messageBox.style.display = 'block'
    throw new Error('0 Hit!')
  } else {
    messageBox.style.display = 'none'
  }
  searchStats.page = searchStats.page === null ? 1 : searchStats.page + 1
  searchStats.total = json.total
  searchStats.totalPages = Math.floor(json.total / queryLimit)
  const imageUrls = json.businesses.map(function (business) {
    const nextPath = '/restInfo.html'
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
  return window.fetch('https://api.ipdata.co?api-key=' + apiKeys.ip_data)
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
