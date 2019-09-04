const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none'
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: '/index.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // window.firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // window.firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // window.firebase.auth.GithubAuthProvider.PROVIDER_ID,
    window.firebase.auth.EmailAuthProvider.PROVIDER_ID
    // window.firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ]
  // Terms of service url.
  // tosUrl: '<your-tos-url>',
  // Privacy policy url.
  // privacyPolicyUrl: '<your-privacy-policy-url>'
}

const ui = new window.firebaseui.auth.AuthUI(window.firebase.auth())
// FirebaseUI starting...
ui.start('#firebaseui-auth-container', uiConfig)
