$(document).ready(function () {
  $('.header').height($(window).height())
})

// $('#btn-search').on('click', function(event) {
//     var target = $(this.getAttribute('#searchResult'));
//     if( target.length ) {
//         event.preventDefault();
//         $('html, body').stop().animate({scrollTop:position}, speed, "swing");
//     }
// $(function() {
//   var $elem = $('#searchResult');
//   $('#btn-search').click(
//     function (e) {
//       $('html, body').animate({scrollTop: $elem.height()}, 500);
//     }
//   )
// });

// $(function(){
//   $('a[href^="#"]').click(function(){
//     let speed = 500;
//     let href= $(this).attr("href");
//     let target = $(href == "#" || href == "" ? 'html' : href);
//     let position = target.offset().top;
//     $("html, body").animate({scrollTop:position}, speed, "swing");
//     return false;
//   });
// });

const loginLink = document.querySelector('#li-login')
window.firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    loginLink.innerHTML = `
    <button type="button" class="btn btn-outline-success" data-container="body" 
    data-toggle="popover" data-placement="bottom" data-content="Logout">
      <i class="fas fa-user-circle"></i>
      ${user.providerData[0].displayName}
    </button>`
    loginLink.querySelector('button').addEventListener('click', function () {
      window.firebase
        .auth()
        .signOut()
        .then(function () {
          window.location.href = '/'
        })
    })
    $(loginLink.querySelector('button')).popover({
      content: 'Logout',
      trigger: 'hover'
    })
  }
})
