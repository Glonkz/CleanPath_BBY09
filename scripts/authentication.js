// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

//Function to get current date.
function getCurrentDate() {
    return firebase.firestore.Timestamp.fromDate(new Date());
}

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            var user = authResult.user;
            console.log("Succesful sign-in for user: ", user.id);

            //Data to update fireStore
            const userData = {
                name: user.displayName,
                email: user.email,
                lastSignInDate: getCurrentDate(),
                weeklyCarbonScore: "0000",
                currentCarbonScore: "000",
                day: "Sunday"
            };

            if (authResult.additionalUserInfo.isNewUser) {
                db.collection("users").doc(user.uid).set(userData)
                .then(() => {
                    console.log("New user added to Firestore");
                    window.location.assign("main.html");
                })
                    .catch((error) => {
                        console.error("Error adding user: ", error);
                    });
            } else {
                db.collection("users").doc(user.uid).update({
                    email: user.email,
                    lastSignInDate: getCurrentDate(),
                    weeklyCarbonScore: "new_value",
                    currentCarbonScore: "new_value"
                })
                    .then(() => {
                        console.log("Existing user data updated");
                        window.location.assign("main.html");
                    })
                    .catch((error) => {
                        console.error("Error updating existing user: ", error);

                        //Create doc if use doesn't exist
                        if (error.code === "not-found") {
                            db.collection("users").doc(user.uid).set(userData)
                                .then(() => {
                                    console.log("Created document for existing user");
                                    window.location.assign("main.html");
                                });
                        }
                    });
            }
            return false;
        },
        uiShown: function () {
            document.getElementById('loader').style.display = 'none';
        }
    },

    signInFlow: 'popup',
    signInSuccessUrl: "main.html",
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    tosUrl: '<your.tos.url>',
    privacyPolicyUrl: '<your-privacy-policy-url>'
};

ui.start('#firebaseui-auth-container', uiConfig);