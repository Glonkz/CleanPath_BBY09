import { getFirestore, collection, addDoc, Timestamp, getDocs } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { db } from './firebaseAPI_TEAM99.js';


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

let searchedCoords = null; // to store the geocoded search result coordinates
var start = [-123.12, 49.28];  // Example starting position (replace with your own)

// Create a function to make a directions request
async function getRoute(end) {
  if (!end) return; // If no end coordinates are provided, do nothing
  
  
  
  // Step 1: Fetch points to avoid from Firestore
  const avoidPoints = await getAvoidPointsFromFirestore();
  
  // Step 2: Construct the route coordinates from start and end
  const routeCoordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
  
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${routeCoordinates}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
  
  try {
    // Fetch route from Mapbox Directions API
    const query = await fetch(url, { method: 'GET' });
    const json = await query.json();
    
    if (json.routes && json.routes.length > 0) {
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      
      // Step 3: Check if the route passes too close to any avoid points
      const adjustedRoute = await adjustRouteToAvoidPoints(route, avoidPoints);
      
      // Step 4: Create the geojson route object
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: adjustedRoute
        }
      };
      
      // Update or add the route layer on the map
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else {
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


// Function to fetch avoid points (addresses) from Firestore
async function getAvoidPointsFromFirestore() {
  try {
    const db = firebase.firestore();
    const reportsCollection = db.collection('reports');
    const querySnapshot = await reportsCollection.get();
    
    // Extract coordinates from Firestore addresses
    const avoidPoints = querySnapshot.docs.map(doc => {
      const address = doc.data().street;
      // Call geocoding service to convert address to coordinates
      return geocodeAddress(address);
    });
    
    // Wait for all geocoding promises to resolve
    return Promise.all(avoidPoints);
  } catch (error) {
    console.error("Error fetching avoid points from Firestore:", error);
    return [];
  }
}

// Function to geocode an address (convert address to coordinates)
async function geocodeAddress(address) {
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`;
  
  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Return the coordinates of the first result
      return data.features[0].geometry.coordinates;
    } else {
      console.error(`No coordinates found for address: ${address}`);
      return null;
    }
    
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
  
  
}

// Function to adjust the route (avoiding specific points)
async function adjustRouteToAvoidPoints(routeCoordinates, avoidPoints) {
  const adjustedRoute = [];
  
  // Loop through the route and check if any point is too close to avoid points
  for (let i = 0; i < routeCoordinates.length; i++) {
    const currentCoord = routeCoordinates[i];
    let isAvoided = false;
    
    // Check each avoid point and see if the current route segment is too close
    for (let j = 0; j < avoidPoints.length; j++) {
      const avoidPoint = avoidPoints[j];
      
      // Check if current point is close to avoid point (buffer zone logic)
      if (isPointClose(currentCoord, avoidPoint)) {
        // If too close, mark the point as "avoided"
        isAvoided = true;
        break;
      }
    }
    
    if (!isAvoided) {
      // If not avoided, just push the current coordinate
      adjustedRoute.push(currentCoord);
    } else {
      // Handle rerouting or detour logic here
      // We need to find a way to "avoid" the point. Here you could add an alternative point/waypoint
      const detour = findDetourAroundAvoidPoint(currentCoord, avoidPoints);
      adjustedRoute.push(...detour); // Push detour points into the route
    }
  }
  
  return adjustedRoute;
}
// Check if the current point is within a certain distance of the avoid point (buffer zone)
function isPointClose(coord, avoidPoint) {
  const [lng, lat] = coord;
  const [avoidLng, avoidLat] = avoidPoint;
  
  // Calculate distance (we'll use a simple Euclidean distance here, but a Haversine formula could work better)
  const distance = Math.sqrt(Math.pow(lng - avoidLng, 2) + Math.pow(lat - avoidLat, 2));
  
  return distance < 0.01;  // 0.01 degrees approx. 1km, adjust this based on your needs (0.0001 is ~10 meters)
}

// Function to find a detour around an avoid point (simple implementation)
function findDetourAroundAvoidPoint(coord, avoidPoints) {
  const detourPoints = [];
  
  // Generate new route points that reroute around the avoid point.
  // Here you can apply custom logic to find a detour around the avoid point.
  
  // For simplicity, let's simulate a detour by adding a small offset
  const [lng, lat] = coord;
  
  // Example of a simple detour (adding an offset)
  const detour = [
    [lng + 0.001, lat + 0.001], // New detour coordinates (simulated)
    [lng - 0.001, lat - 0.001], // Another detour point (simulated)
  ];
  
  
  return detour;
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

function addMarkersLayer(coordinates) {
  // Create a GeoJSON object from the coordinates array
  const features = coordinates.map(coord => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [coord.lng, coord.lat], // GeoJSON format: [longitude, latitude]
    },
    properties: {
      // Optional properties, e.g., name, description
      name: coord.name || '',
      description: coord.description || '',
    },
  }));

  const geojson = {
    type: 'FeatureCollection',
    features: features,
  };

  // Add a circle layer to Mapbox with the GeoJSON data
  map.addLayer({
    id: 'address-markers',
    type: 'circle',
    source: {
      type: 'geojson',
      data: geojson, // GeoJSON data
    },
    paint: {
      'circle-radius': 10,        
      'circle-color': '#f30',     
      'circle-opacity': 0.6,      
    },
  });
}


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


        //Updating the start var
        start = [position.coords.longitude, position.coords.latitude];
        console.log(start);


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




