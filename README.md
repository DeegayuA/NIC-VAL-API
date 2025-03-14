# NIC Data Extractor

This project extracts data from Sri Lankan National Identity Card (NIC) numbers and fetches IP information.

## Features

-   Extracts data from both old and new NIC formats.
-   Determines gender, birthdate, and voting eligibility from NIC.
-   Fetches IP information (city, region, country, location, organization).
-   Displays combined NIC and IP information.
-   **Basic API Authentication (NIC-VAL)**

## How to Use

To fetch NIC data and related information, follow these steps:

1. **Make a GET request to the API**:
   - Use the following URL format to fetch the data:
   
   ```
   https://nic-val-api.onrender.com/test-url?id=<NIC_NUMBER>&nicVal=<NIC_VAL>
   ```
   
   Replace `<NIC_NUMBER>` with the NIC you want to validate and `<NIC_VAL>` with the authentication value (e.g., `NIC-VAL`).

2. **Example Request**:
   - URL to fetch NIC details:
   
   ```
   https://nic-val-api.onrender.com/test-url?id=911042754V&nicVal=NIC-VAL
   ```

3. **Response**:
   - The response will return a JSON object with the NIC data and associated IP information. An example response would look like:
   
   ```json
   {
     "NIC": {
       "valid": true,
       "formatted": "911042754V",
       "birthYear": "1991",
       "birthDayOfYear": "042",
       "birthDay": "04021991",
       "gender": "Male",
       "votingEligibility": "Eligible",
       "serialNumber": "754",
       "checkDigit": "V",
       "age": "00300401"
     },
     "IP": {
       "ip": "124.43.79.210",
       "city": "Colombo",
       "region": "Western Province",
       "country": "LK",
       "location": {
         "latitude": "6.9355",
         "longitude": "79.8487"
       },
       "organization": "AS9329 Sri Lanka Telecom Internet"
     }
   }
   ```

4. **Authentication**:
   - The API performs a simple authentication check using a hardcoded `NIC-VAL` value. Replace the `nicVal` parameter in the URL with the correct authentication token.
   - For demonstration purposes only. In a production environment, use a secure authentication method.

## NIC Format

### Old Format

-   9 digits followed by a 'V' or 'X' (e.g., 911042754V).

### New Format

-   12 digits (e.g., 197419202757).

## IP Information

-   Uses the ipinfo.io API to fetch IP data.
-   Requires an API token (currently hardcoded in `script.js`).

## API Authentication

- A simple authentication check is performed using a hardcoded `NIC-VAL` value.
- **For demonstration purposes only. In a production environment, use a secure authentication method.**

## Development
To run this project locally, simply open the `index.html` file in a web browser.
