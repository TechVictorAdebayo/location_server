const express = require('express');
const axios = require('axios');

const app = express();

app.get('/api/hello', async (req, res) => {
    const visitor_name = req.query.visitor_name || 'Visitor';
    const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const ip_info = await fetchLocationInfo(client_ip);
        const { city, region, country } = ip_info;

        // Default values if location is unknown
        const location = city ? `${city}, ${region}, ${country}` : 'Unknown';
        const greeting = `Hello, ${visitor_name}!, the temperature is ${ip_info.temperature} degrees Celsius in ${location}`;

        res.json({
            client_ip: client_ip,
            location: location,
            greeting: greeting
        });
    } catch (error) {
        console.error('Failed to fetch location:', error.message);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
});

async function fetchLocationInfo(ip) {
    try {
        const ip_response = await axios.get(`https://ipinfo.io/${ip}/json`);
        const { city, region, country } = ip_response.data;
        const weather_api_key = '6a73bcfe977d032a2dd50164c19fbedc'; 
        const weather_response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_api_key}&units=metric`);
        const temperature = weather_response.data.main.temp;

        return { city, region, country, temperature };
    } catch (error) {
        console.error(`Error fetching IP or weather info for ${ip}:`, error.message);
        throw error; 
    }
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
