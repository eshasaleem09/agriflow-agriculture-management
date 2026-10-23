import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
  AlertCircle,
  Snowflake,
} from "lucide-react";

import { fetchWeather } from "../features/weather/weatherSlice.js";

const REFRESH_INTERVAL = 15 * 60 * 1000;

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Freezing Drizzle",
    57: "Heavy Freezing Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Light Rain Showers",
    81: "Moderate Rain Showers",
    82: "Heavy Rain Showers",
    85: "Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Severe Thunderstorm with Hail",
  };

  return descriptions[code] ?? "Weather Conditions";
}

function getWeatherIcon(code) {
  if (code === 0) return Sun;

  if (code === 1 || code === 2) return CloudSun;

  if (code === 3) return Cloud;

  if (code === 45 || code === 48) return CloudFog;

  if (code >= 51 && code <= 67) return CloudRain;

  if (code >= 71 && code <= 77) return Snowflake;

  if (code >= 80 && code <= 82) return CloudRain;

  if (code >= 85 && code <= 86) return Snowflake;

  if (code >= 95) return CloudLightning;

  return CloudSun;
}

function formatForecastDate(dateString) {
  return new Date(`${dateString}T12:00:00+05:00`).toLocaleDateString(
    "en-PK",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Asia/Karachi",
    }
  );
}

function Weather() {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector(
    (state) => state.weather
  );

  useEffect(() => {
    dispatch(fetchWeather());

    const intervalId = window.setInterval(() => {
      dispatch(fetchWeather());
    }, REFRESH_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  const isLoading = status === "loading";
  const hasError = status === "failed";

  return (
    <section className="weather-page">
      <div className="weather-page-heading">
        <div>
          <span className="weather-eyebrow">LIVE FARM CONDITIONS</span>

          <h2>Weather Center</h2>

          <p>
            Monitor local weather to make informed farming decisions.
          </p>
        </div>

        <button
          type="button"
          className="weather-refresh-button"
          onClick={() => dispatch(fetchWeather())}
          disabled={isLoading}
        >
          <RefreshCw
            size={17}
            className={isLoading ? "weather-spinning" : ""}
          />
          {isLoading ? "Updating..." : "Refresh"}
        </button>
      </div>

      {hasError && (
        <div className="weather-error" role="alert">
          <AlertCircle size={20} />

          <div>
            <strong>Weather update failed</strong>

            <p>
              {error || "Please check your internet connection."}
            </p>

            {data && (
              <p>Showing the last successfully loaded weather data.</p>
            )}
          </div>
        </div>
      )}

      {!data && isLoading && (
        <div className="weather-message">
          <RefreshCw size={25} className="weather-spinning" />

          <p>Fetching live weather for Lahore...</p>
        </div>
      )}

      {!data && hasError && (
        <div className="weather-message">
          <CloudRain size={30} />

          <h3>Weather data unavailable</h3>

          <p>
            Check your internet connection and try refreshing.
          </p>

          <button
            type="button"
            className="weather-refresh-button"
            onClick={() => dispatch(fetchWeather())}
          >
            Try Again
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="weather-location-row">
            <div>
              <h3>{data.location}</h3>

              <p>
                {data.current.time
                  ? new Date(data.current.time).toLocaleString("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Karachi",
                    })
                  : "Current conditions"}
              </p>
            </div>

            <span className="weather-live-indicator">
              <span />
              Live Data
            </span>
          </div>

          <div className="weather-main-grid">
            <article className="weather-current-card">
              <div className="weather-current-top">
                <div>
                  <span className="weather-card-label">
                    CURRENT TEMPERATURE
                  </span>

                  <h2>
                    {Math.round(data.current.temperature)}°
                    <span>C</span>
                  </h2>

                  <p>
                    {getWeatherDescription(data.current.weatherCode)}
                  </p>
                </div>

                {(() => {
                  const Icon = getWeatherIcon(data.current.weatherCode);

                  return <Icon size={76} strokeWidth={1.4} />;
                })()}
              </div>

              <div className="weather-current-footer">
                <span>
                  <Droplets size={17} />
                  Humidity: {data.current.humidity}%
                </span>

                <span>
                  <Wind size={17} />
                  Wind: {data.current.windSpeed} km/h
                </span>
              </div>
            </article>

            <article className="weather-stat-card">
              <div className="weather-stat-icon">
                <Droplets size={22} />
              </div>

              <p>Humidity</p>

              <h3>{data.current.humidity}%</h3>

              <div
                className="weather-progress-track"
                role="progressbar"
                aria-label="Relative humidity"
                aria-valuenow={data.current.humidity}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="weather-progress-fill"
                  style={{
                    width: `${data.current.humidity}%`,
                  }}
                />
              </div>

              <span>Relative humidity</span>
            </article>

            <article className="weather-stat-card">
              <div className="weather-stat-icon">
                <Wind size={22} />
              </div>

              <p>Wind Speed</p>

              <h3>{data.current.windSpeed} <small>km/h</small></h3>

              <span>Current wind conditions</span>
            </article>

            <article className="weather-stat-card">
              <div className="weather-stat-icon">
                <CloudRain size={22} />
              </div>

              <p>Chance of Rain</p>

              <h3>{data.current.rainChance}%</h3>

              <span>Today's forecast probability</span>
            </article>

            <article className="weather-stat-card">
              <div className="weather-stat-icon">
                <Thermometer size={22} />
              </div>

              <p>Precipitation</p>

              <h3>{data.current.precipitation} <small>mm</small></h3>

              <span>Current precipitation</span>
            </article>
          </div>

          <div className="weather-forecast-heading">
            <div>
              <span className="weather-eyebrow">PLAN AHEAD</span>

              <h3>3-Day Forecast</h3>

              <p>Check upcoming weather before planning farm activities.</p>
            </div>
          </div>

          <div className="weather-forecast-grid">
            {data.forecast.map((day, index) => {
              const Icon = getWeatherIcon(day.weatherCode);

              return (
                <article
                  className="weather-forecast-card"
                  key={day.date}
                >
                  <span className="weather-forecast-date">
                    {index === 0
                      ? "Today"
                      : formatForecastDate(day.date)}
                  </span>

                  <Icon
                    size={37}
                    strokeWidth={1.6}
                    className="weather-forecast-icon"
                  />

                  <strong>
                    {getWeatherDescription(day.weatherCode)}
                  </strong>

                  <div className="weather-temperature-range">
                    <span>{Math.round(day.maxTemperature)}°</span>

                    <span>{Math.round(day.minTemperature)}°</span>
                  </div>

                  <div className="weather-rain-chance">
                    <Droplets size={15} />

                    <span>{day.rainChance}% rain chance</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="weather-updated-at">
            Last updated:{" "}
            {new Date(data.updatedAt).toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Karachi",
            })}
            {" · "}Automatic refresh every 15 minutes
          </div>
        </>
      )}
    </section>
  );
}

export default Weather;