var map;
var infowindow;
var myLat, myLong;
var currentPhotoIndex = 0;
var photos = [];
var goodfood = [];
var badfood = [];
var notfood = [];
var nextImage = 0;
var nearbyPlaces = [];


// ======================FINDS CURRENT LOCATION =======================

function initiate_geolocation() {                    //function is grabbing lat & long based on users location using html5 function

  // for development
  myLat = 49.282023099999996;
  myLong = -123.1084264;
  var currentLocation = new google.maps.LatLng(myLat, myLong);  // WE THINK this is generating the map and assigning to myLocation

  var request = {                                             // creating variable and assigning search results
    location: currentLocation,
    radius: 120,
    types: ['restaurant']
  };
  var service = new google.maps.places.PlacesService(document.getElementById('hidden-thing'));  // ????
  service.nearbySearch(request, callback);

  // for production
  /* navigator.geolocation.getCurrentPosition(function(position){   // browser asks user to approve getting location
    
    // myLat = position.coords.latitude;
    // myLong = position.coords.longitude;

    var currentLocation = new google.maps.LatLng(myLat, myLong);  // WE THINK this is generating the map and assigning to myLocation

    var request = {                                             // creating variable and assigning search results
      location: currentLocation,
      radius: 120,
      types: ['restaurant']
    };
    //infowindow = new google.maps.InfoWindow();                  // infoWindow shown when you click on pin in the map
    var service = new google.maps.places.PlacesService(document.getElementById('hidden-thing'));  // ????
    service.nearbySearch(request, callback);                    // Think that nearbySearch  is a google function which takes 2 params request and callback
  }); */
};

function callback(results, status) {                              //function takes results & status
  if (status == google.maps.places.PlacesServiceStatus.OK) {      //if the API call works (getting data back then...)
    nextNearbyPlaceIndex = 0;                                     //set nextNearbyPlaceIndex = 0  ALSO DOING THIS ABOVE NOT SURE WHY
    nearbyPlaces = results;                                      // ????????????????
    
    populatePhotos(function(firstPlace){
      loadImage(firstPlace.photos[0].getUrl({
        maxHeight: 500,
        maxWidth: 500
      }));
    }, function(){
      alert("OH NO! You're nowhere near restaurants. Are you at Knight and 54th?");
      //do something else
    });                                         // calls the function above  line 48
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

// ======================FINDS IMAGES ATTACHED TO BUSINESSES =======================

function loadImage(url) {
  var elem = $('<div><img src="' + url + '"/></div>');
  $("body").data("current-image-url", url);
  $('.list').html(elem);  // jquery sets elem variable to html image placeholder
}

function getNextImage() {
  if(nextImage < photos.length) {
    loadImage(photos[nextImage]);
    nextImage++;
  } else {
    $( "#badfood, #goodfood, #notfood").remove();
  }
}
function populatePhotos(success, error) {
  //nearbyPlaces is an array holding all current businesses
  if(nearbyPlaces.length > 0) {
    for(var i = 0; i < nearbyPlaces.length; i++) {  
      //var place is itereating through each business
      var place = nearbyPlaces[i];
      //setting variable equal to what we need from the object
      var detailsRequest = {
        // placeId is from google API        ?????????????????????                                      
        placeId: place.place_id                                   
      };
      var detailService = new google.maps.places.PlacesService(document.getElementById('hidden-thing'));  // map shit and I think hiding it

      detailService.getDetails(detailsRequest, function(placeResult, placeServiceStatus) {    // another API call based on details request which is the placeid
        if (placeServiceStatus == google.maps.places.PlacesServiceStatus.OK) {                // if the data is okay
          if(placeResult && placeResult.photos) {                                             // asking for the photo
            for(i = 0; i < placeResult.photos.length; i++) {
              photos.push(placeResult.photos[i].getUrl({                                                     // sets url to first photo with max height & width  - getUrl is a google api function 
                maxHeight: 500,
                maxWidth: 500
              }));
            }
          }
        }
      });
    }
    success(nearbyPlaces[0]);
  } else {
    error();
  }
}

// ====================== PICTURE SELECTORS ======== =======================

$(document).ready(function() {

  // bind a click event to clicking on the #goodfood button
  $("#goodfood").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    goodfood.push(url);
    getNextImage();                                                     // after click gets next nearby place
  });

  $("#badfood").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    badfood.push(url);
    getNextImage();                                                     // after click gets next nearby place
  });

  $("#notfood").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    notfood.push(url);
    getNextImage();                                                     // after click gets next nearby place
  });

  // initialize the map on load
  //google.maps.event.addDomListener(window, 'load', initiate_geolocation());
  initiate_geolocation();
  // updateUI();
});