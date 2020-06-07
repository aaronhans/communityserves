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


