import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedHeading } from "../components/AnimatedHeading";

// Google Material Icons stylesheet must be included in the app html:
// <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

// Simulated location list data
const locations = [
  {
    id: 1,
    name: "New York",
    country: "US",
    coordinates: [40.7128, -74.006],
    timezone: "America/New_York",
    isDefault: true,
    isFavorite: true,
  },
  {
    id: 2,
    name: "London",
    country: "UK",
    coordinates: [51.5074, -0.1278],
    timezone: "Europe/London",
    isDefault: false,
    isFavorite: false,
  },
  {
    id: 3,
    name: "Tokyo",
    country: "JP",
    coordinates: [35.6762, 139.6503],
    timezone: "Asia/Tokyo",
    isDefault: false,
    isFavorite: false,
  },
];

// Weather conditions sample
const weatherConditions = ["sunny", "cloudy", "rainy", "snowy", "stormy"];

// Helper: Generate fake 7-day forecast
function generateRealisticForecast(days = 7) {
  const forecast = [];
  for (let i = 0; i < days; i++) {
    const condition =
      weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    forecast.push({
      date: new Date(Date.now() + i * 86400000).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      high: Math.round(Math.random() * 15 + 15),
      low: Math.round(Math.random() * 10 + 5),
      condition,
      precipitation: Math.round(Math.random() * 80),
      wind: Math.round(Math.random() * 30),
      hourly: [], // Could add hourly details later
    });
  }
  return forecast;
}

// Motion variants for animations
const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

const currentWeatherVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

const forecastCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 + 0.3, duration: 0.4, ease: "easeOut" },
  }),
  hover: { scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" },
};

const iconPaths = {
  sunny: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#facc15"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  ),
  cloudy: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <ellipse cx="17" cy="15" rx="5" ry="3" />
      <ellipse cx="7" cy="15" rx="5" ry="3" />
    </svg>
  ),
  rainy: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 16l-4 5-4-5" />
      <ellipse cx="12" cy="12" rx="6" ry="4" />
    </svg>
  ),
  snowy: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0ea5e9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="5" y1="15" x2="19" y2="15" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  stormy: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

export default function AnimatedWeatherApp() {
  const [selectedLocationId, setSelectedLocationId] = useState(
    locations.find((loc) => loc.isDefault)?.id || locations[0].id
  );

  const [weatherData, setWeatherData] = useState({
    current: {
      temperature: 0,
      feelsLike: 0,
      condition: "sunny",
      humidity: 0,
      pressure: 0,
      windSpeed: 0,
      windDirection: 0,
      uvIndex: 0,
      visibility: 0,
    },
    forecast: [],
  });

  // Update weather data simulation
  useEffect(() => {
    const updateWeatherData = (locationId) => {
      const location = locations.find((l) => l.id === locationId);
      const conditions = weatherConditions;
      const currentCondition =
        conditions[Math.floor(Math.random() * conditions.length)];

      const current = {
        temperature: Math.round(Math.random() * 35 + 5),
        feelsLike: Math.round(Math.random() * 35 + 5),
        condition: currentCondition,
        humidity: Math.round(Math.random() * 60 + 20),
        pressure: Math.round(Math.random() * 50 + 980),
        windSpeed: Math.round(Math.random() * 25 + 5),
        windDirection: Math.floor(Math.random() * 360),
        uvIndex: Math.round(Math.random() * 11),
        visibility: Math.round(Math.random() * 10),
      };

      const forecast = generateRealisticForecast(7);

      setWeatherData({ current, forecast });
    };

    updateWeatherData(selectedLocationId);
  }, [selectedLocationId]);

  // Generate dynamic background gradient based on weather condition
  const getBackgroundGradient = (condition) => {
    switch (condition) {
      case "sunny":
        return "bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-100";
      case "cloudy":
        return "bg-gradient-to-br from-gray-400 via-gray-300 to-gray-200";
      case "rainy":
        return "bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300";
      case "snowy":
        return "bg-gradient-to-br from-blue-100 via-blue-50 to-white";
      case "stormy":
        return "bg-gradient-to-br from-purple-700 via-gray-700 to-gray-500";
      default:
        return "bg-gradient-to-br from-blue-400 via-blue-200 to-blue-100";
    }
  };

  // Format wind direction degrees to compass points
  const getWindDirection = (deg) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
      "N",
    ];
    const index = Math.round(deg / 22.5);
    return directions[index];
  };

  // Circular progress indicator for humidity, UV, and AQI
  const CircularProgress = ({ label, value, max, color }) => {
    const radius = 36;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg height={radius * 2} width={radius * 2} className="mb-1">
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-[stroke-dashoffset] duration-500 ease-in-out"
          />
        </svg>
        <span className="text-gray-700 font-semibold text-sm">{label}</span>
        <span className="text-gray-900 font-bold text-lg">{value}</span>
      </div>
    );
  };

  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center px-4 pt-6 pb-10 transition-colors duration-1000 ${getBackgroundGradient(
        weatherData.current.condition
      )}`}
      initial="hidden"
      animate="visible"
      exit="hidden"
      aria-label={`Current weather app with condition ${weatherData.current.condition}`}
    >
      {/* Header */}
      <motion.header
        className="w-full max-w-6xl flex justify-between items-center sticky top-0 z-30 bg-white bg-opacity-40 backdrop-blur-md rounded-lg shadow-md px-6 py-4 mb-6"
        variants={headerVariants}
      >
        <AnimatedHeading
          text={"WeatherApp"}
          className="text-3xl font-extrabold text-gray-900 select-none"
        />

        <select
          aria-label="Select Location"
          className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(parseInt(e.target.value))}
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}, {loc.country}
            </option>
          ))}
        </select>

        <button
          aria-label="Settings"
          className="material-icons text-gray-700 hover:text-gray-900 transition duration-300 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onClick={() => alert("Settings clicked")}
        >
          settings
        </button>
      </motion.header>

      {/* Main current weather display */}
      <motion.section
        className="w-full max-w-6xl bg-white bg-opacity-100 backdrop-blur-md rounded-xl shadow-lg p-10 flex flex-col md:flex-row items-center justify-between mb-10"
        variants={currentWeatherVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <motion.div
            className="w-24 h-24 mb-4"
            variants={currentWeatherVariants}
            animate="pulse"
          >
            {iconPaths[weatherData.current.condition] || iconPaths["sunny"]}
          </motion.div>
          <h2 className="text-6xl font-extrabold text-gray-900">
            {weatherData.current.temperature}&deg;C
          </h2>
          <p className="text-gray-700 text-lg mt-2">
            Feels like {weatherData.current.feelsLike}&deg;C
          </p>
          <AnimatedHeading
            text={weatherData.current.condition}
            className="!text-gray-600 mt-1 capitalize"
          />
          {/* <p className="text-gray-600 mt-1 capitalize">
            {weatherData.current.condition}
          </p> */}
        </div>

        <div className="flex flex-wrap justify-center gap-8 w-full md:w-auto">
          <CircularProgress
            label="Humidity"
            value={weatherData.current.humidity}
            max={100}
            color="#fbbf24"
          />
          <CircularProgress
            label="UV Index"
            value={weatherData.current.uvIndex}
            max={11}
            color="#ef4444"
          />
          <CircularProgress
            label="Wind Speed"
            value={weatherData.current.windSpeed}
            max={40}
            color="#3b82f6"
          />
        </div>
      </motion.section>

      {/* Hourly forecast - horizontal scroll */}
      <section className="w-full max-w-6xl mb-10">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          7-Day Forecast
        </h3>
        <div
          className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-thumb-rounded scrollbar-track-gray-300 py-2 px-1 gap-4"
          role="list"
          aria-label="7 day forecast"
        >
          {weatherData.forecast.map((day, idx) => (
            <motion.article
              className="flex-shrink-0 w-40 bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-md p-4 flex flex-col items-center cursor-default"
              key={day.date}
              custom={idx}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={forecastCardVariants}
              aria-label={`Forecast for ${day.date}, condition ${day.condition}, high ${day.high} degrees, low ${day.low} degrees`}
              tabIndex={0}
            >
              <div className="w-12 h-12 mb-3">
                {iconPaths[day.condition] || iconPaths["sunny"]}
              </div>
              <time
                className="text-gray-700 font-medium mb-2"
                dateTime={new Date(day.date).toISOString()}
              >
                {day.date}
              </time>
              <p className="text-gray-900 text-lg font-semibold">
                {day.high}&deg; / {day.low}&deg;
              </p>
              <p className="text-gray-600 text-sm mt-1">{day.condition}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Bottom additional info with static placeholders */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span
            className="material-icons text-yellow-400 text-4xl mb-4"
            aria-hidden="true"
          >
            wb_sunny
          </span>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Sunrise &amp; Sunset
          </h4>
          <p className="text-gray-700">Sunrise: 06:23 AM</p>
          <p className="text-gray-700">Sunset: 07:45 PM</p>
          <p className="text-gray-600 mt-3 text-sm italic">
            Golden hour advisory included
          </p>
        </div>

        <div className="bg-white bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span
            className="material-icons text-green-400 text-4xl mb-4"
            aria-hidden="true"
          >
            air
          </span>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Air Quality Index
          </h4>
          <p className="text-gray-700">AQI: 42 (Good)</p>
          <p className="text-gray-600 mt-3 text-sm italic">
            No health risks expected
          </p>
        </div>

        <div className="bg-white bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span
            className="material-icons text-red-400 text-4xl mb-4"
            aria-hidden="true"
          >
            wb_cloudy
          </span>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Visibility
          </h4>
          <p className="text-gray-700">{weatherData.current.visibility} km</p>
          <p className="text-gray-600 mt-3 text-sm italic">
            Good visibility conditions
          </p>
        </div>
      </section>
    </motion.div>
  );
}
