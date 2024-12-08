const stripe = Stripe('pk_test_51LYdHdD4CuJW86jL5tiIZ6EaUKsHwutlCswOjdOI3lmXxyNYGOiMDk2K3FJydN42ZyydI5S4JZ2p1SjYhyTN72ro00Hj3w9CTf');

document.getElementById('checkout-button').addEventListener('click', async () => {
    const response = await fetch('https://crypto-alert-620r.onrender.com/payment/create-checkout-session', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const session = await response.json();
    const { sessionId } = session;

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
        console.error(result.error.message);
    }
});
