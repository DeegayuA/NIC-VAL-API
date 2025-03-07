const express = require('express');
const fetch = require('node-fetch'); 
const cors = require('cors');

const app = express();
const ipinfoToken = 'a656d399b8381d';
const expectedNicVal = 'NIC-VAL';

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());


app.get('/test-url', async (req, res) => {
    const { id, nicVal, ip } = req.query;
    // Authentication Check
    if (nicVal !== expectedNicVal) {
        return res.status(401).json({ error: 'Authentication Failed: Invalid NIC-VAL' });
    }

    // Extract NIC data
    let nicData = {};

    if (isValidOldNIC(id)) {
        nicData = extractOldNICData(id);
    } else if (isValidNewNIC(id)) {
        nicData = extractNewNICData(id);
    } else {
        return res.status(400).json({ error: 'Invalid NIC Number' });
    }

    // IP info - check if the IP is passed as a query parameter
    let ipData = {};
    if (ip) {
        // If an IP is passed, return it in the response
        try {
            ipData = await fetchIPInfo(ip);
        } catch (error) {
            return res.status(500).json({ error: `Failed to fetch IP information: ${error.message}` });
        }
    } else {
        // Otherwise, fetch IP info using ipinfo
        try {
            ipData = await fetchIPInfo();
        } catch (error) {
            return res.status(500).json({ error: `Failed to fetch IP information: ${error.message}` });
        }
    }

    // Combine NIC data and IP info
    const combinedData = { ...nicData, ...ipData };

    // Send JSON response
    res.json(combinedData);
});

// Utility functions for NIC validation and extraction
function isValidOldNIC(nic) {
    return /^\d{9}[VX]$/i.test(nic);
}

function isValidNewNIC(nic) {
    return /^\d{12}$/.test(nic);
}

function extractOldNICData(nic) {
    const formattedNIC = nic.toUpperCase();
    const birthYear = '19' + formattedNIC.substring(0, 2);
    let birthDayOfYear = parseInt(formattedNIC.substring(2, 5));
    const serialNumber = formattedNIC.substring(5, 8);
    const checkDigit = formattedNIC.charAt(8);
    const votingEligibility = formattedNIC.charAt(9) === 'V';
    const isFemale = birthDayOfYear > 500;
    if (isFemale) {
        birthDayOfYear -= 500;
    }
    const gender = isFemale ? 'Female' : 'Male';
    const birthDay = getBirthDate(birthYear, birthDayOfYear);

    return {
        NIC: {
            valid: true,
            formatted: formattedNIC,
            birthYear: birthYear,
            birthDayOfYear: String(birthDayOfYear).padStart(3, '0'),
            birthDay: birthDay,
            gender: gender,
            votingEligibility: votingEligibility,
            serialNumber: serialNumber,
            checkDigit: checkDigit
        }
    };
}

function extractNewNICData(nic) {
    const birthYear = nic.substring(0, 4);
    let birthDayOfYear = parseInt(nic.substring(4, 7));
    const serialNumber = nic.substring(7, 11);
    const checkDigit = nic.substring(11);
    const votingEligibility = 'Unknown';

    const isFemale = birthDayOfYear > 500;

    if (isFemale) {
        birthDayOfYear -= 500;
    }
    const gender = isFemale ? 'Female' : 'Male';
    const birthDay = getBirthDate(birthYear, birthDayOfYear);

    return {
        NIC: {
            valid: true,
            formatted: nic,
            birthYear: birthYear,
            birthDayOfYear: String(birthDayOfYear).padStart(3, '0'),
            birthDay: birthDay,
            gender: gender,
            votingEligibility: votingEligibility,
            serialNumber: serialNumber,
            checkDigit: checkDigit
        }
    };
}

function getBirthDate(year, dayOfYear) {
    let d_array = [
        { month: 'January', days: 31 },
        { month: 'February', days: 29 },
        { month: 'March', days: 31 },
        { month: 'April', days: 30 },
        { month: 'May', days: 31 },
        { month: 'June', days: 30 },
        { month: 'July', days: 31 },
        { month: 'August', days: 31 },
        { month: 'September', days: 30 },
        { month: 'October', days: 31 },
        { month: 'November', days: 30 },
        { month: 'December', days: 31 },
    ];

    let monthNumber = 0;
    let day = 0;

    for (let i = 0; i < d_array.length; i++) {
        if (dayOfYear <= d_array[i].days) {
            monthNumber = i + 1;
            day = dayOfYear;
            break;
        }
        dayOfYear -= d_array[i].days;
    }

    return `${String(day).padStart(2, '0')}${String(monthNumber).padStart(2, '0')}${year}`;
}

async function fetchIPInfo(ip = null) {
    try {
        let url = `https://ipinfo.io${ip ? `/${ip}` : ''}?token=${ipinfoToken}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();

        console.log('IP Info Response:', data); // Log the response for debugging

        return {
            IP: {
                ip: data.ip,
                city: data.city || 'Unknown',
                region: data.region || 'Unknown',
                country: data.country || 'Unknown',
                location: {
                    latitude: data.loc ? data.loc.split(',')[0] : 'Unknown',
                    longitude: data.loc ? data.loc.split(',')[1] : 'Unknown'
                },
                organization: data.org || 'Unknown'
            }
        };
    } catch (error) {
        console.error("Error fetching IP info:", error);
        throw new Error('Failed to fetch IP information');
    }
}
// Start the server
const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
