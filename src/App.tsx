import { useEffect, useState } from "react";
import "./App.css";
import { fetchCovidData } from "./services/covidApi";
import type { CovidApiResponse } from "./types/covid";

function App() {
  // Local state to store the API response
  const [covidData, setCovidData] = useState<CovidApiResponse | null>(null);

  useEffect(() => {
    // Fetch data once on component mount
    const loadData = async () => {
      try {
        // Here we make the API request
        const data = await fetchCovidData();

        // Save the data into state for later use
        setCovidData(data);

        // Log raw data for debugging/verification
        console.log("Fetched COVID data:", data);
      } catch (error) {
        // Log errors so they are visible during development
        console.error("Error loading COVID data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <h1>COVID-19 Statistics</h1>
      {/* Simple debug render to show data presence */}
      <pre>{covidData ? "Data loaded" : "Loading..."}</pre>
    </div>
  );
}

export default App;
