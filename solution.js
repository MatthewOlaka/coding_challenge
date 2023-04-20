const Papa = require('papaparse');
const fs = require('fs');

// Read the CSV file contents
const csv = fs.readFileSync('./cities_all.csv', 'utf8');

// Parse the CSV data
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true, });

// Map the parsed data to the desired format
const cities = parsed.data.map((row) => ({
    city: row.City,
    latitude: parseFloat(row.Latitude),
    longitude: parseFloat(row.Longitude),
}));

//console.log(cities);

//Function that uses the Haversine formula to calculate the distance btw 2 cities 
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

// Function to find the nearest city to a given city
const nearestCity = (city, unvisitedCities) => {
    let nearest;
    let nearestDistance = Infinity;
    //get the shortest distance by comparing distances of all unselected cities
    for (let unvisitedCity of unvisitedCities) {
        const dist = getDistanceFromLatLonInKm(city.latitude, city.longitude, unvisitedCity.latitude, unvisitedCity.longitude);
        //nearestDistance = Math.min(nearestDistance, dist)
        if (dist < nearestDistance) {
            nearest = unvisitedCity;
            nearestDistance = dist;
        }
    }
    return nearest;
}

// Function to solve the problem
const solve = (cities) => {
    const sanFran = cities[0];

    cities.shift();

    const unvisitedCities = cities;

    let currentCity = sanFran;
    const route = [sanFran];
    let totalDistance = 0;

    //Loop to select the closest city the add the distance travelled
    while (unvisitedCities.length > 0) {
        const nearest = nearestCity(currentCity, unvisitedCities);
        route.push(nearest);
        totalDistance += getDistanceFromLatLonInKm(currentCity.latitude, currentCity.longitude, nearest.latitude, nearest.longitude);
        unvisitedCities.splice(unvisitedCities.indexOf(nearest), 1);
        currentCity = nearest;
    }

    //Add the distance back to San Francisco
    totalDistance += getDistanceFromLatLonInKm(currentCity.latitude, currentCity.longitude, sanFran.latitude, sanFran.longitude);
    route.push(sanFran);
    //route.unshift();

    let selectedCities = '';
    for (city of route) {
        selectedCities += city.city + '\n';
    }
    console.log(selectedCities);
    console.log(Math.ceil(totalDistance));
}

solve(cities);
