const ipinfoToken = 'a656d399b8381d';
const expectedNicVal = 'NIC-VAL'; // Replace with your actual secret value

function extractNICData() {
    const nicInput = document.getElementById('nicInput').value;
    const nicValInput = document.getElementById('nicValInput').value; // Get NIC-VAL
    const nicDataContainer = document.getElementById('nicData');
    nicDataContainer.innerHTML = ''; // Clear previous results

    // API Authentication Check
    if (nicValInput !== expectedNicVal) {
        nicDataContainer.innerHTML = '<p class="error">Authentication Failed: Invalid NIC-VAL</p>';
        displayCombinedData({}, {}); // Display nothing on auth failure
        return;
    }

    let nicData = {};

    if (isValidOldNIC(nicInput)) {
        nicData = extractOldNICData(nicInput);
    } else if (isValidNewNIC(nicInput)) {
        nicData = extractNewNICData(nicInput);
    } else {
        nicDataContainer.innerHTML = '<p class="error">Invalid NIC Number</p>';
        displayCombinedData({}, {});
        return;
    }
    displayCombinedData(nicData);
}

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
            votingEligibility: true, // Assuming true for new NIC format
            serialNumber: serialNumber,
            checkDigit: checkDigit
        }
    };
}

function getBirthDate(year, dayOfYear) {
    // Days of each month, assuming every year is a leap year
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

    // Loop through the months and subtract the days from the dayOfYear
    for (let i = 0; i < d_array.length; i++) {
        if (dayOfYear <= d_array[i].days) {
            monthNumber = i + 1; // Get month number (1 to 12)
            day = dayOfYear;
            break;
        }
        dayOfYear -= d_array[i].days;
    }

    // Return the date in DDMMYYYY format
    return `${String(day).padStart(2, '0')}${String(monthNumber).padStart(2, '0')}${year}`;
}

async function fetchIPInfo() {
    const ipDataContainer = document.getElementById('ipData');
    ipDataContainer.innerHTML = '';
    try {
        const response = await fetch(`https://ipinfo.io?token=${ipinfoToken}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();

        return {
            IP: {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country,
                location: {
                    latitude: data.loc.split(',')[0],
                    longitude: data.loc.split(',')[1]
                },
                organization: data.org
            }
        }

    } catch (error) {
        console.error("Error fetching IP info:", error);
        ipDataContainer.innerHTML = `<p class="error">Failed to fetch IP information: ${error.message}</p>`;
        return { IP: null }; // Return null IP data
    }
}

async function displayCombinedData(nicData) {
  const ipData = await fetchIPInfo();
  const combinedData = { ...nicData, ...ipData };

  const nicDataContainer = document.getElementById('nicData');
  const ipDataContainer = document.getElementById('ipData');
  const jsonDataContainer = document.getElementById('jsonData');


  if (nicData.NIC) {
    nicDataContainer.innerHTML = `
          <p><strong>Valid:</strong> ${nicData.NIC.valid}</p>
          <p><strong>Formatted NIC:</strong> ${nicData.NIC.formatted}</p>
          <p><strong>Birth Year:</strong> ${nicData.NIC.birthYear}</p>
          <p><strong>Birth Day of Year:</strong> ${nicData.NIC.birthDayOfYear}</p>
          <p><strong>Birth Day:</strong> ${nicData.NIC.birthDay}</p>
          <p><strong>Gender:</strong> ${nicData.NIC.gender}</p>
          <p><strong>Voting Eligibility:</strong> ${nicData.NIC.votingEligibility}</p>
          <p><strong>Serial Number:</strong> ${nicData.NIC.serialNumber}</p>
          <p><strong>Check Digit:</strong> ${nicData.NIC.checkDigit}</p>
      `;
  }


  if(ipData.IP) {
    ipDataContainer.innerHTML = `
          <p><strong>IP Address:</strong> ${ipData.IP.ip}</p>
          <p><strong>City:</strong> ${ipData.IP.city}</p>
          <p><strong>Region:</strong> ${ipData.IP.region}</p>
          <p><strong>Country:</strong> ${ipData.IP.country}</p>
          <p><strong>Location:</strong> ${ipData.IP.location.latitude}, ${ipData.IP.location.longitude}</p>
          <p><strong>Organization:</strong> ${ipData.IP.organization}</p>
      `;
  }

    jsonDataContainer.innerHTML = `<pre>${JSON.stringify(combinedData, null, 2)}</pre>`;

  console.log(JSON.stringify(combinedData, null, 2));
}
