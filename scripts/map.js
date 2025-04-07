mapboxgl.accessToken = 'pk.eyJ1IjoianByaWNlOTE2IiwiYSI6ImNtODU0cWd1ODAwaDAybW9kNGJmdmcxdGwifQ.SzEpTyJxWWgcEt8cG2oF_A';
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-123., 49.24],
  zoom: 13
});

const searchBar = document.getElementsByClassName("mapboxgl-ctrl-geocoder mapboxgl-ctrl");

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  marker: {
    color: 'green'
  },
  mapboxgl: mapboxgl
});

const start = [-123, 49.24];
// create a function to make a directions request
async function getRoute(end) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };
  // if the route already exists on the map, we'll reset it using setData
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}

map.on('load', () => {
  // make an initial directions request that
  // starts and ends at the same location
  getRoute(start);

  // Add starting point to the map
  map.addLayer({
    id: 'point',
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: start
            }
          }
        ]
      }
    },
    paint: {
      'circle-radius': 10,
      'circle-color': '#3887be'
    }
  });
});

  map.on('click', (event) => {
    const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
    const end = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords
          }
        }
      ]
    };
    if (map.getLayer('end')) {
      map.getSource('end').setData(end);
    } else {
      map.addLayer({
        id: 'end',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: coords
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#f30'
        }
      });
    }
    getRoute(coords);
  });
map.addControl(geocoder);


//GPS function.
function updateLocationWithGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [position.coords.longitude, position.coords.latitude];

        //Updating the start var
        const start = userCoords;

        //Update the start point marker
        const startGeojson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: start
              }
            }
          ]  
        };
        if (map.getSource('point')) {
          map.getSource('point').setData(startGeojson);
        }

        //Centering the map to user's location
        map.flyTo({
          center: start,
          zoom: 15 
        });

        //Update the existing route if any
        if (map.getLayer('end')) {
          const endCoords = map.getSource('end')._data.features[0].geometry.coordinates;
          getRoute(endCoords);
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        alert('Unable to access your location. Turn on your location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Create a custom control with a logo
const gpsControl = document.createElement('div');
gpsControl.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

// Create the button
const gpsButton = document.createElement('button');
gpsButton.className = 'mapboxgl-ctrl-icon';
gpsButton.type = 'button';
gpsButton.title = 'Get Current Location';

const gpsIcon = document.createElement('img');
gpsIcon.src = 'images/gps.png';
gpsIcon.alt = 'GPS Icon';
gpsIcon.style.width = '25px'; 
gpsIcon.style.height = '25px';
gpsButton.appendChild(gpsIcon);

// Add click event to trigger geolocation
gpsButton.addEventListener('click', updateLocationWithGPS);

// Putting button onto the map
gpsControl.appendChild(gpsButton);

// Add the custom control to the map
map.addControl({
  onAdd: function () {
    return gpsControl;
  },
  onRemove: function () {
    gpsControl.parentNode.removeChild(gpsControl);
  }
}, 'top-right');
