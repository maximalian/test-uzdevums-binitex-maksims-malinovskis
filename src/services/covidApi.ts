export const COVID_API_URL =
  "https://opendata.ecdc.europa.eu/covid19/casedistribution/json/";

export async function fetchCovidData() {
  const response = await fetch(COVID_API_URL);
  if (!response.ok) {
    throw new Error("Ошибка загрузки данных");
  }
  return response.json();
}
