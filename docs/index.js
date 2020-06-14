let mainView = document.getElementById('main-view'),
    requestDetailView = document.getElementById('request-detail-view'),
    cleanupRequestsDiv = document.getElementsByClassName('cleanup-requests')[0],
    requestCardTemplate = document.getElementById('request-card-template'),
    requestDetailsTemplate = document.getElementById('request-detail-template'),
    requestCTA = document.getElementsByClassName('request-help-cta')[0],
    requestDialog = document.getElementById('request-type'),
    aboutLink =  document.getElementsByClassName('about-link')[0],
    aboutDialog = document.getElementById('about');

// for (var i = 0 ; i < 5 ; i++){
//     var requestCardHTML = requestCardTemplate.content.cloneNode(true);
//     requestCardHTML.querySelector('button').addEventListener("click", () => {
//         mainView.classList.add('hide');
//         requestDetailView.classList.remove('hide');    
//         var requestDetailHTML = requestDetailsTemplate.content.cloneNode(true);
//         requestDetailHTML.querySelector('.volunteer-count').text = requestCardHTML.querySelector('volunteer-count').text
//         requestDetailView.appendChild(requestDetailHTML);
//     });
//     cleanupRequestsDiv.appendChild(requestCardHTML);
// }

requestCTA.addEventListener("click", (ev) => showModal(requestDialog));
aboutLink.addEventListener("click", (ev) => showModal(aboutDialog));

document.querySelectorAll('.dialog').forEach((item) => {
    item.querySelector('.close').addEventListener('click', (event) => {
        hideModal(item);
    });
});

function showModal(element) {
    element.classList.add('open');
}

function hideModal(element) {
    element.classList.remove('open');
}

document.querySelectorAll('.tab').forEach((item) => {
    item.addEventListener('click', (event) => {
        document.querySelectorAll('.tab, .tab-content').forEach((i) => { 
            if(i.id.includes(event.currentTarget.id)) {
                i.classList.add('active');
            } else {
                i.classList.remove('active'); 
            }
        });
    });
    if (item.classList.contains('active')) {
        document.getElementById(item.id + '-content').classList.add('active');
    }
});

// temporary goofy map sizing, feel free to delete this and size the map a better way
document.getElementById('main-map').style.height = (window.innerHeight - 175)+'px';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb25oYW5zIiwiYSI6ImNrYjVrc3hvaTBkMW4zMW1wbXU4emlhaHgifQ.3Zpqx654l58G4Fl_IdcXLA';
var map = new mapboxgl.Map({
  container: 'main-map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-122.269326, 37.808404],
  zoom: 13
});

fetch('data/art-requests.json')
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
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(`<h3>Art request</h3><p>${marker.properties.title}</p><p>${marker.properties.address}</p>`))
        .addTo(map);
    });

});

