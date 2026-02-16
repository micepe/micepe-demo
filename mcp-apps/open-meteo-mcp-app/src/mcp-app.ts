import { App } from "@modelcontextprotocol/ext-apps";

// Get element references
const latitudeEl = document.getElementById("latitude")!;
const longitudeEl = document.getElementById("longitude")!;
const generationTimeEl = document.getElementById("generation-time")!;
const tryAgainBtn = document.getElementById("try-again-btn")!;

// Create app instance
const app = new App({ name: "Open-Meteo App", version: "1.0.0" });

// Handle tool results from the server. Set before `app.connect()` to avoid
// missing the initial tool result.
app.ontoolresult = (result) => {
  const textContent = result.content?.find((c) => c.type === "text")?.text;
  const data = textContent ? JSON.parse(textContent) : null;
  const latitude = data?.latitude;
  const longitude = data?.longitude;
  const generationTime = data?.generationtime_ms;
  latitudeEl.textContent = latitude ?? "[ERROR]";
  longitudeEl.textContent = longitude ?? "[ERROR]";
  generationTimeEl.textContent = generationTime ?? "[ERROR]";
};

// Wire up button click
tryAgainBtn.addEventListener("click", async () => {
  // `app.callServerTool()` lets the UI request fresh data from the server
  const result = await app.callServerTool({ name: "get_v1_forecast", arguments: { 
    latitude: latitudeEl.textContent, 
    longitude: longitudeEl.textContent 
  }});
  const textContent = result.content?.find((c) => c.type === "text")?.text;
  const data = textContent ? JSON.parse(textContent) : null;
  const generationTime = data?.generationtime_ms;
  generationTimeEl.textContent = generationTime ?? "[ERROR]";
});

// Connect to host
app.connect();


/*
  {
    "latitude":47.0,
    "longitude":2.0,
    "generationtime_ms":0.0017881393432617188,
    "utc_offset_seconds":0,
    "timezone":"GMT",
    "timezone_abbreviation":"GMT",
    "elevation":137.0
  }
*/