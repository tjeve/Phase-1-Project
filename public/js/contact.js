// var firebaseConfig = {
//     apiKey: "AIzaSyBbt9u-aIn5UtC0JTcUEAwz9xrxzkzkJOc",
//     authDomain: "digitalcrafts-ph-1566664527167.firebaseapp.com",
//     databaseURL: "https://digitalcrafts-ph-1566664527167.firebaseio.com",
//     projectId: "digitalcrafts-ph-1566664527167",
//     storageBucket: "digitalcrafts-ph-1566664527167.appspot.com",
//     messagingSenderId: "433077063857",
//     appId: "1:433077063857:web:0f9d8ef862b9d6a6"
//   };
//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);

var messagesRef = window.firebase.database().ref('messages')

document.getElementById('contactForm').addEventListener('submit', submitForm)

function submitForm (e) {
  e.preventDefault()

  var name = getInputVal('name')
  var email = getInputVal('email')
  var message = getInputVal('message')

  saveMessage(name, email, message)

  document.querySelector('.alert').style.display = 'block'

  setTimeout(function () {
    document.querySelector('.alert').style.display = 'none'
  }, 3000)

  document.getElementById('contactForm').reset()
}

function getInputVal (id) {
  return document.getElementById(id).value
}

function saveMessage (name, email, message) {
  var newMessageRef = messagesRef.push()
  newMessageRef.set({
    name: name,
    email: email,
    message: message
  })
}
