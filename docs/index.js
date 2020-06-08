var requestsDiv = document.getElementsByClassName('requests')[0];
var locationCardTemplate = document.getElementsByClassName('location-card-template')[0];
var requestCTA = document.getElementsByClassName('request-cta')[0];
var requestDialog =  document.getElementById('request-type');

for (var i = 0 ; i < 5 ; i++){
    requestsDiv.appendChild(locationCardTemplate.content.cloneNode(true));
}

requestCTA.addEventListener("click", function(ev){
    showModal(requestDialog);
});

document.querySelectorAll('.dialog').forEach(function(item) {
    item.querySelector('.close').addEventListener('click', function(event) {
        hideModal(item);
    });
});

function showModal(element) {
    element.classList.add('open');
}

function hideModal(element) {
    element.classList.remove('open');
}


mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb25oYW5zIiwiYSI6ImNrYjVrc3hvaTBkMW4zMW1wbXU4emlhaHgifQ.3Zpqx654l58G4Fl_IdcXLA';
var map = new mapboxgl.Map({
  container: 'main-map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-122.269326, 37.808404],
  zoom: 13
});

fetch('art-requests.json')
  .then(response => response.json())
  .then(geojson => {
    // add markers to map
    geojson.features.forEach(function(marker) {

      // create a HTML element for each feature
      var el = document.createElement('div');
      el.className = 'art-request-marker';

      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
    });

});


