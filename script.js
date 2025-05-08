let sunriseTime = null;
let sunsetTime = null;
let currentTime = null;

const locations = {
  "Berlin, Deutschland": { lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin' },
  "Chur, Schweiz": { lat: 46.8509, lon: 9.5325, timezone: 'Europe/Zurich' },
  "London, England": { lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  "Mailand, Italien": { lat: 45.4642, lon: 9.1900, timezone: 'Europe/Rome' },
  "New York, USA": { lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  "Sydney, Australien": { lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  "Zürich, Schweiz": { lat: 47.3769, lon: 8.5417, timezone: 'Europe/Zurich' }
};

const locationSelect = document.getElementById('locationSelect');
const clock = document.getElementById("clock");

clock.style.background = `black`; 

function populateLocationSelect() {
  const locationNames = Object.keys(locations).sort();
  locationNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    locationSelect.appendChild(option);
  });
}

locationSelect.addEventListener('change', function () {
  const selectedLocationName = locationSelect.value;
  if (!locations[selectedLocationName]) return;
  updateLocationDisplay(selectedLocationName, locations[selectedLocationName]);
});

function updateLocationDisplay(name, coords) {
  document.getElementById("sunrise").textContent = "--:-- Uhr";
  document.getElementById("sunset").textContent = "--:-- Uhr";
  updateSunTimes(coords.lat, coords.lon);
  
  currentTime = getCurrentTime(coords.timezone);
  startClock(coords.timezone);
}

function convertTo24HourFormat(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

async function updateSunTimes(lat, lon) {
  try {
    const response = await fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&timezone=auto`);
    const data = await response.json();
    sunriseTime = convertTo24HourFormat(data.results.sunrise);
    sunsetTime  = convertTo24HourFormat(data.results.sunset);
    document.getElementById("sunrise").textContent = `${sunriseTime} Uhr`;
    document.getElementById("sunset").textContent  = `${sunsetTime} Uhr`;
    updateBackground();  
  } catch (error) {
    console.error("Fehler beim Abrufen der Sonnenzeiten:", error);
  }
}

function updateClock(timezone) {
  const now = new Date();
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone
  };
  const timeString = new Intl.DateTimeFormat('de-DE', options).format(now);
  
  clock.innerHTML = timeString
    .split("")
    .map(char => `<span>${char}</span>`)
    .join("");
}

let clockInterval;
function startClock(timezone) {
  clearInterval(clockInterval);
  updateClock(timezone);
  clockInterval = setInterval(() => updateClock(timezone), 60000);
}

function convertToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateDayPercentage(sunriseTime, sunsetTime, currentTime) {
  const sunriseMinutes = convertToMinutes(sunriseTime);
  const sunsetMinutes = convertToMinutes(sunsetTime);
  const currentMinutes = convertToMinutes(currentTime);
  const middayMinutes = 720; 

  let percentage = 0;

  if (currentMinutes >= sunriseMinutes && currentMinutes <= middayMinutes) {
    percentage = ((currentMinutes - sunriseMinutes) / (middayMinutes - sunriseMinutes)) * 100;
  } else if (currentMinutes > middayMinutes && currentMinutes <= sunsetMinutes) {
    percentage = 100 - ((currentMinutes - middayMinutes) / (sunsetMinutes - middayMinutes)) * 100;
  }

  return percentage;
}

function updateBackground() {
  if (sunriseTime && sunsetTime && currentTime) {
    let percentage = calculateDayPercentage(sunriseTime, sunsetTime, currentTime);
    
    const spans = clock.querySelectorAll("span");
    spans.forEach(span => {
      span.style.background = `linear-gradient(0deg, rgba(216, 180, 254, 1) ${percentage-10}%, rgba(216, 180, 254, 0) ${percentage+10}%)`;
    });
  }
}

function getCurrentTime(timezone) {
  const now = new Date();
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone
  };
  const timeString = new Intl.DateTimeFormat('de-DE', options).format(now);
  return timeString;
}

window.onload = function () {
  populateLocationSelect();
};
