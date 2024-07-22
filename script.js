document.addEventListener('DOMContentLoaded', function() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const flightFromInput = document.getElementById('flight-from');
    const flightToInput = document.getElementById('flight-to');


    const logo = document.getElementById('site-title');
    const text = logo.textContent;
    logo.innerHTML = text.split('').map(letter => `<span>${letter}</span>`).join('');

    //sidebar
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const menuIcon = hamburgerMenu.querySelector('i');

    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        } else {
            sidebar.classList.add('open');
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        }
    }

    function closeSidebar() {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    }

    hamburgerMenu.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the click event from propagating to the document
        toggleSidebar();
    });

    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            closeSidebar();
        }
    });

    sidebar.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the click event from propagating to the document
    });


    /*ikhane tika new abar*/
    const contactToggle = document.getElementById('contact-toggle');
    const contactOptions = document.getElementById('contact-options');
    contactOptions.style.display = 'none';
    contactToggle.addEventListener('click', function() {
        event.preventDefault(); // Prevent default anchor behavior
        contactOptions.style.display = contactOptions.style.display === 'none' ? 'block' : 'none';
    });
    const tabz = document.querySelectorAll('.tabs button');
    const containers = document.querySelectorAll('.container');
    tabz.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            hideAllContainers();
            showContainer(target);
            highlightTab(tab);
        });
    });

    function hideAllContainers() {
        containers.forEach(container => {
            container.style.display = 'none';
        });
    }

    function showContainer(id) {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'block';
        }
    }

    function highlightTab(selectedTab) {
        tabz.forEach(tab => {
            tab.classList.remove('active');
        });
        selectedTab.classList.add('active');
    }
    hideAllContainers();
    showContainer('itinerary-content');
    tabz[0].classList.add('active');



    //Radio button function for return date toggle
    const oneWayRadio = document.getElementById('one-way');
    const roundTripRadio = document.getElementById('round-trip');
    const returnDateInput = document.getElementById('flight-end-date');
    returnDateInput.disabled = true;
    oneWayRadio.addEventListener('change', function() {
        returnDateInput.disabled = true; // Disable return date input for one-way
    });

    roundTripRadio.addEventListener('change', function() {
        returnDateInput.disabled = false; // Enable return date input for round-trip
    });


    //Tab switching colors
    const tabs = document.querySelectorAll('.tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove 'active' class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add 'active' class to the clicked tab
            this.classList.add('active');
        });
    });

    
    function initializeAutocomplete(input, type = 'general') {
        let airportsData = [];
        
        if (type === 'airport') {
            // Load airports data only once to optimize performance
            if (airportsData.length === 0) {
                fetch('https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json')
                    .then(response => response.json())
                    .then(data => {
                        airportsData = data;
                        setupInputListener();
                    });
            } else {
                setupInputListener();
            }
        } else {
            setupInputListener();
        }
    
        function setupInputListener() {
            input.addEventListener('input', function() {
                const query = input.value.trim();
                if (query.length > 2) { // Start searching after 3 characters
                    if (type === 'airport') {
                        const suggestions = airportsData.filter(airport =>
                            airport.name.toLowerCase().includes(query.toLowerCase()) ||
                            airport.iata_code.toLowerCase().includes(query.toLowerCase()) ||
                            airport.city.toLowerCase().includes(query.toLowerCase())
                        ).map(airport => `${airport.name} (${airport.iata_code}) - ${airport.city}`);
                        updateSuggestions(input, suggestions);
                    } else {
                        fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=90c3aa710bd746a49cca2a44e9bc8b5c`)
                            .then(response => response.json())
                            .then(data => {
                                const suggestions = data.features.map(feature => feature.properties.formatted);
                                updateSuggestions(input, suggestions);
                            });
                    }
                } else {
                    clearSuggestions(input);
                }
            });
    
            input.addEventListener('blur', function() {
                setTimeout(() => {
                    clearSuggestions(input); // Clear suggestions on blur
                }, 100); // Delay to allow click on suggestion
            });
    
            input.addEventListener('focus', function() {
                // This ensures suggestions are shown again when the input is focused
                const event = new Event('input');
                input.dispatchEvent(event);
            });
    
            input.nextElementSibling.addEventListener('click', function(e) {
                if (e.target.tagName === 'OPTION') {
                    input.value = e.target.value; // Set input value to selected option
                    clearSuggestions(input); // Clear suggestions after selection
                }
            });
        }
    }

    
    initializeAutocomplete(fromInput,'general');
    initializeAutocomplete(toInput,'general');
    initializeAutocomplete(flightFromInput,'airport');
    initializeAutocomplete(flightToInput,'airport');

    // Existing code before submit event listener
    const submitButton = document.querySelector('#travel-form button[type="submit"]');
    const resetButton = document.querySelector('#travel-form button[type="reset"]');
    submitButton.classList.add('button');
    resetButton.classList.add('button');
});

function updateSuggestions(input, suggestions) {
    const datalist = input.nextElementSibling;
    datalist.innerHTML = '';
    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
}

function clearSuggestions(input) {
    const datalist = input.nextElementSibling;
    datalist.innerHTML = ''; // Clear the datalist
}

document.getElementById('travel-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    const tripType = document.getElementById('trip-type').value;

    // Change background image based on destination
    changeBackground(to);
    
    const dayCount = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    let itinerary = `
        <h2 class="center-text">Your Itinerary</h2>
        <table>
            <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Plan for the Day</th>
                <th>Travel Mode</th>
            </tr>
    `;
    
    for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        let plan = '';
        let travelMode = '';

        if (i === 0) {
            if (calculateDistance(from, to) > 500) {
                travelMode = 'Plane';
            } else {
                travelMode = 'Train/Bus';
            }
            plan = `Travel from ${from} to ${to}`;
        } else if (i === dayCount - 1) {
            travelMode = 'Return';
            plan = `Return from ${to} to ${from}`;
        } else {
            travelMode = 'Local';
            plan = `Explore ${to} - ${getAttractions(to, tripType)}`;
        }
        
        itinerary += `
            <tr>
                <td>${currentDate.toLocaleDateString()}</td>
                <td>${currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                <td>${plan}</td>
                <td>${travelMode}</td>
            </tr>
        `;
    }
    
    itinerary += '</table>';
    
    document.getElementById('itinerary').innerHTML = itinerary;
    const itineraryResults = document.getElementById('itinerary');
    itineraryResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Function to change the background image based on destination
function changeBackground(destination) {
    const imageUrl = `https://source.unsplash.com/1600x900/?${destination}`;
    document.body.style.backgroundImage = `url(${imageUrl})`;
}

// Function to calculate distance (placeholder implementation)
function calculateDistance(from, to) {
    // For simplicity, we'll use a placeholder distance value
    return 600; // Placeholder value in kilometers
}

// Function to get unique attractions based on destination and trip type
function getAttractions(destination, tripType) {
    const attractions = {
        solo: ['Museum', 'Art Gallery', 'Park'],
        couple: ['Beach', 'Romantic Dinner', 'Sunset Point'],
        family: ['Amusement Park', 'Zoo', 'Family Picnic'],
        friends: ['Night Club', 'Concert', 'Adventure Sports']
    };

    // Return a subset of attractions based on the destination and trip type
    return attractions[tripType].map(attraction => `${attraction} in ${destination}`).join(', ');
}

// Add event listener for the reset button
document.getElementById('reset-button').addEventListener('click', function() {
    document.getElementById('travel-form').reset();
    document.body.style.backgroundImage = '';
    document.getElementById('itinerary').innerHTML = '';
});

// Event listener for the tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        showContent(this.dataset.target);
    });
});

function showContent(contentId) {
    document.querySelectorAll('.container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById(contentId).style.display = 'block';
}

// Add event listener for the reset button in flight tab
document.getElementById('flights-form').addEventListener('reset', function() {
    document.getElementById('flight-from').value = '';
    document.getElementById('flight-to').value = '';
    document.getElementById('flight-start-date').value = '';
    document.getElementById('flight-end-date').value = '';
    document.getElementById('one-way').checked = true; // Reset radio button selection to default (one-way)
    document.getElementById('passengers').selectedIndex = 0; // Reset dropdown selection to default (1 passenger)

    // Clear flights results
    document.getElementById('flights-results').innerHTML = '';
});

// Flight form handling
document.getElementById('flights-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const from = extractIataCode(document.getElementById('flight-from').value);
    const to = extractIataCode(document.getElementById('flight-to').value);
    const startDate = document.getElementById('flight-start-date').value;
    const endDate = document.getElementById('flight-end-date').value;
    const tripType = document.querySelector('input[name="trip-type"]:checked').value;
    const passengers = document.getElementById('passengers').value;

    // Generate random flights data
    fetchFlights(from, to, startDate, endDate, tripType, passengers);
    const flightsResults = document.getElementById('flights-results');
    flightsResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function extractIataCode(inputValue) {
    const match = inputValue.match(/\(([^)]+)\)/); // Matches text inside parentheses
    return match ? match[1] : inputValue; // Returns IATA code if found, otherwise returns the original input value
}

function fetchFlights(from, to, startDate, endDate, tripType, passengers) {
    const flights = [];
    const randomPrices = [2700,2900,3100,3300,3500,3800,3950,4200,4300,4400,4600,4700,4900,5100,5300,5500,5650,5750,5900,6200,6500,6760,7050,7150,7250,7400,7500,7800,8100,8400,8500];
    const randomTimes = ["06:00 AM","03:45 AM","04:10 AM", "07:40 AM", "09:00 AM", "11:15 AM", "12:00 PM", "03:00 PM", "06:00 PM", "08:00 PM", "09:30 PM", "12:10 AM", "02:25 AM", "03:45 AM", "08:55 AM", "12:40 PM", "04:25 PM", "05:20 PM", "06:00 PM", "07:45 PM", "08:30PM", "09:20 PM", "10:30 PM", "11:20 PM"];
    const randomFlightNumbers = ["6E-091", "AI-456","UK-101", "QP-789", "SG-4587","AI-1013","LH-3100","QF-7411", "QP-345", "AI-678", "EK-986", "AI-058", "UK-329","AI-9438", "6E-328", "UK-678", "SG-678", "SG-1048","6E-1300", "QP-5421", "AI-701", "6E-209", "6E-1456", "UK-416","EK-129","EY-476", "LH-1200", "6E-1500"];

    // Generate 10 random flights
    for (let i = 0; i < 10; i++) {
        const randomPrice = randomPrices[Math.floor(Math.random() * randomPrices.length)];
        const randomTime = randomTimes[Math.floor(Math.random() * randomTimes.length)];
        const randomFlightNumber = randomFlightNumbers[Math.floor(Math.random() * randomFlightNumbers.length)];

        flights.push({
            date: new Date(startDate).toLocaleDateString(),
            flightNumber: randomFlightNumber,
            from,
            to,
            price: `Rs. ${randomPrice}`,
            time: randomTime
        });
    }

    displayFlights(flights);
}

function displayFlights(flights) {
    const flightsResults = document.getElementById('flights-results');
    flightsResults.innerHTML = '';

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('results-container'); // Add class for styling

    const heading = document.createElement('h2');
    heading.textContent = 'Flight Search Results';
    heading.classList.add('center-text'); // Center the heading
    resultsContainer.appendChild(heading);

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Date</th><th>Time</th><th>Flight Number</th><th>From</th><th>To</th><th>Price</th>';
    table.appendChild(headerRow);

    flights.forEach(flight => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${flight.date}</td><td>${flight.time}</td><td>${flight.flightNumber}</td><td>${flight.from}</td><td>${flight.to}</td><td>${flight.price}</td>`;
        table.appendChild(row);
    });

    resultsContainer.appendChild(table);
    flightsResults.appendChild(resultsContainer);
}

