document.addEventListener("DOMContentLoaded", () => {
    function getNameFromAuth() {
        if (window.location.pathname.includes("main.html")) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log(user.uid);
                    console.log(user.displayName);
                    const userName = user.displayName;

                    // Display the name
                    const nameElement = document.querySelector("#name-goes-here");
                    if (nameElement) {
                        nameElement.innerText = userName;
                    } else {
                        console.error("Element with ID 'name-goes-here' not found!");
                    }

                    // Fetch and display carbon scores from Firestore
                    const db = firebase.firestore();
                    db.collection("users").doc(user.uid).get()
                        .then(doc => {
                            if (doc.exists) {
                                const data = doc.data();

                                // Get the carbon scores (stored as strings in Firestore)
                                const currentCarbonScore = data.currentCarbonScore || "0.00";
                                const weeklyCarbonScore = data.weeklyCarbonScore || "0.00";
                                const totalCarbonScore = data.totalCarbonScore || "0.00";

                                // Display the scores in the corresponding <p> elements
                                const currentScoreElement = document.querySelector("#currentCarbonScore");
                                const weeklyScoreElement = document.querySelector("#weeklyCarbonScore");
                                const totalScoreElement = document.querySelector("#totalCarbonScore");

                                if (currentScoreElement) {
                                    currentScoreElement.innerText = `Current Carbon Score: ${currentCarbonScore} kg CO₂`;
                                } else {
                                    console.error("Element with ID 'currentCarbonScore' not found.");
                                }

                                if (weeklyScoreElement) {
                                    weeklyScoreElement.innerText = `Weekly Carbon Score: ${weeklyCarbonScore} kg CO₂`;
                                } else {
                                    console.error("Element with ID 'weeklyCarbonScore' not found.");
                                }

                                if (totalScoreElement) {
                                    totalScoreElement.innerText = `Total Carbon Score: ${totalCarbonScore} kg CO₂`;
                                } else {
                                    console.error("Element with ID 'totalCarbonScore' not found.");
                                }
                            } else {
                                console.error("User document does not exist in Firestore.");
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching carbon scores:", error);
                        });
                } else {
                    console.log("No user is logged in");
                }
            });
        }
    }
    getNameFromAuth();
});