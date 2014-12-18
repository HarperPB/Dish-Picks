var map;
var infowindow;
var myLat, myLong;
var photos = [];

function initiate_geolocation() {  

  navigator.geolocation.getCurrentPosition(function(position){
    myLat = position.coords.latitude;
    myLong = position.coords.longitude;

    var currentLocation = new google.maps.LatLng(myLat, myLong);
    console.log(currentLocation);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: currentLocation,
      zoom: 18
    });
    
    var request = {
      location: currentLocation,
      radius: 400,
      types: ['restaurant']
    };
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  });
};

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      //if(results[i].opening_hours.open_now == true) {
        var detailsRequest = { 
          placeId: results[i].place_id
        };

        var detailService = new google.maps.places.PlacesService(map);
        detailService.getDetails(detailsRequest, function(placeResult, placeServiceStatus) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            
            if(placeResult.photos) {
              for (var z = 0; z < placeResult.photos.length; z++) {
                photos.push(placeResult.photos[z].getUrl({
                  maxHeight: 2500,
                  maxWidth: 2500
                }));
              }
            }
          }
        });
      //}
      createMarker(results[i]);
    }
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

function updateUI(){ 
  setTimeout(
    function(){
      console.log(photos);
      updateUI();
    }, 10000);
}

$(document).ready(function() {
  // initialize the map on load
  google.maps.event.addDomListener(window, 'load', initiate_geolocation());
  updateUI();
});