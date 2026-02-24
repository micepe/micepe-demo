import { App } from "@modelcontextprotocol/ext-apps";

// Get element references
const latitudeEl = document.getElementById("latitude")!;
const longitudeEl = document.getElementById("longitude")!;
const generationTimeEl = document.getElementById("generation-time")!;
const refreshBtn = document.getElementById("refresh-btn")!;
const fetchLocationBtn = document.getElementById("fetch-location-btn")!;
const searchCityBtn = document.getElementById("search-city-btn")!;
const cityInput = document.getElementById("city-input") as HTMLInputElement;
const latInput = document.getElementById("lat-input") as HTMLInputElement;
const lonInput = document.getElementById("lon-input") as HTMLInputElement;
const loadingEl = document.getElementById("loading")!;
const weatherContentEl = document.getElementById("weather-content")!;
const errorMessageEl = document.getElementById("error-message")!;
const currentTempEl = document.getElementById("current-temp")!;
const weatherDescriptionEl = document.getElementById("weather-description")!;
const mainWeatherIconEl = document.getElementById("main-weather-icon")!;
const weatherDetailsEl = document.getElementById("weather-details")!;
const hourlyForecastEl = document.getElementById("hourly-forecast")!;
const mapContainerEl = document.getElementById("map-container")!;
const mapIframeEl = document.getElementById("map-iframe") as HTMLIFrameElement;

// Create app instance
const app = new App({ name: "Open-Meteo App", version: "1.0.0" });

// Weather icon mapping based on WMO Weather interpretation codes
function getWeatherIcon(weatherCode: number): string {
  const iconMap: { [key: number]: string } = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '⛈️', 71: '🌨️', 73: '❄️', 75: '❄️', 77: '🌨️',
    80: '🌦️', 81: '⛈️', 82: '⛈️', 85: '🌨️', 86: '❄️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  return iconMap[weatherCode] || '🌤️';
}

function getWeatherDescription(weatherCode: number): string {
  const descMap: { [key: number]: string } = {
    0: 'Clear sky',        1: 'Mainly clear',           2: 'Partly cloudy',          3: 'Overcast',
    45: 'Foggy',           48: 'Rime fog',              51: 'Light drizzle',         53: 'Moderate drizzle',
    55: 'Dense drizzle',   61: 'Slight rain',           63: 'Moderate rain',         65: 'Heavy rain',
    71: 'Slight snow',     73: 'Moderate snow',         75: 'Heavy snow',            77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',     95: 'Thunderstorm',
    96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
  };
  return descMap[weatherCode] || 'Unknown conditions';
}

function showLoading(show: boolean) {
  loadingEl.style.display = show ? 'block' : 'none';
  weatherContentEl.style.display = show ? 'none' : 'block';
  refreshBtn.disabled = show;
  fetchLocationBtn.disabled = show;
  searchCityBtn.disabled = show;
}

function updateMap(lat: number, lon: number) {
  // Update OpenStreetMap iframe (no branding/links)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}&layer=mapnik&marker=${lat},${lon}`;
  mapIframeEl.src = mapUrl;
  mapContainerEl.style.display = 'block';
}

function showError(message: string) {
  errorMessageEl.textContent = message;
  errorMessageEl.style.display = 'block';
  setTimeout(() => {
    errorMessageEl.style.display = 'none';
  }, 5000);
}

function updateWeatherDisplay(data: any) {
  try {
    // Update basic info
    const latitude = data?.latitude?.toFixed(2);
    const longitude = data?.longitude?.toFixed(2);
    const generationTime = data?.generationtime_ms?.toFixed(2);
    
    latitudeEl.textContent = latitude ?? "N/A";
    longitudeEl.textContent = longitude ?? "N/A";
    generationTimeEl.textContent = generationTime ?? "N/A";

    // Update inputs with current values
    latInput.value = latitude;
    lonInput.value = longitude;

    // Update map with current location
    if (data?.latitude && data?.longitude) {
      updateMap(data.latitude, data.longitude);
    }

    // Extract current weather data
    const currentWeather = data?.current_weather || data?.current || {};
    const hourly = data?.hourly || {};
    
    const currentTemp = currentWeather.temperature ?? hourly?.temperature_2m?.[0];
    const weatherCode = currentWeather.weathercode ?? hourly?.weathercode?.[0] ?? 0;
    const windSpeed = currentWeather.windspeed ?? hourly?.windspeed_10m?.[0];
    const windDirection = currentWeather.winddirection ?? hourly?.winddirection_10m?.[0];
    
    // Update main display
    currentTempEl.textContent = currentTemp !== undefined ? `${Math.round(currentTemp)}°C` : '--°';
    weatherDescriptionEl.textContent = getWeatherDescription(weatherCode);
    mainWeatherIconEl.textContent = getWeatherIcon(weatherCode);

    // Update weather details
    const humidity = hourly?.relativehumidity_2m?.[0];
    const precipitation = hourly?.precipitation?.[0];
    const pressure = hourly?.surface_pressure?.[0];
    const cloudCover = hourly?.cloudcover?.[0];

    weatherDetailsEl.innerHTML = `
      ${windSpeed !== undefined ? `
        <div class="detail-item">
          <div class="label">💨 Wind Speed</div>
          <div class="value">${windSpeed.toFixed(1)} km/h</div>
        </div>
      ` : ''}
      ${humidity !== undefined ? `
        <div class="detail-item">
          <div class="label">💧 Humidity</div>
          <div class="value">${humidity}%</div>
        </div>
      ` : ''}
      ${precipitation !== undefined ? `
        <div class="detail-item">
          <div class="label">🌧️ Precipitation</div>
          <div class="value">${precipitation} mm</div>
        </div>
      ` : ''}
      ${pressure !== undefined ? `
        <div class="detail-item">
          <div class="label">🌡️ Pressure</div>
          <div class="value">${pressure.toFixed(0)} hPa</div>
        </div>
      ` : ''}
      ${cloudCover !== undefined ? `
        <div class="detail-item">
          <div class="label">☁️ Cloud Cover</div>
          <div class="value">${cloudCover}%</div>
        </div>
      ` : ''}
      ${data?.elevation !== undefined ? `
        <div class="detail-item">
          <div class="label">⛰️ Elevation</div>
          <div class="value">${data.elevation.toFixed(0)} m</div>
        </div>
      ` : ''}
    `;

    // Update hourly forecast (show next 12 hours)
    if (hourly?.time && hourly?.temperature_2m) {
      const hourlyHtml = hourly.time.slice(0, 12).map((time: string, index: number) => {
        const temp = hourly.temperature_2m[index];
        const code = hourly.weathercode?.[index] ?? 0;
        const hour = new Date(time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
        
        return `
          <div class="forecast-item">
            <div class="forecast-time">${hour}</div>
            <div class="forecast-icon">${getWeatherIcon(code)}</div>
            <div class="forecast-temp">${Math.round(temp)}°C</div>
          </div>
        `;
      }).join('');
      
      hourlyForecastEl.innerHTML = hourlyHtml;
    }

  } catch (error) {
    console.error('Error updating display:', error);
    showError('Error displaying weather data');
  }
}

async function fetchWeather(lat: string | number, lon: string | number) {
  try {
    showLoading(true);
    
    // Build the API URL with comprehensive parameters
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current_weather: 'true',
      hourly: 'temperature_2m,relativehumidity_2m,precipitation,weathercode,surface_pressure,cloudcover,windspeed_10m,winddirection_10m',
      timezone: 'auto'
    });

    // Call the MCP server tool
    const result = await app.callServerTool({ 
      name: "get_v1_forecast", 
      arguments: { 
        latitude: String(lat), 
        longitude: String(lon),
        current_weather: 'true',
        hourly: 'temperature_2m,relativehumidity_2m,precipitation,weathercode,surface_pressure,cloudcover,windspeed_10m,winddirection_10m',
        timezone: 'auto'
      }
    });

    const textContent = result.content?.find((c) => c.type === "text")?.text;
    if (!textContent) {
      throw new Error('No data received from API');
    }

    const data = JSON.parse(textContent);
    updateWeatherDisplay(data);
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError(`Failed to fetch weather data: ${error}`);
  } finally {
    showLoading(false);
  }
}

// Handle tool results from the server on initial load
app.ontoolresult = (result) => {
  try {
    const textContent = result.content?.find((c) => c.type === "text")?.text;
    if (!textContent) {
      throw new Error('No data received');
    }
    
    const data = JSON.parse(textContent);
    updateWeatherDisplay(data);
  } catch (error) {
    console.error('Error handling tool result:', error);
    showError('Error loading initial weather data');
  } finally {
    showLoading(false);
  }
};

// Wire up refresh button
refreshBtn.addEventListener("click", () => {
  const currentLat = latitudeEl.textContent;
  const currentLon = longitudeEl.textContent;
  
  if (currentLat && currentLon && currentLat !== "Loading..." && currentLon !== "Loading...") {
    fetchWeather(currentLat, currentLon);
  } else {
    showError('No location available to refresh');
  }
});

// Wire up location fetch button
fetchLocationBtn.addEventListener("click", () => {
  const lat = latInput.value;
  const lon = lonInput.value;
  
  if (!lat || !lon) {
    showError('Please enter both latitude and longitude');
    return;
  }
  
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    showError('Invalid latitude or longitude values');
    return;
  }
  
  if (latNum < -90 || latNum > 90) {
    showError('Latitude must be between -90 and 90');
    return;
  }
  
  if (lonNum < -180 || lonNum > 180) {
    showError('Longitude must be between -180 and 180');
    return;
  }
  
  fetchWeather(latNum, lonNum);
});

// Wire up city search button
searchCityBtn.addEventListener("click", async () => {
  const cityName = cityInput.value.trim();
  
  if (!cityName) {
    showError('Please enter a city name');
    return;
  }
  
  try {
    showLoading(true);
    
    // Call Open-Meteo Geocoding API
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    
    const response = await fetch(geocodingUrl);
    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }
    
    const geocodingData = await response.json();
    
    if (!geocodingData.results || geocodingData.results.length === 0) {
      showError(`City "${cityName}" not found. Try another name.`);
      showLoading(false);
      return;
    }
    
    const result = geocodingData.results[0];
    const lat = result.latitude;
    const lon = result.longitude;
    const foundCity = result.name;
    const country = result.country;
    
    // Update the description to show found city
    weatherDescriptionEl.textContent = `Weather for ${foundCity}, ${country}`;
    
    // Fetch weather for the found location
    await fetchWeather(lat, lon);
    
    // Clear the city input
    cityInput.value = '';
    
  } catch (error) {
    console.error('Error searching city:', error);
    showError(`Failed to search for city: ${error}`);
    showLoading(false);
  }
});

// Allow Enter key to trigger city search
cityInput.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    searchCityBtn.click();
  }
});

// Allow Enter key to trigger coordinate search
latInput.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    fetchLocationBtn.click();
  }
});

lonInput.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    fetchLocationBtn.click();
  }
});

// Connect to host
app.connect();
showLoading(true);