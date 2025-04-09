// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4kuT4aLxMXiISIXeh69sdrm5j1wX76v8",
  authDomain: "project-4733898421564278648.firebaseapp.com",
  projectId: "project-4733898421564278648",
  storageBucket: "project-4733898421564278648.firebasestorage.app",
  messagingSenderId: "431572669958",
  appId: "1:431572669958:web:cdb5a7994b6d7370465587",
  measurementId: "G-D6NDNH3Y65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = firebase.firestore();
const auth = getAuth(app); 

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

