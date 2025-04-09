import { getFirestore, collection, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { db } from './firebaseAPI_TEAM99'; 


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
async function getRoute(end) {
  if (!end) return; // If no end coordinates are provided, do nothing

  const db = firebase.firestore();
    const reportsCollection = db.collection('reports'); // You can name the collection as you like.

    // Add the address to Firestore
    reportsCollection.add({
        street: streetAddress,
        timestamp: firebase.firestore.Timestamp.fromDate(new Date()) // Save timestamp of when the address was added
    })
    .then(() => {
        console.log("Address successfully saved to Firestore!");
    })
    .catch((error) => {
        console.error("Error saving address: ", error);
    });

  // Create the route coordinates from start and end
  const routeCoordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;

  // Convert avoidPoints into the required waypoints format for Mapbox
  const waypoints = avoidPoints.map(point => `${point[0]},${point[1]}`).join(';');

  // Construct the Mapbox Directions API URL
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${routeCoordinates}?waypoints=${waypoints}&steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

  try {
    const query = await fetch(url, { method: 'GET' });
    const json = await query.json();

    if (json.routes && json.routes.length > 0) {
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
    } else {
      console.error("No route found.");
    }
  } catch (error) {
    console.error("Error fetching route:", error);
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

async function getAddressesAndPlotMarkers() {
  // Get the Firestore collection reference
  const db = firebase.firestore();
  const reportsCollection = db.collection("reports");

  try {
      // Get all the documents from Firestore
      const querySnapshot = await reportsCollection.get();

      querySnapshot.forEach(async (doc) => {
          const streetAddress = doc.data().street;
          console.log(`Fetching coordinates for address: ${streetAddress}`);

          // Geocode the address using Mapbox
          const coordinates = await geocodeAddress(streetAddress);

          if (coordinates) {
              // Add the marker to the Map
              addMarker(coordinates);
          }
      });
  } catch (error) {
      console.error("Error fetching reports: ", error);
  }
}


async function geocodeAddress(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      // Check if we got any results
      if (data.features && data.features.length > 0) {
          const { center } = data.features[0];  // Extract coordinates (longitude, latitude)
          return { longitude: center[0], latitude: center[1] };
      } else {
          console.error("Address not found:", address);
          return null;
      }
  } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
  }
}


function addMarker(coordinates) {
  // Add a marker at the coordinates on the map
  new mapboxgl.Marker()
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(map);
}

getAddressesAndPlotMarkers();
