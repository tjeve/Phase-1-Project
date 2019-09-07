## Hungry Eyes: Search for Meals in your area by Picture!

The purpose of this [project](https://github.com/oakmac/phase1-final-project-requirements) is to create a website that allows the user to search for a restaurant and its location based on images of food taken at that restaurant.  It utilizes the CSS framework Bootstrap, the CSS layout Masonry, and several API's including [Yelp](https://www.yelp.com/developers), [Firebase](https://firebase.google.com/) and [Google Maps](https://developers.google.com/maps/documentation/). It is our second group project with Digital Crafts.

### Original Link to the Project
> https://digitalcrafts-ph-1566664527167.firebaseapp.com/

### What Hungry Eyes Does and How It Works
* Hungry eyes takes food and location input from the user, gives that data to the [Yelp API](https://www.yelp.com/developers) and returns images of the requested food type as a collage using the CSS layout [Masonry](https://masonry.desandro.com/). If the location is not specified, a [geolocation API](https://ipdata.co/) uses the users location.  
* The user can then select a food image they like to favorite for later or return restaurant information such as the restaurants name, rating, phone number, address and a map of the restaurants location.The Firebase API is used to allow users to create an account to track their favorited food items.   
* The restaurant location retrieved from Yelp is passed to the Google Map API in order to display the map location.
  
### Collaborators
* [Kazue Sasatni](https://github.com/segakazzz)
* [Terrence Eveline](https://github.com/tjeve)
* [Paige Ballard](https://github.com/paigeballard)

### Project Parameters
This [project](https://github.com/oakmac/phase1-final-project-requirements) was required to use at least one Javascript Library that is not jQuery, such as Moment.js or Marked, use a CSS framework such as Bootstrap, Bulma, or Foundation, and access at least two remote APIs using AJAX. Other requirements included deploying the application to somewhere other thn Github Pages. We chose to host the site using [Firebase](https://firebase.google.com/). The repo must run at least one test through a continuous integration service such as Travis CI.
Our team used [Trello](www.trello.com) to manage our workflow and track project features and bugs through the duration of the project. 

### Technologies Used
  * [Bootstrap](https://getbootstrap.com/)
  * [Masonry](https://masonry.desandro.com/)
  * [Font Awesome](https://fontawesome.com/)
  * [Yelp API](https://www.yelp.com/developers)
  * [IPData](https://ipdata.co/) 
  * [Firebase](https://firebase.google.com/) - Hosting, Authentication and Realtime Database
  * [Google Maps](https://developers.google.com/maps/documentation/)


### Testing
  * [Standard JS](https://standardjs.com/)
  * [Travis CI](https://travis-ci.com/): [![Build Status](https://travis-ci.com/tjeve/Phase-1-Project.svg?token=dsz12ZBZHtquGbpEUUm6&branch=master)](https://travis-ci.com/tjeve/Phase-1-Project)

### API Key security
   * API Keys for Yelp and IP Data are saved in Firebase database. It's not visible in Javascript file. 
   * API Keys for Google services such as Firebase and Map are working under limited host only. [Google API key best practice](https://developers.google.com/maps/api-key-best-practices)
   
 ### Ideas for Future Functionality
   * Adding a button to show more photos from the restaurant of the selected photo on the restaurant info page
   * Adding the distance between the restaurant and the user on the restaurant info page
   
