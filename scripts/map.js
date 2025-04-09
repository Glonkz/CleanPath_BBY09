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

// Define your starting position (this could be user's location or a fixed point)
const start = [-123, 49.24]; // Example: starting position
let searchedCoords = null; // to store the geocoded search result coordinates

// Create a function to make a directions request
async function getRoute(end, avoidPoints) {
  if (!end) return; // If no end coordinates are provided, do nothing




  const routeCoordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;

  const firebaseAvoidPoints = await fetchAvoidPoints();
  const allAvoidPoints = firebaseAvoidPoints.concat([avoidPoints]);

  const waypoints = avoidPoints.map(point => `${point[0]},${point[1]}`).join(';');

  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${routeCoordinates}&waypoints=${waypoints}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();

  // Handle the response and return the route
  const data = json.routes[0];
  const route = data.geometry.coordinates;

  // Create the geojson route object
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };

  return geojson;



  // If the route already exists on the map, we'll reset it using setData
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  } else {
    // Otherwise, we'll create a new route layer
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

async function fetchAvoidPoints() {
  const avoidPoints = [];
  try {
    const snapshot = await db.collection('avoid_points').get();
    snapshot.forEach(doc => {
      const data = doc.data();
      const point = [data.longitude, data.latitude];
      avoidPoints.push(point);
    });
    return avoidPoints;
  } catch (error) {
    console.error("Error fetching avoid points:", error);
    return [];
  }
}




map.on('load', () => {
  // Initial directions request that starts and ends at the searched coordinates
  if (searchedCoords) {
    getRoute(searchedCoords);
  }

  // Add the starting point (user's location) to the map
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
  // Get the coordinates of the clicked point on the map
  const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);

  // Update the end point with the clicked coordinates
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

  // If the "end" layer already exists, update its coordinates
  if (map.getLayer('end')) {
    map.getSource('end').setData(end);
  } else {
    // Otherwise, add a new "end" point layer on the map
    map.addLayer({
      id: 'end',
      type: 'circle',
      source: {
        type: 'geojson',
        data: end
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#f30'
      }
    });
  }

  // Now pass the newly clicked coordinates as the endpoint to getRoute
  getRoute(coords); // Use the new destination (coords) as the endpoint
});

// Add geocoder control to the map
map.addControl(geocoder);

// Geocoder event to store the searched position coordinates
geocoder.on('result', function (event) {
  searchedCoords = event.result.geometry.coordinates;
  // Optionally, you can call getRoute here to immediately show a route to the searched location
  getRoute(searchedCoords);
});



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
  getRoute(endCoords);

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


