//= require bootstrap
//= require underscore.js

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
var minPriceLevel = 0;
var firstPlace;
var hasLoadedFirstImage = false;


// ======================LEARNING HOW TO USE FIREBASE==================





// ======================FINDS CURRENT LOCATION =======================

function initiate_geolocation() {                    //function is grabbing lat & long based on users location using html5 function
  // for development
  myLat = 49.282023099999996;
  myLong = -123.1084264;
  var currentLocation = new google.maps.LatLng(myLat, myLong);  

  var request = {                                             // creating variable and assigning search results
    location: currentLocation,
    // radius: 20000,
    minPriceLevel : minPriceLevel,
    types: ['food','restaurant'],
    rankBy: google.maps.places.RankBy.DISTANCE
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

function callback(results, status, pagination) {                         //function takes results & status
  if (status == google.maps.places.PlacesServiceStatus.OK) {      //if the API call works (getting data back then...)
    nextNearbyPlaceIndex = 0;                                     //set nextNearbyPlaceIndex = 0  ALSO DOING THIS ABOVE NOT SURE WHY
                    
    results = _.reject(results, function(place) {
      return place.photos == undefined
    });
    // debugger
    nearbyPlaces = nearbyPlaces.concat(results);
    console.log(nearbyPlaces)

    populatePhotos(function(photo){               // ADD IF STATEMENT
      hasLoadedFirstImage = true;
      if ($('.list').children().length == 0){
        loadImage(photo);
      }
      if (pagination.hasNextPage){ 
         pagination.nextPage();
        initiate_geolocation();
      }
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

var priceRangeSelect = function (e) {
  e.preventDefault();
  minPriceLevel = $(this).val();
  $('.list').children().remove();
  photos = [];
  nearbyPlaces = [];
  initiate_geolocation(); 
};


function loadImage(photo) {
  var elem = $('<div><img src="' + photo.url + '"/></div>');
  $("body").data("current-image-url", photo.url);
  $("body").data("current-image-address", photo.address);
  $('.list').html(elem);  // jquery sets elem variable to html image placeholder
};

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function getNextImage() {
  if(nextImage < photos.length) {
    loadImage(photos[nextImage]);
    nextImage++;
  } 
}

function populatePhotos(success, error) {
  var tmpPhotos = [];
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
        

        if(!hasLoadedFirstImage && photos.length > 0){
          success(photos[0]);     
        }
        if (placeServiceStatus == google.maps.places.PlacesServiceStatus.OK) {                // if the data is okay
          if(placeResult && placeResult.photos) {   // Do we still need this?                                          // asking for the photo
            var address = placeResult.name + ' ' + _.inject(placeResult.address_components, function(memo, component) {
              memo.push(component.long_name);
              return memo;
            }, []).join(' ');
            for(i = 0; i < placeResult.photos.length; i++) {
              tmpPhotos.push({
                address : address,
                url : placeResult.photos[i].getUrl({                                                     // sets url to first photo with max height & width  - getUrl is a google api function 
                maxHeight: 500,
                maxWidth: 500
              })});
            }
            
          }
        }
      photos = shuffle(tmpPhotos);
      });
    }
    
  } else {
    error();
  }
}

// ====================== PICTURE SELECTORS ===============================

$(document).ready(function() {
  $('#price-select').on('change', priceRangeSelect);  
  // bind a click event to clicking on the #goodfood button
  $(".btn-success").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    addresses = ($("body").data("current-image-address"));
    goodfood.push({url : url, addresses : addresses});

    if (goodfood.length == 3) {
      $( "button" ).remove();
      $( ".list" ).remove();
      $.each(goodfood, function( index, value ) {
      var elem = $('<li><img data-addresses="' + value.addresses + '" src="' + value.url + '"/></li>');
      $( ".goodfood-container #favorites" ).append(elem);
      $( ".goodfood-container #favorites" ).css("display","inline");
      
      });


      $(".goodfood-container #favorites img").on('click', function (e) {
        window.location = "https://maps.google.ca/maps?q=" + e.target.getAttribute('data-addresses');
      });
    }
    getNextImage();                                                     // after click gets next nearby place
  });

  $(".btn-danger").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    badfood.push(url);
    getNextImage();                                                     // after click gets next nearby place
  });

  $(".btn-warning").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    notfood.push(url);
    getNextImage();                                                     // after click gets next nearby place
  });

  

  // initialize the map on load
  //google.maps.event.addDomListener(window, 'load', initiate_geolocation());
  initiate_geolocation();
  // updateUI();

  // =================FIREBASE==============
 var messagesRef = new Firebase("https://glowing-fire-120.firebaseIO.com/");

  // When the user presses enter on the message input, write the message to firebase.
  $("#messageInput").keypress(function (e) {
    if (e.keyCode == 13) {
      var name = $("#nameInput").val();
      var text = $("#messageInput").val();
      messagesRef.push({name:name, text:text});
      $("#messageInput").val("");
    }
  });

  // Add a callback that is triggered for each chat message.
  messagesRef.limitToLast(10).on("child_added", function (snapshot) {
    var message = snapshot.val();
    $("<div/>").text(message.text).prepend($("<em/>")
      .text(message.name + ": ")).appendTo($("#messagesDiv"));
    $("#messagesDiv")[0].scrollTop = $("#messagesDiv")[0].scrollHeight;
  });
});