const listOfFavorites = document.querySelector('#listOfFavorites')
let loginUser = null

window.firebase.auth().onAuthStateChanged(function (user) {
  loginUser = user
  console.log('DOM Loaded!')
  getFavorites(function (data) {
    handleFavorites(data)
  })
})

function handleFavorites (response) {
  if (response.exists()) {
    const responseObject = response.val()
    const responseArray = Object.keys(responseObject).map(function (key) {
      return responseObject[key]
    })
    const imageUrls = responseArray.map(function (business) {
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
                  <img class="img-favorite" src=${business.image_url}>
                </div>
              </div>`
    })
    listOfFavorites.innerHTML = imageUrls.join('')
    const promiseArray = completeAllImageLoading()
    organaizeImages(promiseArray)
  }
}

function completeAllImageLoading () {
  const imgs = document.querySelectorAll('img.img-favorite')
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

function organaizeImages (promiseArray) {
  // console.log(promiseArray)
  Promise.all(promiseArray)
    .then(function () {
      const imgs = document.querySelectorAll('img.img-favorite')
      imgs.forEach(function (img) {
        img.style.display = 'block'
      })
      const masonry = new window.Masonry(listOfFavorites, {
        // options
        itemSelector: '.grid-item',
        columnWidth: 350,
        fitWidth: true,
        isInitLayout: false
      })
      masonry.layout()
    })
    .then(addEventListenersToResults)
    .catch(function (err) {
      console.error(err.message)
    })
}

function addEventListenersToResults () {
  const imgs = document.querySelectorAll('img.img-favorite')
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
  getFavorites(function (data, ref) {
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
        toggleFavoriteIcon(link2favorites)
      }
    })
  })
}

function handleClickFavorite (e) {
  const elem = e.target
  const baseElement = elem.closest('.grid-item')
  console.log(elem)
  toggleFavoriteIcon(elem)
  const restaurantId = baseElement.getAttribute('restaurant-id')
  // console.log(restaurantId)
  getFavorites(function (data, ref) {
    const favoritesData = data.val()
    const favoriteBusinessIds = {}
    Object.keys(favoritesData).map(function (key) {
      favoriteBusinessIds[favoritesData[key].id] = key
    })
    if (Object.keys(favoriteBusinessIds).includes(restaurantId)) {
      const deleteKey = favoriteBusinessIds[restaurantId]
      ref.child(deleteKey).remove()
      baseElement.remove()
      const masonry = new window.Masonry(listOfFavorites, {
        // options
        itemSelector: '.grid-item',
        columnWidth: 350,
        fitWidth: true,
        isInitLayout: false
      })
      masonry.layout()
    }
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

function getFavorites (callback) {
  const db = window.firebase.database()
  const firebasePath = loginUser
    ? `/users/${loginUser.uid}/favorites`
    : '/everyone/favorites'
  console.log(firebasePath)
  const favorites = db.ref(firebasePath)
  favorites.once('value', function (data) {
    callback(data, favorites)
  })
}
