# NIC Data Extractor

This project extracts data from Sri Lankan National Identity Card (NIC) numbers and fetches IP information.

## Features

-   Extracts data from both old and new NIC formats.
-   Determines gender, birthdate, and voting eligibility from NIC.
-   Fetches IP information (city, region, country, location, organization).
-   Displays combined NIC and IP information.
-   **Basic API Authentication (NIC-VAL)**

## Usage

1.  Enter a valid NIC number in the input field.
2.  Click the "Extract Data" button.
3.  The extracted NIC data and IP information will be displayed below.

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
