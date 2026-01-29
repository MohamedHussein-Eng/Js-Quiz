

// SideBar And Loading
let links = document.querySelectorAll(" a[data-view]")
let sections = document.querySelectorAll("section")
const loading = document.getElementById("loading-overlay");

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    // Don't show loading if clicking already active link
    if (link.classList.contains("active")) return;

    loading.classList.remove("hidden");

    let view = link.getAttribute("data-view");

    // Update links
    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Update sections
    sections.forEach((section) => {
      section.classList.remove("active");
      let id = section.getAttribute("id");
      if (id.includes(view)) {
        location.hash = id;
        section.classList.add("active");
      }
    });

    // Hide loading quickly (just for visual feedback)
    setTimeout(() => {
      loading.classList.add("hidden");
    }, 200);
  });
});

// DashBoardApi
let selectCountry = document.querySelector("#global-country")
let globalYear = document.querySelector("#global-year")
let globalCity = document.querySelector("#global-city")
let selectedCountryFlag = document.querySelector("#selected-country-flag")
let selectedCountryName = document.querySelector("#selected-country-name")
let selectedCityName = document.querySelector("#selected-city-name")
let globalSearchBtn = document.querySelector("#global-search-btn")
const countryTrigger = document.querySelector("#global-country-trigger")
const countryDropdown = document.querySelector("#global-country-dropdown")
const countryOptionsEl = document.querySelector("#global-country-options")
const countrySearchInput = document.querySelector("#global-country-search")
let countriesList = []

// Holidays empty-state (No Country Selected)
const holidaysEmptyState = document.querySelector("#holidays-empty-state");
const goToDashboardBtn = document.querySelector("#go-to-dashboard-btn");

// Events empty-state (No Country Selected)
const eventsEmptyState = document.querySelector("#events-empty-state");
const goToDashboardBtnFromEvent = document.querySelector("#go-to-dashboard-btn-from-event");
// Weather empty-state (No Country Selected)
let weatherEmptyState = document.querySelector("#weather-empty-state")
let goToDashboardBtnWeather = document.querySelector("#go-to-dashboard-weather")
// Weekend empty-state (No Country Selected)
let longWeekendEmptyState = document.querySelector("#long-weekend-empty-state")
let goToDashboardLongWeekend = document.querySelector("#go-to-dashboard-long-weekend")
// sunTimes empty-state (No Country Selected)
let sunTimesEmptyState = document.querySelector("#sun-times-empty-state")
let goToDashboardSunTimes = document.querySelector("#go-to-dashboard-sun-times")


getDashBoardApi()
async function getDashBoardApi() {
  let req = await fetch("https://date.nager.at/api/v3/AvailableCountries")
  let data = await req.json()
  countriesList = data
  displayCountries(data)
  setupCountryDropdown()
}
function setupCountryDropdown() {

  function openClose() {
    countryDropdown.classList.toggle("open");
    countryTrigger.classList.toggle("open");

    if (countryDropdown.classList.contains("open")) {
      countrySearchInput.value = "";
      filterCountryOptions("");
      countrySearchInput.focus();
    }
  }

  countryTrigger.addEventListener("click", openClose);

  function filterCountryOptions(query) {
    query = (query || "").trim().toLowerCase();


    const options = countryOptionsEl.querySelectorAll(".custom-select-option:not(.no-results)");

    options.forEach(option => {
      const name = option.dataset.name.toLowerCase();
      const code = option.dataset.code.toLowerCase();
      const isVisible = query === "" || name.includes(query) || code.includes(query);

      option.style.display = isVisible ? "flex" : "none";
    });


    const visibleOptions = countryOptionsEl.querySelectorAll(
      ".custom-select-option:not(.no-results)[style*='display: flex']"
    );

    let noResultsMsg = countryOptionsEl.querySelector(".no-results");
    if (visibleOptions.length === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement("div");
        noResultsMsg.className = "custom-select-option no-results";
        noResultsMsg.textContent = "No countries found";
        countryOptionsEl.appendChild(noResultsMsg);
      }
      noResultsMsg.style.display = "flex";
    } else if (noResultsMsg) {
      noResultsMsg.style.display = "none";
    }
  }


  countrySearchInput.addEventListener("input", (e) => {
    filterCountryOptions(e.target.value);
  });


  countryOptionsEl.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-select-option:not(.no-results)");
    if (!option) return;

    const code = option.dataset.code;
    const name = option.dataset.name;
    const flagUrl = option.dataset.flag;


    const flagSlot = countryTrigger.querySelector(".flag-slot");
    const textEl = countryTrigger.querySelector(".selected-text");

    flagSlot.innerHTML = `<img src="${flagUrl}" alt="${name}" width="20">`;
    textEl.textContent = name;
    textEl.classList.remove("placeholder");

    selectCountry.value = code;


    countryOptionsEl.querySelectorAll(".custom-select-option").forEach(opt => {
      opt.classList.remove("selected");
    });
    option.classList.add("selected");


    countryDropdown.classList.remove("open");
    countryTrigger.classList.remove("open");


    selectCountryInfo(code);
    displayCities(code);
  });


  document.addEventListener("click", (e) => {
    if (!countryTrigger.contains(e.target) && !countryDropdown.contains(e.target)) {
      countryDropdown.classList.remove("open");
      countryTrigger.classList.remove("open");
    }
  });


}

function displayCountries(list) {
  countryOptionsEl.innerHTML = ""
  list.forEach((ele) => {
    const code = ele.countryCode.toLowerCase()
    const flagUrl = `https://flagcdn.com/w40/${code}.png`
    const opt = document.createElement("div")
    opt.className = "custom-select-option"
    opt.dataset.code = code
    opt.dataset.name = ele.name
    opt.dataset.flag = flagUrl
    opt.innerHTML = `
      <span class="flag"><img src="${flagUrl}" alt="${ele.name}" class="flag-img"></span>
      <span class="country-name">${ele.name}</span>
      <span class="country-code">${ele.countryCode}</span>
    `
    countryOptionsEl.appendChild(opt)


  })
}
async function displayCities(code) {


  while (globalCity.options.length > 1) {
    globalCity.remove(1);
  }

  let req = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
  let data = await req.json();
  let optionCity = document.createElement("option");
  optionCity.value = data[0].capital[0];
  optionCity.innerText = data[0].capital[0] + "(Capital)";
  globalCity.appendChild(optionCity);

}


// Country Information
let dashboardCountryFlag = document.querySelector(".dashboard-country-flag")
let countryName = document.querySelector("#country-name")
let officialName = document.querySelectorAll(".official-name")
let region = document.querySelector(".region")
let localTimeZone = document.querySelector(".local-time-zone")
let countryCapital = document.querySelector("#country-capital")
let countryPopulation = document.querySelector("#country-population")
let countryArea = document.querySelector("#country-area")
let countryContinent = document.querySelector("#country-Continent")
let callingCode = document.querySelector("#Calling-code")
let drivingSide = document.querySelector("#Driving-side")
let weekStart = document.querySelector("#week-start")
let Currency = document.querySelector("#Currency")
let language = document.querySelector("#language")
let btnMapLink = document.querySelector(".btn-map-link")
let neighbors = document.querySelector("#Neighbors")
const emptyBox = document.getElementById("dashboard-country-info-empty");
const dataBox = document.getElementById("dashboard-country-info");
// Holidays
// view-header-selection (date+flag+country)
let holidaysContent = document.querySelector("#holidays-content")
let viewHeaderSelection = document.querySelector("#holidays-selection")
let selectionFlagCountry = document.querySelector(".selection-flag")
let selectionNameCountry = document.querySelector("#selection-name-country")
let selectionYearCountry = document.querySelector("#selection-year-country")




// Events to Explore Btn
globalSearchBtn.addEventListener("click", function (e) {

  if (countryTrigger.textContent.trim() !== "" && countryTrigger.textContent.trim() !== "Select Country") {
    emptyBox.classList.add("hidden");
    dataBox.classList.remove("hidden");

    displayToast(countryTrigger.textContent.trim(), globalCity.textContent.trim())
    // Country Information
    getCountryDetalis(selectCountry.value.toLowerCase())
    // country holidayes
    getCountryHolidays(selectCountry.value.toLowerCase(), globalYear.value)
    // Sun Times (dynamic lat/lng based on selected country)
    updateSunTimes(selectCountry.value.toLowerCase(), globalCity.value)

    // Events
    getEvents(globalCity.value.toLowerCase(), selectCountry.value.toLowerCase())
    // weather
    getWeather(selectCountry.value.toLowerCase())
    // weekEnds
    getWeekEnds(selectCountry.value.toLowerCase(), globalYear.value)
  }
  displayToast(countryTrigger.textContent.trim(), globalCity.textContent.trim())



})
// frist Card
async function selectCountryInfo(code) {
  let div = document.querySelector(".selected-destination ")
  div.classList.remove("hidden")
  selectedCountryFlag.src = `https://flagcdn.com/w40/${code}.png`
  let req = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
  let data = await req.json()
  console.log(data[0].name);

  selectedCountryName.innerHTML = data[0].name.common
  selectedCityName.innerHTML = data[0].capital
  // xButton
  let xBtn = document.querySelector("#clear-selection-btn")
  xBtn.addEventListener("click", () => {

    div.classList.add("hidden")
    const selectedText = countryTrigger.querySelector(".selected-text");
    const flagSlot = countryTrigger.querySelector(".flag-slot");

    if (selectedText) {
      selectedText.textContent = "Select Country";
      selectedText.classList.add("placeholder");
    }

    if (flagSlot) {
      flagSlot.innerHTML = "";
    }

    document.getElementById("global-country").value = ""
    setHolidaysEmptyUI(true);
    if (dataBox.classList.contains("hidden")) {
      return
    }
    else {
      dataBox.classList.add("hidden")
      emptyBox.classList.remove("hidden")
    }
  })


}
function updateClock() {
  setInterval(function () {
    const now = new Date();

    // Subtract 2 hours
    const twoHoursAgo = new Date(now);
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    // Format the time
    const time = twoHoursAgo.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Update the element
    document.getElementById('country-local-time').textContent = time;
  }, 1000);
}
// get Information in dashboard
async function getCountryDetalis(code) {
  dashboardCountryFlag.src = `https://flagcdn.com/w40/${code}.png`
  let req = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
  let data = await req.json()
  countryName.innerHTML = data[0].name.common
  officialName.innerHTML = data[0].name.official
  region.innerHTML = data[0].region + " • " + data[0].subregion
  localTimeZone.innerHTML = data[0].timezones[0]
  countryCapital.innerHTML = data[0].capital
  countryPopulation.innerHTML = data[0].population
  countryArea.innerHTML = data[0].area + " " + "km²"
  countryContinent.innerHTML = data[0].continents[0]
  callingCode.innerHTML = data[0].idd.root + data[0].idd.suffixes[0]
  drivingSide.innerHTML = data[0].car.side
  weekStart.innerHTML = data[0].startOfWeek
  updateClock()

  Currency.innerHTML = Object.values(data[0].currencies)[0].name + " " + "(" + Object.keys(data[0].currencies)[0] + " " + Object.values(data[0].currencies)[0].symbol + ")"
  language.innerHTML = Object.values(data[0].languages)
  displatNeighbors(data[0].borders)
  btnMapLink.href = data[0].maps.googleMaps


}
// Display Neightbor 
function displatNeighbors(list) {
  let temp = ""
  if (list.length === 0) {
    temp = " "
    return
  }
  for (let i = 0; i < list.length; i++) {
    temp +=
      `
    <span class="extra-tag border-tag">${list[i]}</span>

    `

  }
  neighbors.innerHTML = temp
}
// Holidays
// Change header
async function displayViewHeader(code, year) {

  let req = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
  let data = await req.json()
  displayHolidayesHeader(data, code, year)
  viewHeaderSelection.style.display = "block"
}
function displayHolidayesHeader(data, code, year) {
  selectionFlagCountry.src = `https://flagcdn.com/w40/${code}.png`
  selectionNameCountry.innerHTML = data[0].name.common
  selectionYearCountry.innerHTML = year;
}

// get Holidays
async function getCountryHolidays(code, year) {

  displayViewHeader(code, year)
  let req = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`)
  let data = await req.json()
  displayHolidays(data)

}
// Display Holidays cards
function displayHolidays(list) {
  holidaysContent.innerHTML = ""; // clear first

  list.forEach(item => {
    const date = new Date(item.date);

    const card = document.createElement("div");
    card.className = "holiday-card";

    // Check if this holiday is already saved
    const isSaved = isHolidaySaved(item.localName, date);

    card.innerHTML = `
      <div class="holiday-card-header">
        <div class="holiday-date-box">
          <span class="day">${date.getDate()}</span>
          <span class="month">${date.toLocaleDateString("en-US", { month: "long" })}</span>
        </div>
        <button class="holiday-action-btn ${isSaved ? 'saved' : ''}">
          <i class="fa-${isSaved ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>

      <h3>${item.localName}</h3>
      <p class="holiday-name">${item.name}</p>

      <div class="holiday-card-footer">
        <span class="holiday-day-badge">
          <i class="fa-regular fa-calendar"></i>
          ${date.toLocaleDateString("en-US", { weekday: "long" })}
        </span>
        <span class="holiday-type-badge">${item.types[0]}</span>
      </div>
    `;

    // attach event listener properly - pass button reference
    const btn = card.querySelector(".holiday-action-btn");
    btn.addEventListener("click", () => {
      addHolidayPlan(item.localName, item.name, date, btn);
    });

    holidaysContent.appendChild(card);
  });
}

// Events
async function getEvents(city, code) {
  let req = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=f72qNiTIKamjMcDIcyw1V4NntUngci9X&city=${city}&countryCode=${code}&size=20`)
  let data = await req.json()
  console.log(data);
  displayEvents(data)
}
function displayEvents(list) {
  const eventsContent = document.querySelector("#events-content");
  eventsContent.innerHTML = "";

  const events = Array.isArray(list) ? list : (list?._embedded?.events || []);
  const options = { weekday: "long", day: "numeric", month: "long" };

  events.forEach(event => {
    const date = new Date(event?.dates?.start?.localDate);
    const formattedDate = date.toLocaleDateString("en-US", options);
    const venue = event?._embedded?.venues?.[0];
    const eventId = event.id || `event-${Date.now()}`;

    // Check if saved
    const isSaved = isEventSaved(eventId);

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <div class="event-card-image">
        <img src="${event?.images?.[0]?.url || ""}" alt="${event?.name || "Event"}">
        <span class="event-card-category">${event?.classifications?.[0]?.segment?.name || ""}</span>
        <button class="event-card-save ${isSaved ? 'saved' : ''}">
          <i class="fa-${isSaved ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="event-card-body">
        <h3>${event.name}</h3>
        <div class="event-card-info">
          <div><i class="fa-regular fa-calendar"></i> ${formattedDate}</div>
          <div><i class="fa-solid fa-location-dot"></i> ${venue?.name || ""}${venue?.city?.name ? `, ${venue.city.name}` : ""}</div>
        </div>
      </div>
    `;

    // Add event listener
    const btn = card.querySelector(".event-card-save");
    btn.addEventListener("click", () => {
      addEventPlan(eventId, event.name, formattedDate, venue?.name || "", btn);
    });

    eventsContent.appendChild(card);
  });
}

// Weather
let weatherContent = document.querySelector("#weather-content")
async function getWeather(countryCode) {
  let req = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
  let data = await req.json()
  let lat = data[0].capitalInfo.latlng[0]
  let lon = data[0].capitalInfo.latlng[1]
  let cityName = data[0].capital

  let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset&timezone=auto`;

  let weather = await fetch(weatherUrl);
  let weatherData = await weather.json();


  // Update current weather
  const now = new Date();
  document.querySelector(".weather-location span").textContent = cityName;
  document.querySelector(".weather-time").textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.querySelector(".temp-value").textContent = Math.round(weatherData.current.temperature_2m);
  document.querySelector(".weather-condition").textContent = getWeatherText(weatherData.current.weather_code);
  document.querySelector(".weather-feels").textContent = `Feels like ${Math.round(weatherData.current.apparent_temperature)}°C`;
  document.querySelector(".high").innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${Math.round(weatherData.daily.temperature_2m_max[0])}°`;
  document.querySelector(".low").innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${Math.round(weatherData.daily.temperature_2m_min[0])}°`;

  // Update weather icon
  document.querySelector(".weather-hero-icon i").className = `fa-solid ${getWeatherIcon(weatherData.current.weather_code)}`;

  // Update details
  document.querySelectorAll(".detail-value")[0].textContent = `${weatherData.current.relative_humidity_2m}%`;
  document.querySelectorAll(".detail-value")[1].textContent = `${Math.round(weatherData.current.wind_speed_10m)} km/h`;
  document.querySelectorAll(".detail-value")[2].textContent = weatherData.current.uv_index;
  document.querySelectorAll(".detail-value")[3].textContent = `${weatherData.daily.precipitation_probability_max[0]}%`;

  // Update hourly forecast
  const hourly = document.querySelector(".hourly-scroll");
  hourly.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const hour = new Date();
    hour.setHours(hour.getHours() + i);
    const timeText = i === 0 ? "Now" : hour.getHours() % 12 || 12;
    const ampm = hour.getHours() >= 12 ? "PM" : "AM";

    hourly.innerHTML += `
      <div class="hourly-item ${i === 0 ? "now" : ""}">
        <span class="hourly-time">${i === 0 ? "Now" : timeText + " " + ampm}</span>
        <div class="hourly-icon"><i class="fa-solid ${getWeatherIcon(weatherData.hourly.weather_code[i])}"></i></div>
        <span class="hourly-temp">${Math.round(weatherData.hourly.temperature_2m[i])}°</span>
      </div>
    `;
  }

  // Update 7-day forecast
  const forecast = document.querySelector(".forecast-list");
  forecast.innerHTML = "";

  const dayNames = ['Today', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateText = date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' });

    forecast.innerHTML += `
      <div class="forecast-day ${i === 0 ? "today" : ""}">
        <div class="forecast-day-name">
          <span class="day-label">${dayNames[i]}</span>
          <span class="day-date">${dateText}</span>
        </div>
        <div class="forecast-icon"><i class="fa-solid ${getWeatherIcon(weatherData.daily.weather_code[i])}"></i></div>
        <div class="forecast-temps">
          <span class="temp-max">${Math.round(weatherData.daily.temperature_2m_max[i])}°</span>
          <span class="temp-min">${Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
        </div>
        <div class="forecast-precip">
          ${weatherData.daily.precipitation_probability_max[i] > 0 ?
        `<i class="fa-solid fa-droplet"></i><span>${weatherData.daily.precipitation_probability_max[i]}%</span>` : ''}
        </div>
      </div>
    `;
  }

  // Hide loading
  document.getElementById("loading-overlay").classList.add("hidden");
}

function getWeatherText(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 80 && code <= 86) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Clear";
}

function getWeatherIcon(code) {
  if (code === 0 || code === 1) return "fa-sun";
  if (code === 2) return "fa-cloud-sun";
  if (code === 3) return "fa-cloud";
  if (code >= 45 && code <= 48) return "fa-smog";
  if (code >= 51 && code <= 67) return "fa-cloud-rain";
  if (code >= 80 && code <= 86) return "fa-cloud-showers-heavy";
  if (code >= 95) return "fa-bolt";
  return "fa-sun";
}



// Long weekEnd
let longWeekendContent = document.querySelector("#lw-content")
async function getWeekEnds(countryCode, year) {
  let req = await fetch(`https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`)
  let data = await req.json()
  showLongWeekends(data)
}
function showLongWeekends(data) {
  const container = document.getElementById("lw-content");
  container.innerHTML = "";
  container.classList.remove("hidden");

  data.forEach((w, i) => {
    const start = new Date(w.startDate);
    const end = new Date(w.endDate);
    const dateText = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const weekendId = `lw-${start.toISOString().split('T')[0]}-${i}`;

    // Check if saved
    const isSaved = isLongWeekendSaved(weekendId);

    const card = document.createElement("div");
    card.className = "lw-card";

    // Create days visualization
    let daysHTML = "";
    let current = new Date(start);
    for (let day = 0; day < w.dayCount; day++) {
      const dayName = current.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);
      const dayNum = current.getDate();
      const isWeekend = current.getDay() === 5 || current.getDay() === 6;
      daysHTML += `<div class="lw-day ${isWeekend ? 'weekend' : ''}">
                    <span class="name">${dayName}</span>
                    <span class="num">${dayNum}</span>
                   </div>`;
      current.setDate(current.getDate() + 1);
    }

    card.innerHTML = `
      <div class="lw-card-header">
        <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${w.dayCount} Days</span>
        <button class="holiday-action-btn ${isSaved ? 'saved' : ''}">
          <i class="fa-${isSaved ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <h3>Long Weekend #${i + 1}</h3>
      <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${dateText}</div>
      <div class="lw-info-box ${w.needBridgeDay ? 'warning' : 'success'}">
        <i class="fa-solid fa-${w.needBridgeDay ? 'info-circle' : 'check-circle'}"></i>
        ${w.needBridgeDay ? 'Requires taking a bridge day off' : 'No extra days off needed!'}
      </div>
      <div class="lw-days-visual">${daysHTML}</div>
    `;

    // Add event listener
    const btn = card.querySelector(".holiday-action-btn");
    btn.addEventListener("click", () => {
      addLongWeekendPlan(weekendId, `Long Weekend #${i + 1}`, dateText, w.dayCount, w.needBridgeDay, btn);
    });

    container.appendChild(card);
  });
}
// sunTimes

async function updateSunTimes(countryCode, cityName) {

  const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
  const countryData = await countryRes.json();

  const latlng = countryData[0].capitalInfo?.latlng || countryData[0].latlng;
  const lat = latlng[0];
  const lng = latlng[1];

  const today = new Date().toISOString().split("T")[0];
  const sunRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${today}&formatted=0`);
  const sunData = await sunRes.json();

  function formatTime(timeString) {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const daySeconds = sunData.results.day_length;
  const dayHours = Math.floor(daySeconds / 3600);
  const dayMinutes = Math.round((daySeconds % 3600) / 60);
  const dayPercent = (daySeconds / 86400 * 100).toFixed(1);


  document.querySelector("#sun-flag").src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  document.querySelector("#sun-country-name").textContent = countryData[0].name.common;
  document.querySelector("#sun-city-name").textContent = cityName || countryData[0].capital?.[0] || "";
  document.querySelector("#sun-location-city").textContent = cityName || countryData[0].capital?.[0] || "";

  document.querySelector("#sun-date-text").textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.querySelector("#sun-day-text").textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  document.querySelector("#sun-dawn").textContent = formatTime(sunData.results.civil_twilight_begin);
  document.querySelector("#sun-sunrise").textContent = formatTime(sunData.results.sunrise);
  document.querySelector("#sun-solar-noon").textContent = formatTime(sunData.results.solar_noon);
  document.querySelector("#sun-sunset").textContent = formatTime(sunData.results.sunset);
  document.querySelector("#sun-dusk").textContent = formatTime(sunData.results.civil_twilight_end);

  document.querySelector("#sun-day-length").textContent = `${dayHours}h ${dayMinutes}m`;
  document.querySelector("#sun-daylight-value").textContent = `${dayHours}h ${dayMinutes}m`;
  document.querySelector("#sun-daylight-percent").textContent = `${dayPercent}%`;
  document.querySelector("#sun-darkness-value").textContent = `${24 - dayHours}h ${60 - dayMinutes}m`;
  document.querySelector("#sun-daylight-bar").style.width = `${dayPercent}%`;
}

// currency data
let currencyAmount = document.querySelector("#currency-amount")
let currencyFrom = document.querySelector("#currency-from")
let currencyTo = document.querySelector("#currency-to")
let convertBtn = document.querySelector("#convert-btn")
convertBtn.addEventListener("click", () => {


  getcurrencies(currencyFrom.value.trim().split("-")[0], currencyTo.value.trim().split("-")[0], currencyAmount.value.trim())
})

// currencies
async function getcurrencies(currencyFrom, currencyTo, currencyAmount) {
  let req = await fetch(` https://v6.exchangerate-api.com/v6/805842951e5953ad31497176/pair/${currencyFrom}/${currencyTo}/${currencyAmount}`)
  let data = await req.json()

}
// My plans
function addHolidayPlan(localName, name, date, button) {
  // Get existing holidays from localStorage
  let holidayArr = JSON.parse(localStorage.getItem("holidays")) || [];

  // Create unique identifier for this holiday
  const holidayId = `${localName}-${date.toISOString().split('T')[0]}`;

  // Check if holiday already exists
  const existingIndex = holidayArr.findIndex(holiday => holiday.id === holidayId);

  if (existingIndex !== -1) {
    // Remove from saved holidays
    holidayArr.splice(existingIndex, 1);

    // Update button to unfilled heart
    const heartIcon = button.querySelector('i');
    heartIcon.className = 'fa-regular fa-heart';
    button.classList.remove('saved');

    // Show removal toast
    showHolidayToast(`Removed "${localName}" from your plans`, 'removed');
  } else {
    // Add to saved holidays
    const holidayObj = {
      localName,
      name,
      date: date.toISOString(),
      type: "Holiday",
      id: holidayId,
      savedAt: new Date().toISOString()
    };

    holidayArr.push(holidayObj);

    // Update button to filled heart
    const heartIcon = button.querySelector('i');
    heartIcon.className = 'fa-solid fa-heart';
    button.classList.add('saved');

    // Show success toast
    showHolidayToast(`Added "${localName}" to your plans`, 'added');
    displayMyPlans()
  }

  // Save updated array to localStorage
  localStorage.setItem("holidays", JSON.stringify(holidayArr));
  console.log('Updated holiday plans:', holidayArr);
}


function isHolidaySaved(localName, date) {
  const holidayArr = JSON.parse(localStorage.getItem("holidays")) || [];
  const holidayId = `${localName}-${date.toISOString().split('T')[0]}`;
  return holidayArr.some(holiday => holiday.id === holidayId);
}


function getSavedHolidays() {
  return JSON.parse(localStorage.getItem("holidays")) || [];
}


function removeHolidayPlan(holidayId) {
  let holidayArr = getSavedHolidays();
  const updatedArr = holidayArr.filter(holiday => holiday.id !== holidayId);
  localStorage.setItem("holidays", JSON.stringify(updatedArr));
  return updatedArr;
}
// events
function addEventPlan(eventId, name, date, venue, button) {
  // Get existing events from localStorage
  let eventArr = JSON.parse(localStorage.getItem("events")) || [];

  // Check if event already exists
  const existingIndex = eventArr.findIndex(event => event.id === eventId);

  if (existingIndex !== -1) {
    // Remove from saved events
    eventArr.splice(existingIndex, 1);

    // Update button to unfilled heart
    const heartIcon = button.querySelector('i');
    heartIcon.className = 'fa-regular fa-heart';
    button.classList.remove('saved');

    // Show removal toast (optional - remove if you don't want alerts)
    showHolidayToast(`Removed "${name}" from your events`, 'removed');
  } else {
    // Add to saved events
    const eventObj = {
      id: eventId,
      name,
      date,
      venue,
      type: "Event",
      savedAt: new Date().toISOString()
    };

    eventArr.push(eventObj);

    // Update button to filled heart
    const heartIcon = button.querySelector('i');
    heartIcon.className = 'fa-solid fa-heart';
    button.classList.add('saved');

    // Show success toast (optional - remove if you don't want alerts)
    showHolidayToast(`Added "${name}" to your events`, 'added');
  }

  // Save updated array to localStorage
  localStorage.setItem("events", JSON.stringify(eventArr));
  console.log('Updated event plans:', eventArr);
  displayMyPlans()
}

function isEventSaved(eventId) {
  const events = JSON.parse(localStorage.getItem("savedEvents")) || [];
  return events.some(e => e.id === eventId);
}
// 
function addLongWeekendPlan(weekendId, title, dateRange, daysCount, needBridge, button) {
  // Get existing long weekends from localStorage
  let weekendArr = JSON.parse(localStorage.getItem("longWeekends")) || [];

  // Check if weekend already exists
  const existingIndex = weekendArr.findIndex(weekend => weekend.id === weekendId);

  if (existingIndex !== -1) {
    // Remove from saved weekends
    weekendArr.splice(existingIndex, 1);

    // Update button to unfilled heart
    const heartIcon = button.querySelector('i');
    heartIcon.className = 'fa-regular fa-heart';
    button.classList.remove('saved');

    showHolidayToast(`Removed "${title}" from your weekends`, 'removed');
  } else {
    // Add to saved weekends
    const weekendObj = {
      id: weekendId,
      title,
      dateRange,
      daysCount,
      needBridge,
      type: "Long Weekend",
      savedAt: new Date().toISOString()
    };

    weekendArr.push(weekendObj);

    // Update button to filled heart
    const heartIcon = button.querySelector('i');
    heartIcon.className = 'fa-solid fa-heart';
    button.classList.add('saved');

    showHolidayToast(`Added "${title}" to your weekends`, 'added');
    displayMyPlans()
  }

  // Save updated array to localStorage
  localStorage.setItem("longWeekends", JSON.stringify(weekendArr));
  console.log('Updated weekend plans:', weekendArr);
}


function isLongWeekendSaved(weekendId) {
  const weekends = JSON.parse(localStorage.getItem("savedWeekends")) || [];

  weekends.some(w => w.id === weekendId);
}

// ========== HELPER FUNCTION ==========
function showToast(message, type) {
  // Create or use your existing toast function
  console.log(`${type.toUpperCase()}: ${message}`);
  // Your toast implementation here
}
//display:
displayMyPlans()
function displayMyPlans() {
  document.querySelector("#plans-count").classList.remove("hidden")
  document.querySelector("#plan-expty-state").classList.add("hidden");
  const plansContent = document.getElementById('plans-content');

  // Get saved items
  const holidays = JSON.parse(localStorage.getItem("holidays")) || [];
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const weekends = JSON.parse(localStorage.getItem("longWeekends")) || [];

  const total = holidays.length + events.length + weekends.length;
  document.querySelector("#plans-count").innerHTML = total

  // Update filter counts
  document.getElementById('filter-all-count').textContent = total;
  document.getElementById('filter-holiday-count').textContent = holidays.length;
  document.getElementById('filter-event-count').textContent = events.length;
  document.getElementById('filter-lw-count').textContent = weekends.length;

  if (total === 0) {
    document.querySelector("#plans-count").classList.add("hidden")
    plansContent.innerHTML = '';
    return;
  }

  // Build all cards
  let allCards = '';

  // Holidays cards
  holidays.forEach(holiday => {
    const date = new Date(holiday.date);
    allCards += `
      <div class="plan-card" data-type="holiday">
        <span class="plan-card-type holiday">Holiday</span>
        <div class="plan-card-content">
          <h4>${holiday.localName}</h4>
          <div class="plan-card-details">
            <div><i class="fa-regular fa-calendar"></i>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div><i class="fa-regular fa-note-sticky"></i>${holiday.name}</div>
          </div>
          <div class="plan-card-actions">
            <button class="btn-plan-remove" onclick="removeHoliday('${holiday.id}')">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // Events cards
  events.forEach(event => {
    allCards += `
      <div class="plan-card" data-type="event">
        <span class="plan-card-type event">Event</span>
        <div class="plan-card-content">
          <h4>${event.name}</h4>
          <div class="plan-card-details">
            <div><i class="fa-regular fa-calendar"></i>${event.date}</div>
            <div><i class="fa-solid fa-location-dot"></i>${event.venue || 'Location not specified'}</div>
          </div>
          <div class="plan-card-actions">
            <button class="btn-plan-remove" onclick="removeEvent('${event.id}')">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // Long Weekends cards
  weekends.forEach(weekend => {
    allCards += `
      <div class="plan-card" data-type="longweekend">
        <span class="plan-card-type longweekend">Long Weekend</span>
        <div class="plan-card-content">
          <h4>${weekend.title}</h4>
          <div class="plan-card-details">
            <div><i class="fa-regular fa-calendar"></i>${weekend.dateRange}</div>
            <div><i class="fa-solid fa-${weekend.needBridge ? 'info-circle' : 'check-circle'}"></i>${weekend.needBridge ? 'Bridge day needed' : 'No extra days needed'}</div>
          </div>
          <div class="plan-card-actions">
            <button class="btn-plan-remove" onclick="removeLongWeekend('${weekend.id}')">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });

  plansContent.innerHTML = allCards;

  // Initialize filters
  setupPlanFilters();
}

// Filter functionality
function setupPlanFilters() {
  const filterButtons = document.querySelectorAll('.plan-filter');

  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      // Get the filter type
      const filterType = this.getAttribute('data-filter');

      // Filter the cards
      filterPlanCards(filterType);
    });
  });
}

function filterPlanCards(filterType) {
  const allCards = document.querySelectorAll('.plan-card');

  allCards.forEach(card => {
    const cardType = card.getAttribute('data-type');

    if (filterType === 'all') {
      card.style.display = 'block';
    } else {
      // Convert filter to match card data-type
      let filterMatch = filterType;
      if (filterType === 'longweekend') {
        filterMatch = 'longweekend'; // exact match
      }

      if (cardType === filterMatch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// Remove functions
function removeHoliday(id) {
  let holidays = JSON.parse(localStorage.getItem("holidays")) || [];
  holidays = holidays.filter(h => h.id !== id);
  localStorage.setItem("holidays", JSON.stringify(holidays));
  displayMyPlans();
}

function removeEvent(id) {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events = events.filter(e => e.id !== id);
  localStorage.setItem("events", JSON.stringify(events));
  displayMyPlans();
}

function removeLongWeekend(id) {
  let weekends = JSON.parse(localStorage.getItem("longWeekends")) || [];
  weekends = weekends.filter(w => w.id !== id);
  localStorage.setItem("longWeekends", JSON.stringify(weekends));
  displayMyPlans();
}





document.getElementById('clear-all-plans-btn').addEventListener('click', function () {

  const holidays = JSON.parse(localStorage.getItem("holidays")) || [];
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const weekends = JSON.parse(localStorage.getItem("longWeekends")) || [];

  const totalPlans = holidays.length + events.length + weekends.length;

  if (totalPlans === 0) {

    Swal.fire({
      title: 'No Plans Found',
      text: 'You don\'t have any saved plans to clear.',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      timer: 2000,
      timerProgressBar: true
    });
    return;
  }
  Swal.fire({
    title: 'Clear All Plans?',
    text: "This will remove all your saved holidays, events, and long weekends. This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, clear all!',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("holidays");
      localStorage.removeItem("events");
      localStorage.removeItem("longWeekends");

      Swal.fire({
        title: 'Cleared!',
        text: 'All your saved plans have been removed.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true
      });

      displayMyPlans();
    }
  });
});






// Toast

let Toast = document.querySelector("#toast-container");

function displayToast(country, city) {
  console.log(country, city);

  Toast.classList.remove("hidden", "slide-out");
  Toast.classList.add("slide-in");

  let xIcon = document.createElement("i");
  xIcon.className = 'fa-solid fa-xmark';
  xIcon.style.cssText = "cursor: pointer;";

  if (country !== "" && country !== "Select Country") {
    let checkIcon = document.createElement("i");
    checkIcon.className = 'fa-solid fa-circle-check';

    Toast.innerHTML = "";
    Toast.appendChild(checkIcon);
    Toast.appendChild(document.createTextNode(` Exploring ${country}, ${city}!`));
    Toast.appendChild(xIcon);

    Toast.style.cssText = "display: flex;flex-direction: row;   justify-content: center; align-items: center; gap: 10px; background: #3D9B92; background: linear-gradient(90deg, rgba(61, 155, 146, 1) 17%, rgba(87, 199, 133, 1) 42%); padding: 10px; color: #fff; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateX(120%); transition: transform 0.3s ease-out;";

    // Trigger animation
    setTimeout(() => {
      Toast.style.transform = "translateX(0)";
    }, 10);

  } else {

    let iIcon = document.createElement("i");
    iIcon.className = "fa-solid fa-circle-info";

    Toast.innerHTML = "";
    Toast.appendChild(iIcon);
    Toast.appendChild(document.createTextNode(" Please select a country first"));
    Toast.appendChild(xIcon);

    Toast.style.cssText = "display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 10px; background: #36366b; background: linear-gradient(90deg, rgba(54, 54, 107, 1) 100%, rgba(0, 212, 255, 1) 100%); padding: 10px; color: #fff; font-size: 15px; font-weight: 700; border-radius: 10px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateX(120%); transition: transform 0.3s ease-out;";


    setTimeout(() => {
      Toast.style.transform = "translateX(0)";
    }, 10);
  }
  xIcon.addEventListener("click", function () {
    hideToast();
  });


  setTimeout(hideToast, 5000);
}
function hideToast() {

  Toast.classList.add("hidden");

  setTimeout(() => {
    Toast.classList.add("hidden");
  }, 300);
}
// cases in user don't select the country
// Holidays
// Check selections
function updateViews() {
  const country = selectCountry.value;


  // Show/hide based on selections
  holidaysEmptyState.classList.toggle("hidden", country);
  holidaysContent.classList.toggle("hidden", !country);
  eventsEmptyState.classList.toggle("hidden", country);
  document.getElementById("events-content").classList.toggle("hidden", !(country));
  weatherContent.classList.toggle("hidden", !country);
  weatherEmptyState.classList.toggle("hidden", country);
  longWeekendContent.classList.toggle("hidden", !country)
  longWeekendEmptyState.classList.toggle("hidden", country);
  sunTimesEmptyState.classList.toggle("hidden", country)
  document.getElementById("sun-times-content").classList.toggle("hidden", !(country));


}

updateViews();
selectCountry.addEventListener("change", updateViews);
document.getElementById("global-city")?.addEventListener("change", updateViews);

// Dashboard buttons
goToDashboardBtn.addEventListener("click", () => document.querySelector("a[data-view='dashboard']")?.click());
goToDashboardBtnFromEvent.addEventListener("click", () => document.querySelector("a[data-view='dashboard']")?.click());
goToDashboardBtnWeather.addEventListener("click", () => document.querySelector("a[data-view='dashboard']")?.click());
goToDashboardLongWeekend.addEventListener("click", () => document.querySelector("a[data-view='dashboard']")?.click());
goToDashboardSunTimes.addEventListener("click", () => document.querySelector("a[data-view='dashboard']")?.click());

// Show toast notification for holiday actions
function showHolidayToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `holiday-toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid fa-${type === 'added' ? 'heart' : 'heart-broken'}"></i>
    <span>${message}</span>
  `;

  // Add styles
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'added' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}