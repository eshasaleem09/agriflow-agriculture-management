import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (_, { signal, rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        latitude: "31.5204",
        longitude: "74.3587",
        current:
          "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        forecast_days: "3",
        timezone: "Asia/Karachi",
      });

      const response = await fetch(
        `${WEATHER_API_URL}?${params.toString()}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const raw = await response.json();

      if (!raw.current || !raw.daily) {
        throw new Error("Weather data is incomplete.");
      }

      const forecast = raw.daily.time.map((date, index) => ({
        date,
        weatherCode: raw.daily.weather_code[index],
        maxTemperature: raw.daily.temperature_2m_max[index],
        minTemperature: raw.daily.temperature_2m_min[index],
        rainChance:
          raw.daily.precipitation_probability_max[index] ?? 0,
      }));

      return {
        location: "Lahore, Pakistan",

        current: {
          temperature: raw.current.temperature_2m,
          humidity: raw.current.relative_humidity_2m,
          windSpeed: raw.current.wind_speed_10m,
          precipitation: raw.current.precipitation,
          weatherCode: raw.current.weather_code,
          rainChance: forecast[0]?.rainChance ?? 0,
          time: raw.current.time,
        },

        forecast,

        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }

      return rejectWithValue(
        error.message || "Weather service is currently unavailable."
      );
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",

  initialState: {
    data: null,
    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })

      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error.message || "Weather request failed.";
      });
  },
});

export default weatherSlice.reducer;