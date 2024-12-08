const token = localStorage.getItem('token');

// Redirect if not logged in
if (!token) {
    alert('Please log in first.');
    window.location.href = 'login.html';
}

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Logged out successfully.');
    window.location.href = 'login.html';
});

// Fetch user alerts
async function fetchAlerts() {
    const response = await fetch('https://crypto-alert-620r.onrender.com:3000/alerts/user', {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
        const alertsList = document.getElementById('alerts');
        alertsList.innerHTML = '';
        data.alerts.forEach(alert => {
            const li = document.createElement('li');
            li.className = 'alert-item';
            li.innerHTML = `
                <span>${alert.cryptocurrency}: $${alert.threshold}</span>
                <button class="delete-btn" data-id="${alert.id}">Delete</button>
            `;
            alertsList.appendChild(li);
        });

        // Attach event listeners to the delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => deleteAlert(button.dataset.id));
        });
    } else {
        alert(`Error fetching alerts: ${data.message}`);
    }
}

// Add new alert
document.getElementById('alert-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cryptocurrency = document.getElementById('cryptocurrency').value;
    const threshold = document.getElementById('threshold').value;

    const response = await fetch('http://localhost:3000/alerts/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cryptocurrency, threshold }),
    });

    const data = await response.json();

    if (response.ok) {
        alert('Alert added successfully!');
        fetchAlerts();
    } else {
        alert(`Error adding alert: ${data.message}`);
    }
});

// Delete alert
async function deleteAlert(alertId) {
    const response = await fetch(`http://localhost:3000/alerts/delete/${alertId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (response.ok) {
        alert('Alert deleted successfully!');
        fetchAlerts();
    } else {
        alert(`Error deleting alert: ${data.message}`);
    }
}

// Initial fetch
fetchAlerts();

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // JWT token stored after login

    if (!token) {
        alert('Please log in to access the dashboard.');
        window.location.href = '/login.html';
        return;
    }

    try {
        // Fetch user details
        const response = await fetch('http://localhost:3000/auth/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const userData = await response.json();

        if (!response.ok) {
            throw new Error(userData.message || 'Failed to fetch user details.');
        }

        // Display user details
        document.getElementById('username').textContent = userData.username;
        document.getElementById('userPlan').textContent = userData.user_type;

        // Show upgrade button only for Basic users
        if (userData.user_type === 'basic') {
            document.getElementById('upgradeButton').style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        alert('Failed to load dashboard. Please try again.');
    }
});


document.getElementById('upgradeButton').addEventListener('click', async () => {
    const token = localStorage.getItem('token');

    try {
        // Create payment intent
        const response = await fetch('http://localhost:3000/auth/upgrade/payment', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const { clientSecret } = await response.json();

        if (!response.ok) {
            throw new Error('Failed to initiate upgrade.');
        }

        // Load Stripe.js
        const stripe = await Stripe('pk_test_51LYdHdD4CuJW86jL5tiIZ6EaUKsHwutlCswOjdOI3lmXxyNYGOiMDk2K3FJydN42ZyydI5S4JZ2p1SjYhyTN72ro00Hj3w9CTf'); // Replace with your Stripe publishable key

        // Display Stripe Elements
        const elements = stripe.elements();
        const cardElement = elements.create('card');
        document.body.innerHTML = ''; // Replace dashboard content with payment form
        document.body.innerHTML = `
           <h1>Upgrade to Premium</h1>
    <form id="paymentForm" style="
        max-width: 910px; /* Increased form width */
        width: 25%; /* Ensures it occupies the full width */
        margin: 50px auto; 
        padding: 40px; 
        background: #1e272e; 
        border-radius: 16px; 
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); 
        font-family: Arial, sans-serif;
        font-size: 18px;
    ">
    <div style="margin-bottom: 30px;">
        <label for="cardElement" style="
            display: block; 
            font-weight: bold; 
            color: white;
            margin-bottom: 10px; 
            font-size: 20px;
        ">
            Credit Card Details
        </label>
        <div id="cardElement" style="
            padding: 10px; 
            border: 2px solid #ccc; 
            border-radius: 8px; 
            font-size: 18px;
            width: 98%; 
            max-width: 900px; /* Further increased card input field width */
            margin: 0 auto; /* Centers the card element */
        "></div>
    </div>
    <button type="submit" style="
        width: 50%; 
        padding: 15px; 
        background: #007bff; 
        color: white; 
        border: none; 
        border-radius: 8px; 
        font-size: 20px; 
        font-weight: bold; 
        cursor: pointer;
        transition: background 0.3s ease;
        margin: 0 auto;
    ">
        Pay $2.99
    </button>
</form>
        `;
        cardElement.mount('#cardElement');

        // Handle form submission
        const paymentForm = document.getElementById('paymentForm');
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                alert('Payment failed: ' + error.message);
            } else if (paymentIntent.status === 'succeeded') {
                // Confirm upgrade on the backend
                const confirmResponse = await fetch('http://localhost:3000/auth/upgrade/confirm', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
                });

                const confirmData = await confirmResponse.json();

                if (!confirmResponse.ok) {
                    throw new Error(confirmData.message || 'Failed to confirm upgrade.');
                }

                alert('Upgrade successful!');
                window.location.reload(); // Reload dashboard to show updated plan
            }
        });
    } catch (error) {
        console.error('Error upgrading to Premium:', error.message);
        alert(error.message);
    }
});
