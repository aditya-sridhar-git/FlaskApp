document.getElementById('destinationForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent form from submitting and page reload
    
    const startingDestination = document.getElementById('startingDestination').value;
    const endingDestination = document.getElementById('endingDestination').value;

    // Check if fields are empty
    if (!startingDestination || !endingDestination) {
        alert('Please enter both starting and ending destinations!');
        return;
    }

    // Send the form data to the backend (Python Flask server)
    const response = await fetch('/submit_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startingDestination: startingDestination,
            endingDestination: endingDestination
        })
    });

    const result = await response.json();
    document.getElementById('responseMessage').textContent = result.message;
    if (result.success) {
        document.getElementById('destinationForm').reset();  // Reset form after submission
    }
});