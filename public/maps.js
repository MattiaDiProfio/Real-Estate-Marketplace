mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGlhZGlwcm9maW8xIiwiYSI6ImNsbG54ZXdjZjA1ZWwzZm1xYmM2YTlzd3EifQ.OXFg-nuVZkEHCXeCp5mqkw';
const propertyObj = JSON.parse(property);
console.log(propertyObj)
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: propertyObj.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');

new mapboxgl.Marker()
    .setLngLat(propertyObj.geometry.coordinates)
    .addTo(map);