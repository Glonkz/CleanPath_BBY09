// Import Firestore functions from Firebase
import { collection, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { db } from './firebaseAPI_TEAM99.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getFirestore} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

//Emisson factor (kg, C02/L)
const emissionFactors = {
    gasoline: 2.31,
    diesel: 2.68
};

//Function to update Firestore with th new carbon scores
function updateCarbonScores(emissions) {
    const user = firebase.auth().currentUser;
    const userId = user.uid;
    const userRef = db.collection("users").doc(userId);

    //Updating the scores
    db.runTransaction(transaction => {
        return transaction.get(userRef).then(doc => {
            const data = doc.data();
            const currentCarbonScore = parseFloat(data.currentCarbonScore) || 0;
            let weeklyCarbonScore = parseFloat(data.weeklyCarbonScore) || 0;
            const totalCarbonScore = parseFloat(data.totalCarbonScore) || 0;
            const lastUpdated = data.lastUpdated ? data.lastUpdated.toDate() : new Date();
            const lastDay = data.day || "Sunday"; // Get the last recorded day

            //Checking if the day is Sunday to reset score.
            const now = new Date();
            const todayDay = now.getDay();
            const isReset = todayDay === 0; // 0 represents Sunday
            const hasDayChanged = lastDay !== getCurrentDay(); //Checking if day changed since last update.

            //Resetting if day IS Sunday with 'if' statement :)
            if (isReset && hasDayChanged) {
                weeklyCarbonScore = 0;
                console.log("Resetting weeklyCarbonScore.");
            }

            //New scores
            const newCurrentCarbonScore = currentCarbonScore + emissions;
            const newWeeklyCarbonScore = weeklyCarbonScore + emissions;
            const newTotalCarbonScore = totalCarbonScore + emissions;

            //Update the current doc
            transaction.update(userRef, {
                currentCarbonScore: newCurrentCarbonScore.toFixed(2),
                weeklyCarbonScore: newWeeklyCarbonScore.toFixed(2),
                totalCarbonScore: newTotalCarbonScore.toFixed(2),
                lastUpdated: firebase.firestore.Timestamp.fromDate(now),
                day: getCurrentDay()
            });
            return { newCurrentCarbonScore, newWeeklyCarbonScore, newTotalCarbonScore };
        });
    })
}

function getCurrentDay() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    return days[today.getDay()];
}


//Getting the selected fuel type
function calculateEmissions() {
    const fuelRadioButton = document.querySelectorAll('input[name="fuelType"]:checked');

    //Checks if there is nothing selected, if so, alert the user
    if (fuelRadioButton.length === 0) {
        alert("Please choose a fuel type");
        return;
    }
    const fuelType = fuelRadioButton[0].value;

    //Getting the fuel consumption and distance
    const consumption = parseFloat(document.getElementById("consumption").value);
    const distance = parseFloat(document.getElementById("distance").value);


    //If consumption/distance is not a number
    if (isNaN(consumption) || isNaN(distance)) {
        alert("Please enter a valid number");
        return;
    }

    //Calculating the emissions
    const emissionFactor = emissionFactors[fuelType];
    const emissions = (consumption * emissionFactor * distance) / 100;

    //Display results
    document.getElementById("carbonResults").innerText = `Carbon Emissions: ${emissions.toFixed(2)} kg C0₂`;

    updateCarbonScores(emissions);
}

//Reset form Button
function resetForm() {

    //Clearing checkboxes
    const fuelRadioButton = document.querySelectorAll('input[name="fuelType"]');
    fuelRadioButton.forEach(checkbox => (checkbox.checked = false));

    //Clearing input fields
    document.getElementById("consumption").value = "";
    document.getElementById("distance").value = "";

    //Clear result text
    document.getElementById("carbonResults").innerText = "";
}



//function to make the report system work
async function report() {
    const txt = document.getElementById("address");
    const streetAddress = txt.value;

    if (streetAddress != null){
        try {
            // Get Firestore collection reference
            const reportsCollection = collection(db, "reports");
    
            // Add the document to Firestore
            await addDoc(reportsCollection, {
                street: streetAddress,
                timestamp: Timestamp.fromDate(new Date()) // Firestore will handle the timestamp
            });
    
            console.log("Report successfully saved!");
            console.log("Street Address: ", streetAddress);
    
        } catch (error) {
            console.error("Error saving report: ", error);
        }
    } else {
        console.log("no address")
    }

    
}

const repButn = document.getElementById("reportForm");
repButn.addEventListener("click", report)

//Needs work, dont put code at the top unless it works.
//Messes up the calculate button for emissions.

