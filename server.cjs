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

    // Validate the day of the year for old NICs (valid range 1-366, no 367-499 or 867-999)
    if (birthDayOfYear < 1 || birthDayOfYear > 366 || (birthDayOfYear > 499 && birthDayOfYear < 867)) {
        return { error: "Invalid day of year" };
    }

    const gender = isFemale ? 'Female' : 'Male';
    const birthDay = getBirthDate(birthYear, birthDayOfYear);

    // Ensure birthdate is before today's date
    if (new Date(birthDay) >= new Date()) {
        return { error: "Birthdate cannot be today or in the future" };
    }

    // Calculate age
    const age = calculateAge(birthDay);

    // Validate age to be at least 15 years old
    if (age < 15) {
        return { error: "Person must be at least 15 years old" };
    }

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
            checkDigit: checkDigit,
            age: age,
        }
    };
}

function extractNewNICData(nic) {
    const birthYear = nic.substring(0, 4);
    let birthDayOfYear = parseInt(nic.substring(4, 7));
    const serialNumber = nic.substring(7, 11);
    const checkDigit = nic.substring(11);
    const votingEligibility = 'Unknown';

    // Validate the day of the year for new NICs (valid range 1-366, no 367-499 or 867-999)
    if (birthDayOfYear < 1 || birthDayOfYear > 366 || (birthDayOfYear > 499 && birthDayOfYear < 867)) {
        return { error: "Invalid day of year" };
    }

    const isFemale = birthDayOfYear > 500;

    if (isFemale) {
        birthDayOfYear -= 500;
    }
    const gender = isFemale ? 'Female' : 'Male';
    const birthDay = getBirthDate(birthYear, birthDayOfYear);

    // Ensure birthdate is before today's date
    if (new Date(birthDay) >= new Date()) {
        return { error: "Birthdate cannot be today or in the future" };
    }

    // Calculate age
    const age = calculateAge(birthDay);

    // Validate age to be at least 15 years old
    if (age < 15) {
        return { error: "Person must be at least 15 years old" };
    }

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
            checkDigit: checkDigit,
            age: age // Add age to the output
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

function calculateAge(birthDay) {
    // Extract day, month, and year from the birth date string in DDMMYYYY format
    const day = parseInt(birthDay.substring(0, 2), 10);
    const month = parseInt(birthDay.substring(2, 4), 10) - 1; // Months are 0-indexed
    const year = parseInt(birthDay.substring(4, 8), 10);

    // Create a Date object from the parsed values
    const birthDate = new Date(year, month, day);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

async function fetchIPInfo(ip = null) {
    try {
        let url = "https://ipinfo.io" + (ip ? "/" + ip : "") + "?token=" + ipinfoToken;
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