import { useState } from "react";
import "./app.css";
function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper: Convert weather code → text condition
  const getWeatherCondition = (code) => {
    const conditions = {
      0: "Clear sky ☀️",
      1: "Mainly clear 🌤️",
      2: "Partly cloudy ⛅",
      3: "Overcast ☁️",
      45: "Fog 🌫️",
      48: "Depositing rime fog 🌫️",
      51: "Light drizzle 🌦️",
      53: "Moderate drizzle 🌧️",
      55: "Dense drizzle 🌧️",
      61: "Slight rain 🌦️",
      63: "Moderate rain 🌧️",
      65: "Heavy rain 🌧️",
      71: "Slight snow ❄️",
      73: "Moderate snow ❄️",
      75: "Heavy snow ❄️",
      80: "Rain showers 🌧️",
      81: "Heavy showers 🌧️",
      95: "Thunderstorm ⛈️",
    };
    return conditions[code] || "Unknown weather";
  };

  // Helper: Feels like temperature (approximation formula)
  const calculateFeelsLike = (temp, windspeed) => {
    // Simplified “wind chill” formula for cool temps
    if (temp < 20 && windspeed > 5) {
      return (13.12 + 0.6215 * temp - 11.37 * Math.pow(windspeed, 0.16) + 0.3965 * temp * Math.pow(windspeed, 0.16)).toFixed(1);
    }
    // Otherwise, feels like same as actual temp
    return temp.toFixed(1);
  };

  const fetchWeather = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      // Step 1: Get coordinates
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Try again!");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Get current weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      const current = weatherData.current_weather;

      setWeather({
        city: name,
        country,
        temperature: current.temperature,
        windspeed: current.windspeed,
        weathercode: current.weathercode,
      });
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-900 drop-shadow">
        🌦 Weather Now
      </h1>

      {/* Search Box */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full sm:w-auto items-center">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="p-3 rounded-lg border border-gray-300 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchWeather}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-700">Fetching weather...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Weather Data */}
      {weather && (
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center mt-4 w-full max-w-xs sm:max-w-md">
          <h2 className="text-2xl font-semibold mb-2">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-xl mb-1">
            🌡️ Temperature: {weather.temperature.toFixed(1)}°C
          </p>
          <p className="text-lg text-gray-600 mb-1">
            💨 Wind Speed: {weather.windspeed} km/h
          </p>
          <p className="text-lg text-gray-600 mb-1">
            🧊 Feels Like: {calculateFeelsLike(weather.temperature, weather.windspeed)}°C
          </p>
          <p className="text-lg text-gray-700 font-medium">
            Condition: {getWeatherCondition(weather.weathercode)}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;

