// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

//Function to get current date.
function getCurrentDate() {
    return new Date().toISOString();
}

//Function to set the current day of users time.
function getCurrentDay() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const current = new Date();
    return days[current.getDay()];
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
                totalCarbonScore: "0000",
                day: getCurrentDay()
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
                    weeklyCarbonScore: "0",
                    currentCarbonScore: "0",
                    totalCarbonScore: "0",
                    day: getCurrentDay()
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