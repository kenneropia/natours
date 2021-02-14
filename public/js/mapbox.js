export default (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2VubmVyb3BpYSIsImEiOiJja2txcWtwczIxcDY5MnBuc3E2dDgzb20yIn0.yeVhMiohshwzDZ1USpVpaQ'

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
  })

  const bounds = new mapboxgl.LngLatBounds()
  locations.forEach((loc) => {
    const el = document.createElement('div')
    el.className = 'marker'

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addto(map)
    bounds.extend(loc.coordinates)
  })

  map.fitBounds(bounds)
}
