import { getFirestore, collection, addDoc, Timestamp, getDocs } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
  apiKey: "AIzaSyD4kuT4aLxMXiISIXeh69sdrm5j1wX76v8",
  authDomain: "project-4733898421564278648.firebaseapp.com",
  projectId: "project-4733898421564278648",
  storageBucket: "project-4733898421564278648.firebasestorage.app",
  messagingSenderId: "431572669958",
  appId: "1:431572669958:web:cdb5a7994b6d7370465587",
  measurementId: "G-D6NDNH3Y65"
};
var mapApiConfig = {
    mapsKey: "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    routingKey: "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy>",
    searchKey: "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    trafficIncidentsKey: "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    trafficFlowKey: "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    extendedSearchKey: "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    mapboxgl: {
      accessToken: "pk.eyJ1IjoianByaWNlOTE2IiwiYSI6ImNtODU0cWd1ODAwaDAybW9kNGJmdmcxdGwifQ.SzEpTyJxWWgcEt8cG2oF_A"
  }
}

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (if using Firestore)
const db = getFirestore(app);

export {db};