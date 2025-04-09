var currentUser;          //put this right after you start script tag before writing any functions.

var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
    // Use onAuthStateChanged with the new modular API
    onAuthStateChanged(auth, (user) => {
      // Check if the user is signed in
      if (user) {
        // Reference to the user's document in Firestore
        const currentUser = doc(db, "users", user.uid);
        
        // Get the user document
        getDoc(currentUser)
          .then((userDoc) => {
            // Check if the document exists and retrieve the data
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userName = userData.name;
              const userCity = userData.city;

              // If the fields are not empty, populate the form
              if (userName) {
                document.getElementById("nameInput").value = userName;
              }
              if (userCity) {
                document.getElementById("cityInput").value = userCity;
              }
            } else {
              console.log("No user document found.");
            }
          })
          .catch((error) => {
            console.error("Error getting user document: ", error);
          });
      } else {
        // No user is signed in
        console.log("No user is signed in");
      }
    });
  }

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    //a) get user entered values
    userName = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    userCity = document.getElementById('cityInput').value;       //get the value of the field with id="cityInput"

    //b) update user's document in Firestore
    currentUser.update({
        name: userName,
        city: userCity
    })
        .then(() => {
            console.log("Document successfully updated!");
        })

    //c) disable edit 
    document.getElementById('personalInfoFields').disabled = true;
}