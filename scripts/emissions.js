//Emisson factor (kg, C02/L)
const emissionFactors = {
    gasoline: 2.31,
    diesel: 2.68
};

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
function report(){
    const btn = document.getElementById("reportForm");
    const txt = document.getElementById("address");
    //we cant add a databse but this button onclick would
    //add the string inputed into the address into the database
    btn.onclick();
}