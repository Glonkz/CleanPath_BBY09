// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

//Function to get current date.
function getCurrentDate() {
    return firebase.firestore.Timestamp.fromDate(new Date());
}

//Function to set the current day of users time.
function getDayOfWeek(date) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

//Function to set the current day
function getCurrentDay() {
    return getDayOfWeek(new Date());
}

//Function to check if it's a Sunday or if it has passed a Sunday
function hasSundayPassed(lastSignInDate, currentDate) {
    const lastDayIndex = lastSignInDate.getDay();
    const currentDayIndex = currentDate.getDay();

    if (lastDayIndex !== 0 && currentDayIndex !== 0 && lastDayIndex > currentDayIndex) {
        return true;
    }

    //Same day = no change
    if (lastDayIndex === currentDayIndex) {
        return false;
    }

    if (currentDayIndex === 0) {
        return true;
    }
    return false;
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
                weeklyCarbonScore: "0.000",
                currentCarbonScore: "0.000",
                totalCarbonScore: "0.000",
                day: getCurrentDay()
            };

            const userRef = db.collection("users").doc(user.uid);

            if (authResult.additionalUserInfo.isNewUser) {
                //Creates their new document for a new user
                userRef.set(userData)
                    .then(() => {
                        console.log("New user added to Firestore");
                        window.location.assign("main.html");
                    })
                    .catch((error) => {
                        console.error("Error adding user: ", error);
                    });
            } else {
                //Checks if we need to reset weeklyCarbonScore and currentScore
                db.runTransaction(transaction => {
                    return transaction.get(userRef).then(doc => {
                        if (!doc.exists) {
                            //If the document doesn't exist, create it
                            transaction.set(userRef, userData);
                            return;
                        }

                        const data = doc.data();
                        const lastSignInDate = data.lastSignInDate ? data.lastSignInDate.toDate() : new Date();
                        const currentDate = new Date();
                        const today = getCurrentDay();
                        let weeklyCarbonScore = parseFloat(data.weeklyCarbonScore) || 0;

                        //Resetting the weekly carbonscore if it's a Sunday or has passed a Sunday
                        if (today === "Sunday" || hasSundayPassed(lastSignInDate, currentDate)) {
                            weeklyCarbonScore = 0;
                            console.log("Resetting weeklyCarbonScore because it's Sunday or a Sunday has passed!");
                        }

                        //Resetting currentScore every sign in.
                        const currentCarbonScore = 0; //Since sunday is reset, 0 is a sunday.

                        // Updating the user's document
                        transaction.update(userRef, {
                            email: user.email,
                            lastSignInDate: getCurrentDate(),
                            day: today,
                            weeklyCarbonScore: weeklyCarbonScore.toFixed(3),
                            currentCarbonScore: currentCarbonScore.toFixed(3)
                        });
                    });
                })
                    .then(() => {
                        console.log("Existing user data updated");
                        window.location.assign("main.html");
                    })
                    .catch((error) => {
                        console.error("Error updating existing user: ", error);
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
    ]
};

ui.start('#firebaseui-auth-container', uiConfig);