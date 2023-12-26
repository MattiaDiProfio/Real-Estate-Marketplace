mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGlhZGlwcm9maW8xIiwiYSI6ImNsbG54ZXdjZjA1ZWwzZm1xYmM2YTlzd3EifQ.OXFg-nuVZkEHCXeCp5mqkw';
const propertyObj = JSON.parse(property);

// Map object - used to represent the position of each property
const map = new mapboxgl.Map({
    // Container ID
    container: 'map',
    // Style URL
    style: 'mapbox://styles/mapbox/light-v10',
    // Starting position [lng, lat]
    center: propertyObj.geometry.coordinates,
    // Starting zoom
    zoom: 9,
});

// Control commands for the map - allows users to adjust zoom and position on map
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');

// Mapbox marker which shows position of property
new mapboxgl.Marker()
    .setLngLat(propertyObj.geometry.coordinates)
    .addTo(map);