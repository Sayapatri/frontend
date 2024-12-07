// app.js

document.getElementById('alert-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form submission

    // Get user inputs
    const email = document.getElementById('email').value;
    const cryptocurrency = document.getElementById('cryptocurrency').value;
    const threshold = document.getElementById('threshold').value;

    // Simple validation for required fields
    if (!email || !cryptocurrency || !threshold) {
        displayMessage('All fields are required!', 'error');
        return;
    }

    // Prepare data to be sent to the backend API
    const data = {
        email: email,
        cryptocurrency: cryptocurrency,
        threshold: threshold
    };

    // Send the request to the backend API
    fetch('http://localhost:3000/add-alert', {  // Adjust the URL as per your backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        // Check if alert was successfully added
        if (data.message === 'Alert added successfully!') {
            displayMessage('Alert set successfully!', 'success');
        } else {
            displayMessage('Error setting alert. Please try again.', 'error');
        }
    })
    .catch(error => {
        displayMessage('Error: ' + error.message, 'error');
    });
});

// Function to display success/error messages
function displayMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.classList.remove('success', 'error');  // Remove any previous message class
    messageBox.classList.add(type);  // Add the appropriate class based on message type
    messageBox.textContent = message;
    messageBox.style.display = 'block';  // Display the message box
}
