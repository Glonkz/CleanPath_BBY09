//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyApjGBSOVFNzFrkrWU4eVyVNaQOXE-6WAY",
    authDomain: "project09-c92d7.firebaseapp.com",
    projectId: "project09-c92d7",
    storageBucket: "project09-c92d7.firebasestorage.app",
    messagingSenderId: "581821368076",
    appId: "1:581821368076:web:03c98c11ea7498d5f56b29",
    measurementId: "G-70FST6CSW0"
};
var mapApiConfig = {

    "mapsKey": "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    "routingKey": "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy>",
    "searchKey": "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    "trafficIncidentsKey": "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    "trafficFlowKey": "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy",
    "extendedSearchKey": "5qP3u3nzaMr72TQtAvpMKoMDHEpl9Ljy"

}

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();