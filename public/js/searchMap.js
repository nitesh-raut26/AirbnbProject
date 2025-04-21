mapboxgl.accessToken = mapboxToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  center: listing.coordinates, // New Delhi coordinates [lng, lat]
  zoom: 9, // starting zoom
});

// listing.geometry.coordinates
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.coordinates)
  .setPopup(
    new mapboxgl.Popup().setHTML(
      `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`
    )
  )
  .addTo(map);
