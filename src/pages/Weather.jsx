import { CloudSun, Wind, Droplets } from "lucide-react";

function Weather() {
  const forecast = [
    { day: "Today", temperature: "28°C", condition: "Partly Cloudy" },
    { day: "Tomorrow", temperature: "30°C", condition: "Sunny" },
    { day: "Day 3", temperature: "27°C", condition: "Cloudy" },
  ];

  return (
    <section>
      <h2>Weather Forecast</h2>
      <p>Weather information to help plan your farming activities.</p>

      <div className="crop-grid">
        {forecast.map((item) => (
          <article className="panel crop-card" key={item.day}>
            <CloudSun size={30} color="#d5a13e" />

            <h3>{item.day}</h3>

            <h2>{item.temperature}</h2>

            <p>{item.condition}</p>

            <div className="weather-extra">
              <Droplets size={16} /> Humidity information
              <Wind size={16} /> Wind information
            </div>
          </article>
        ))}
      </div>

      <p className="weather-note">
        These are sample values, not live weather forecasts.
      </p>
    </section>
  );
}

export default Weather;