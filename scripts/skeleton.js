//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {

    onAuthStateChanged(auth, function(user) {
        if (user) {
          console.log("User is signed in:", user);
        } else {
          console.log("No user is signed in.");
        }
      });
}
loadSkeleton(); //invoke the function