
import { useEffect, useCallback, useState } from "react";
import {
  CloudSun,
  Wind,
  Droplets,
  CloudRain,
  RefreshCw,
  AlertCircle,
  Sun,
  Cloud,
  CheckCircle2,
} from "lucide-react";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

const DEFAULT_LOCATION = {
  latitude: 31.5204,
  longitude: 74.3587,
  name: "Lahore, Pakistan",
};

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Mainly clear / partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather conditions unavailable";
}

function getWeatherIcon(code) {
  if (code === 0) return Sun;
  if ([1, 2, 3].includes(code)) return CloudSun;
  if ([45, 48].includes(code)) return Cloud;
  if (code >= 51 && code <= 99) return CloudRain;
  return CloudSun;
}

function getHumidityStatus(humidity) {
  if (humidity < 30) return "Low";
  if (humidity <= 70) return "Optimal";
  return "High";
}

function getHumidityAdvice(humidity) {
  if (humidity < 30) {
    return {
      title: "Low Humidity Alert",
      message:
        "Air humidity is low. Monitor soil moisture and check crops for signs of water stress.",
      level: "low",
    };
  }

  if (humidity > 70) {
    return {
      title: "High Humidity Alert",
      message:
        "High humidity may encourage fungal diseases. Monitor crops and ensure good field ventilation.",
      level: "high",
    };
  }

  return {
    title: "Humidity Conditions Optimal",
    message:
      "Humidity is within the dashboard's preferred range. Continue monitoring your crops.",
    level: "optimal",
  };
}

function Weather() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [locationName, setLocationName] = useState(
    DEFAULT_LOCATION.name
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = useCallback(
    async (latitude, longitude, name) => {
      try {
        setError("");
        setRefreshing(true);

        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current:
            "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
          hourly: "precipitation_probability",
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min",
          timezone: "auto",
          forecast_days: "3",
        });

        const url = WEATHER_API + "?" + params.toString();
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Unable to retrieve weather data. Please try again."
          );
        }

        const data = await response.json();

        if (
          !data.current ||
          !data.daily ||
          !data.hourly ||
          !Array.isArray(data.hourly.time) ||
          data.hourly.time.length === 0
        ) {
          throw new Error(
            "The weather service returned incomplete data."
          );
        }

        const currentTime = data.current.time;

        const hourlyIndex = data.hourly.time.reduce(
          (closestIndex, time, index) => {
            const currentDifference = Math.abs(
              new Date(time).getTime() -
                new Date(currentTime).getTime()
            );

            const closestDifference = Math.abs(
              new Date(
                data.hourly.time[closestIndex]
              ).getTime() -
                new Date(currentTime).getTime()
            );

            return currentDifference < closestDifference
              ? index
              : closestIndex;
          },
          0
        );

        setWeather({
          temperature: Math.round(
            data.current.temperature_2m
          ),
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          code: data.current.weather_code,
          rainChance:
            data.hourly.precipitation_probability[
              hourlyIndex
            ] ?? 0,
        });

        setForecast(
          data.daily.time.map((date, index) => ({
            date,
            temperature: Math.round(
              data.daily.temperature_2m_max[index]
            ),
            low: Math.round(
              data.daily.temperature_2m_min[index]
            ),
            code: data.daily.weather_code[index],
          }))
        );

        setLocationName(name);
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err.message ||
            "Something went wrong while loading the weather."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const loadWeather = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(
            position.coords.latitude,
            position.coords.longitude,
            "Your current location"
          );
        },
        () => {
          fetchWeather(
            DEFAULT_LOCATION.latitude,
            DEFAULT_LOCATION.longitude,
            DEFAULT_LOCATION.name
          );
        },
        {
          timeout: 8000,
          maximumAge: 300000,
        }
      );
    } else {
      fetchWeather(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude,
        DEFAULT_LOCATION.name
      );
    }
  }, [fetchWeather]);

  useEffect(() => {
    loadWeather();

    const interval = setInterval(
      loadWeather,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [loadWeather]);

  if (loading) {
    return (
      <section className="weather-page">
        <h2>Weather Forecast</h2>

        <div
          className="panel weather-message"
          role="status"
        >
          <RefreshCw
            size={22}
            className="weather-spinner"
          />
          <p>Loading live weather data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="weather-page">
      <div className="weather-heading">
        <div>
          <p className="weather-eyebrow">
            FARM CONDITIONS
          </p>

          <h2>Weather Forecast</h2>

          <p className="weather-subtitle">
            Live weather information to help plan your farming
            activities.
          </p>

          <p className="weather-location">
            📍 {locationName}
          </p>
        </div>

        <button
          type="button"
          className="weather-refresh"
          onClick={loadWeather}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "weather-spinner" : ""
            }
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="weather-error" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            type="button"
            onClick={loadWeather}
          >
            Try again
          </button>
        </div>
      )}

      {weather && (
        <>
          <div className="weather-alerts">
            {(() => {
              const advice = getHumidityAdvice(
                weather.humidity
              );

              const AdviceIcon =
                advice.level === "optimal"
                  ? CheckCircle2
                  : AlertCircle;

              return (
                <article
                  className={
                    "weather-alert weather-alert-" +
                    advice.level
                  }
                >
                  <AdviceIcon size={22} />

                  <div>
                    <h4>{advice.title}</h4>
                    <p>{advice.message}</p>
                  </div>
                </article>
              );
            })()}

            {weather.rainChance >= 60 && (
              <article className="weather-alert weather-alert-rain">
                <CloudRain size={22} />

                <div>
                  <h4>Rain Expected</h4>
                  <p>
                    The nearest hourly forecast indicates a
                    high chance of rain. Consider checking
                    irrigation plans and outdoor farm
                    activities.
                  </p>
                </div>
              </article>
            )}
          </div>

          <div className="weather-current-grid">
            <article className="panel weather-current-card">
              <div className="weather-current-top">
                <div>
                  <span className="weather-label">
                    CURRENT TEMPERATURE
                  </span>

                  <h3>{weather.temperature}°C</h3>

                  <p>
                    {getWeatherDescription(weather.code)}
                  </p>
                </div>

                {(() => {
                  const Icon = getWeatherIcon(
                    weather.code
                  );

                  return (
                    <Icon
                      size={52}
                      className="weather-main-icon"
                    />
                  );
                })()}
              </div>

              <p className="weather-hint">
                Use current conditions to plan outdoor farm
                activities.
              </p>
            </article>

            <article className="panel weather-metric humidity-card">
              <div className="humidity-card-heading">
                <Droplets size={24} />

                <span className="weather-label">
                  HUMIDITY
                </span>
              </div>

              <div
                className="humidity-gauge"
                role="img"
                aria-label={
                  "Humidity is " +
                  weather.humidity +
                  " percent"
                }
                style={{
                  "--humidity-value":
                    weather.humidity + "%",
                }}
              >
                <div className="humidity-gauge-inner">
                  <strong>
                    {weather.humidity}%
                  </strong>
                  <span>Humidity</span>
                </div>
              </div>

              <span
                className={
                  "humidity-status humidity-" +
                  getHumidityStatus(
                    weather.humidity
                  ).toLowerCase()
                }
              >
                {getHumidityStatus(weather.humidity)}
              </span>
            </article>

            <article className="panel weather-metric">
              <Wind size={26} />

              <span className="weather-label">
                WIND SPEED
              </span>

              <h3>
                {weather.windSpeed} <small>km/h</small>
              </h3>

              <p>Current wind conditions</p>
            </article>

            <article className="panel weather-metric">
              <CloudRain size={26} />

              <span className="weather-label">
                RAIN CHANCE
              </span>

              <h3>{weather.rainChance}%</h3>

              <p>Nearest hourly forecast</p>
            </article>
          </div>

          <div className="weather-section-heading">
            <div>
              <h3>Three-Day Forecast</h3>
              <p>
                Daily temperatures and expected conditions
              </p>
            </div>
          </div>

          <div className="weather-forecast-grid">
            {forecast.map((item, index) => {
              const Icon = getWeatherIcon(item.code);

              const dayName =
                index === 0
                  ? "Today"
                  : index === 1
                    ? "Tomorrow"
                    : new Date(
                        item.date + "T12:00:00"
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                      });

              return (
                <article
                  className="panel weather-forecast-card"
                  key={item.date}
                >
                  <h4>{dayName}</h4>

                  <Icon
                    size={36}
                    className="weather-forecast-icon"
                  />

                  <p>
                    {getWeatherDescription(item.code)}
                  </p>

                  <div className="weather-temperatures">
                    <strong>
                      {item.temperature}°
                    </strong>
                    <span>{item.low}°</span>
                  </div>

                  <span className="weather-temp-caption">
                    High / Low
                  </span>
                </article>
              );
            })}
          </div>

          <div className="weather-note">
            {lastUpdated && (
              <span>
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            <span>
              Automatically refreshes every 5 minutes.
            </span>

            <span>Weather data: Open-Meteo</span>
          </div>
        </>
      )}
    </section>
  );
}

export default Weather;
