//---------------------------------
// Your own functions here
//---------------------------------

function sayHello() {
    //do something
}
//sayHello();    //invoke function

//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
        
    }).catch((error) => {
        console.error("An error during logout: ", error);
        // An error happened.
    });
}