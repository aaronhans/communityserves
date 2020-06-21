<script>
    import { onMount } from 'svelte';

    let map = null;
    onMount(() => {
        // temporary goofy map sizing, feel free to delete this and size the map a better way
        document.getElementById('main-map').style.height = (window.innerHeight - 175)+'px';
    });

    const initMap = () => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb25oYW5zIiwiYSI6ImNrYjVrc3hvaTBkMW4zMW1wbXU4emlhaHgifQ.3Zpqx654l58G4Fl_IdcXLA';
        map = new mapboxgl.Map({
            container: 'main-map',
            style: 'mapbox://styles/mapbox/dark-v9',
            center: [-122.269326, 37.808404],
            zoom: 13
        });

        getRequests();
    }

    const getRequests = () => {
        fetch('data/entered-data.json')
        .then(response => response.json())
        .then(geojson => {
            // add markers to map
            geojson.features.forEach(function(marker) {

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'art-complete-marker';

            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25, maxWidth: 'none' }) // add popups
                .setHTML(`<h3>Install</h3>
                    <p><img src="${marker.properties.imgURL}" class="image-on-marker"></p>
                    <p>${marker.properties.address}</p>
                    ${(marker.properties.business) ? `<p>Business: ${marker.properties.business}</p>` : ''}
                    ${(marker.properties.artist) ? `<p>Artist: ${marker.properties.artist}</p>` : ''}
                    ${(marker.properties.insta) ? `<p>IG: ${marker.properties.insta}</p>` : ''}
                    ${(marker.properties.help) ? `<p>With help from ${marker.properties.help}</p>` : ''}
                `))
                .addTo(map);
            });

        });
    }
</script>

<svelte:head>
    <script src='https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js' on:load={initMap}></script>
</svelte:head>
<div id="main-map" class="themap"></div>

<style>
    .themap {
        width: 100%; 
        height: 250px;
    }

    :global(.art-request-marker) {
        background-image: url('../img/paint-brush-fill.svg');
        background-size: cover;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
    }
    :global(.art-complete-marker) {
        background-image: url('../img/finishedmural.svg');
        background-size: cover;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
    }
    :global(.image-on-marker) {
        max-width: 400px;
    }
</style>