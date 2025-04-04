function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console
            console.log(user.displayName); //print the user name in the browser console
            const userName = user.displayName;

            const nameElement = document.querySelector("#name-goes-here");
            if (nameElement) {
                nameElement.innerText = userName;
            } else {
                console.log("Element not found in DOM.")
            }
        } else {
            // No user is signed in.
            console.log("No user is logged in");
        }
    });
}
getNameFromAuth(); //run the function


