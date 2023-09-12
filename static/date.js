
// STYLING OF WEBPAGE
// Get the current date
const currentDate = new Date();

// Format the date as desired (e.g., "Month Day, Year")
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = currentDate.toLocaleDateString('en-US', options);

// Update the HTML element with the current date
const currentDateElement = document.getElementById('currentDate');
currentDateElement.textContent = formattedDate;