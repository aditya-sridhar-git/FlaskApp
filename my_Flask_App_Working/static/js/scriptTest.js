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

// Geolocation Functions
let watchId; // To store the ID for live location tracking

// Function to get the user's current location
function getLocation() {
    const locationStatus = document.getElementById('locationStatus');
    const currentLocation = document.getElementById('currentLocation');
    locationStatus.textContent = "Fetching current location...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                locationStatus.textContent = "Current location fetched successfully.";
                currentLocation.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
            },
            (error) => handleLocationError(error)
        );
    } else {
        locationStatus.textContent = "Geolocation is not supported by your browser.";
    }
}

// Function to track live location updates
function getPosition() {
    const locationStatus = document.getElementById('locationStatus');
    const liveLocation = document.getElementById('liveLocation');
    locationStatus.textContent = "Tracking live location...";

    if (navigator.geolocation) {
		//watch id is initilaised here
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                liveLocation.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
            },
            (error) => handleLocationError(error),
            { enableHighAccuracy: true }
        );
    } else {
        locationStatus.textContent = "Geolocation is not supported by your browser.";
    }
}

// Function to stop live location s
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        document.getElementById('liveLocation').textContent = "Live location tracking stopped.";
    }
}

// Handle geolocation errors
function handleLocationError(error) {
    const locationStatus = document.getElementById('locationStatus');
    switch (error.code) {
        case error.PERMISSION_DENIED:
            locationStatus.textContent = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatus.textContent = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            locationStatus.textContent = "The request to get user location timed out.";
            break;
        default:
            locationStatus.textContent = "An unknown error occurred.";
            break;
    }
}

// Variables for tracking the path and distance
let trackingInterval = null; // Interval ID for periodic tracking
let startPosition = null; //Starting position
let lastPosition = null; // Stores the last fetched latitude and longitude
let totalDistance = 0; // Stores the total distance of the opted path

// Haversine formula to calculate distance between two points in kilometers
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const toRad = (deg) => (deg * Math.PI) / 180; // Convert degrees to radians

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	console.log(dLat,dLon,a);
    return R * c; // Distance in kilometers
}

// Function to start tracking user's path every 4 minutes
function startPathTracking() {
    const locationStatus = document.getElementById('locationStatus');
	console.log(locationStatus);
    locationStatus.textContent = "Tracking your path every 10 seconds";
	console.log(locationStatus);

    if (navigator.geolocation) {
        trackingInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Check if there's a last position to calculate distance
                    if (lastPosition) {
                        const distance = haversine(
                            lastPosition.latitude,
                            lastPosition.longitude,
                            latitude,
                            longitude
                        );
                        totalDistance += distance; // Add the distance to the total
                        console.log(`New segment distance: ${distance.toFixed(3)} `); //displays distance upto fixed no of decimal places, in this case 3
                        console.log(`Total distance: ${totalDistance.toFixed(3)} `);
                    }
					else {
						startPosition = { latitude, longitude };
						console.log(`Start Lat: ${startPosition.latitude.toFixed(3)} `);
						console.log(`Start Lon: ${startPosition.longitude.toFixed(3)} `);
					}
                    // Update last position
                    lastPosition = { latitude, longitude };

                    // Update UI
                    document.getElementById('liveLocation').textContent =
                        `Current Position: Latitude: ${latitude}, Longitude: ${longitude}`;
                    document.getElementById('currentLocation').textContent =
                        `Total Distance Traveled: ${totalDistance.toFixed(3)} km`;
                },
                (error) => handleLocationError(error)
            );
        }, 10 * 1000); // 4 minutes interval
    } else {
        locationStatus.textContent = "Geolocation is not supported by your browser.";
    }
}

// Function to stop tracking the path
function stopPathTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval); // Stop the interval
        trackingInterval = null;
        document.getElementById('locationStatus').textContent = "Path tracking stopped.";
        console.log("Final total distance:", totalDistance.toFixed(3), "km");
		
		saveOptedPath();
    }
}

// Example of how to handle geolocation errors
function handleLocationError(error) {
    const locationStatus = document.getElementById('locationStatus');
    switch (error.code) {
        case error.PERMISSION_DENIED:
            locationStatus.textContent = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatus.textContent = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            locationStatus.textContent = "The request to get user location timed out.";
            break;
        default:
            locationStatus.textContent = "An unknown error occurred.";
            break;
    }
}

// Add buttons in HTML to control tracking
document.getElementById('destinationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const startingDestination = document.getElementById('startingDestination').value;
    const endingDestination = document.getElementById('endingDestination').value;

    if (!startingDestination || !endingDestination) {
        alert('Please enter both starting and ending destinations!');
        return;
    }

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
        document.getElementById('destinationForm').reset();
    }
});

function saveOptedPath() {
    if (totalDistance >= 0) {
		
		const vehicleType = document.getElementById('vehicleType').value;
		const fuelType = document.getElementById('fuelType').value;
        const optedPathData = {
			vehicleType : vehicleType,
			fuelType : fuelType,
			startLat : startPosition.latitude.toFixed(3),
			startLon : startPosition.longitude.toFixed(3),
			endLat : lastPosition.latitude.toFixed(3),
			endLon : lastPosition.longitude.toFixed(3),
			totalDistance: totalDistance.toFixed(3) // Send the total distance
        };

        fetch('/save-opted-path', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(optedPathData),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Opted path and distance saved successfully!");
                    alert("Your opted path has been saved.");
                } else {
                    console.error("Failed to save the opted path.");
                    alert("Error: Could not save your opted path.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    } else {
        alert("No path tracked to save!");
    }
}


