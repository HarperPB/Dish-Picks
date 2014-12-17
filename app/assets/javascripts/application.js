var map;
var infowindow;
var myLat, myLong;
var currentPhotoIndex = 0;
var photos = [];
var goodfood = [];
var badfood = [];
var notfood = [];


var nextNearbyPlaceIndex = 0;
var nearbyPlaces = [];

function initiate_geolocation() {                    //function is grabbing lat & long based on users location using html5 function

  navigator.geolocation.getCurrentPosition(function(position){   // browser asks user to approve getting location
    myLat = position.coords.latitude;
    myLong = position.coords.longitude;

    var currentLocation = new google.maps.LatLng(myLat, myLong);  // WE THINK this is generating the map and assigning to myLocation

    // map = new google.maps.Map(document.getElementById('map-canvas'), {
    //   center: currentLocation,
    //   zoom: 18
    // });
    
    var request = {                                             // creating variable and assigning search results
      location: currentLocation,
      radius: 120,
      types: ['restaurant']
    };
    infowindow = new google.maps.InfoWindow();                  // infoWindow shown when you click on pin in the map
    var service = new google.maps.places.PlacesService(document.getElementById('hidden-thing'));  // ????
    service.nearbySearch(request, callback);                    // Think that nearbySearch  is a google function which takes 2 params request and callback
  });
};

function callback(results, status) {                              //function takes results & status
  if (status == google.maps.places.PlacesServiceStatus.OK) {      //if the API call works (getting data back then...)
    nextNearbyPlaceIndex = 0;                                     //set nextNearbyPlaceIndex = 0  ALSO DOING THIS ABOVE NOT SURE WHY
    nearbyPlaces = results;                                      // ????????????????
    getNextNearbyPlace();                                         // calls the function above  line 48

    // for (var i = 0; i < results.length; i++) {
    //   //if(results[i].opening_hours.open_now == true) {
    //     var detailsRequest = { 
    //       placeId: results[i].place_id
    //     };

    //     var detailService = new google.maps.places.PlacesService(document.getElementById('hidden-thing'));

    //     detailService.getDetails(detailsRequest, function(placeResult, placeServiceStatus) {
    //       if (status == google.maps.places.PlacesServiceStatus.OK) {
    //         if(placeResult && placeResult.photos) {
    //           for (var z = 0; z < placeResult.photos.length; z++) {
    //             var url = placeResult.photos[z].getUrl({
    //               maxHeight: 500,
    //               maxWidth: 500
    //             })
    //             photos.push(url);
    //           }
    //         }
    //       }
    //     });
    //   //}
      // createMarker(results[i]);
    // }
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

// function updateUI(){ 
//   setTimeout(
//     function(){
//       console.log(photos);
//       updateUI();
//     }, 10000);
// }
// function appendNextPhoto() {
//   if (currentPhotoIndex < photos.length) {
//     appendImageUrl(photos[currentPhotoIndex++]);
//   }
// }

function appendImageUrl(url) {
  var elem = $('<div><img src="' + url + '"/></div>');
  $("body").data("current-image-url", url);
  $('.list').html(elem);  // jquery sets elem variable to html image placeholder
}

function getNextNearbyPlace() {
  //nearbyPlaces is an array holding all current businesses
  if (nextNearbyPlaceIndex < nearbyPlaces.length) {  
    //var place is itereating through each business

    var place = nearbyPlaces[nextNearbyPlaceIndex++];
      if (nextNearbyPlaceIndex == 1){
        var firstimage = place.photos[0].getUrl({                                                     // sets url to first photo with max height & width  - getUrl is a google api function 
            maxHeight: 500,
            maxWidth: 500
          });
        console.log(firstimage)
      }
    //setting variable equal to what we need from the object
    var detailsRequest = {
      // placeId is from google API        ?????????????????????                                      
      placeId: place.place_id                                   
    };
    // console.log(place)
    var detailService = new google.maps.places.PlacesService(document.getElementById('hidden-thing'));  // map shit and I think hiding it

    detailService.getDetails(detailsRequest, function(placeResult, placeServiceStatus) {    // another API call based on details request which is the placeid
      if (placeServiceStatus == google.maps.places.PlacesServiceStatus.OK) {                // if the data is okay
        if(placeResult && placeResult.photos) {                                             // asking for the photo
          for(i = 0; i < placeResult.photos.length; i++) {
            photos.push(placeResult.photos[i]);
          }
          var firstPhoto = placeResult.photos[0];                                           // sets firstPhoto to first element in array
          var url = firstPhoto.getUrl({                                                     // sets url to first photo with max height & width  - getUrl is a google api function 
            maxHeight: 500,
            maxWidth: 500
          });
          appendImageUrl(url);                                                              // calls the function appendImageurl from line 40
        } else {
          getNextNearbyPlace();                                                             // gets the next business line 48
        }
      }
    });
      
  }
  else {
    $( "#badfood, #goodfood, #notfood").remove();
  }
}

$(document).ready(function() {

  // bind a click event to clicking on the #goodfood button
  $("#goodfood").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    goodfood.push(url);
    getNextNearbyPlace();                                                     // after click gets next nearby place
  });

  $("#badfood").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    badfood.push(url);
    getNextNearbyPlace();                                                     // after click gets next nearby place
  });

  $("#notfood").on('click', function () {                                              // sets click function on the picture. 
    url = $("body").data("current-image-url");
    notfood.push(url);
    getNextNearbyPlace();                                                     // after click gets next nearby place
  });

  // initialize the map on load
  google.maps.event.addDomListener(window, 'load', initiate_geolocation());
  // updateUI();
});