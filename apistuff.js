// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var map, infowindow, service, userPos;
var home = {lat: 40.7117017, lng: -73.94574279999999};
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: home,
    zoom: 16
  });

  service = new google.maps.places.PlacesService(map);
  infowindow = new google.maps.InfoWindow();

  geoLocateUser(getHealthy);
  
  document.getElementById('submit').addEventListener('click', function() {
    getHealthy(map.getCenter());
  });
}

function geoLocateUser(cb) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      userPos = pos;
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon:'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });
      cb(pos);
    }, function() {
      handleLocationError(true, marker, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, marker, map.getCenter());
  }
}

function getHealthy(pos){
  service.nearbySearch({
    location: pos,
    radius: 500,
    type: ['restaurant'],
    keyword: '(healthy) OR (organic) OR (vegan) OR (vegetarian) OR (raw) OR (juice)'  
  }, callback);
}

function handleLocationError(browserHasGeolocation, marker, pos) {
  marker.setPosition(pos);
  marker.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  marker.open(map);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function checkIfExcluded(name){
  var flag = false;
  excluded.forEach(function(banned){
    if (name == banned)
      flag = true;
  });
  return flag;   
}

var excluded = [
'SUBWAY'+String.fromCharCode(174)+'Restaurants',
'Taco Bell',
'Burger King'
];

function createMarker(place) {
  var placeLoc = place.geometry.location;
  if (!checkIfExcluded(place.name)){
    service.getDetails({
      placeId: place.place_id
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
            'type: ' + place.types[0]+ '--' +
            ' <a href="' + place.website + '">website</a><br>' +
            place.formatted_address + '</div>');
          infowindow.open(map, this);
        });
      }
    });
  }
}