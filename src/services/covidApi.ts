// Fetches COVID-19 case distribution data from ECDC
export async function fetchCovidData() {
  // Endpoint providing COVID-19 case distribution in JSON format
  const url = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/';

  try {
    // Perform the HTTP GET request
    const response = await fetch(url);

    // If the response is not OK (e.g., 4xx/5xx), throw an error to be caught below
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the parsed data to the caller
    return data;
  } catch (error) {
    // Log the original error for debugging
    console.error('Failed to fetch COVID-19 data:', error);

    // Throw a new error with a clear message for the caller
    throw new Error('Unable to load COVID-19 data. Please try again later.');
  }
}
