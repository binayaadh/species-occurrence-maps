// script.js
(function () {
  "use strict";

  // Custom divIcon for the user's location (blue circle)
  const userIcon = L.divIcon({
    html: '<div style="background-color: blue; width: 15px; height: 15px; border: 1px solid white; border-radius: 50%;"></div>',
    className: '',
    iconSize: [15, 15]
  });

  // Custom divIcon for occurrence markers (green circle)
  const occurrenceIcon = L.divIcon({
    html: '<div style="background-color: green; width: 10px; height: 10px; border: 1px solid white; border-radius: 50%;"></div>',
    className: '',
    iconSize: [15, 15]
  });

  // Global caches and variables
  const speciesCache = {};
  let countriesList = [];
  let lastSpeciesResults = null; // Store last fetched species occurrence data

  /**
   * Utility: Debounce function to delay execution of another function.
   */
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Utility: Show a Bootstrap Toast for notifications.
   */
  function showToast(message, type = "danger") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      document.body.appendChild(container);
    }
    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");
    toastEl.innerHTML = `<div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => {
      toastEl.remove();
    });
  }

  /**
   * Load countries data from the REST Countries API.
   */
  async function loadCountries() {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      if (!response.ok) {
        throw new Error(`Error fetching countries: ${response.status}`);
      }
      countriesList = await response.json();
      countriesList.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );
    } catch (error) {
      console.error("Error loading countries list:", error);
      showToast("Error loading country list. Some features may not work.", "warning");
    }
  }
  loadCountries();

  /**
   * Fetch species suggestions for autocomplete from GBIF.
   */
  async function fetchSpeciesSuggestions() {
    const query = document.getElementById("speciesInput").value.trim();
    const datalist = document.getElementById("speciesSuggestions");
    if (query.length < 2) {
      datalist.innerHTML = "";
      return;
    }
    try {
      const response = await fetch(
        `https://api.gbif.org/v1/species/suggest?q=${encodeURIComponent(query)}&limit=10`
      );
      if (!response.ok) {
        throw new Error(`Error fetching suggestions: ${response.status}`);
      }
      const suggestions = await response.json();
      datalist.innerHTML = "";
      suggestions.forEach((suggestion) => {
        if (suggestion.scientificName) {
          const option = document.createElement("option");
          option.value = suggestion.scientificName;
          datalist.appendChild(option);
        }
      });
    } catch (error) {
      console.error("Error fetching species suggestions:", error);
      showToast("Error fetching species suggestions.", "warning");
    }
  }
  document
    .getElementById("speciesInput")
    .addEventListener("input", debounce(fetchSpeciesSuggestions, 300));

  /**
   * Fetch country suggestions for autocomplete.
   */
  function fetchCountrySuggestions() {
    const query = document.getElementById("countryInput").value.trim().toUpperCase();
    const datalist = document.getElementById("countrySuggestions");
    if (query.length < 1) {
      datalist.innerHTML = "";
      return;
    }
    const suggestions = countriesList.filter((country) => {
      const code = country.cca2.toUpperCase();
      const name = country.name.common.toUpperCase();
      return code.includes(query) || name.includes(query);
    });
    datalist.innerHTML = "";
    suggestions.slice(0, 10).forEach((country) => {
      const option = document.createElement("option");
      option.value = country.cca2;
      option.text = `${country.cca2} - ${country.name.common}`;
      datalist.appendChild(option);
    });
  }
  document.getElementById("countryInput").addEventListener("input", fetchCountrySuggestions);

  /**
   * Populate Common Species Modal with category selection and species list.
   */
  document.addEventListener("DOMContentLoaded", () => {
    const commonSpeciesData = {
      Mammals: [
        { common: "Lion", scientific: "Panthera leo" },
        { common: "Tiger", scientific: "Panthera tigris" },
        { common: "Leopard", scientific: "Panthera pardus" },
        { common: "Jaguar", scientific: "Panthera onca" },
        { common: "Wolf", scientific: "Canis lupus" },
        { common: "Brown Bear", scientific: "Ursus arctos" },
        { common: "Elephant", scientific: "Loxodonta africana" },
        { common: "Gorilla", scientific: "Gorilla gorilla" },
        { common: "Orangutan", scientific: "Pongo pygmaeus" },
        { common: "Giant Panda", scientific: "Ailuropoda melanoleuca" },
        { common: "Bison", scientific: "Bison bison" },
        { common: "Cheetah", scientific: "Acinonyx jubatus" },
        { common: "Hippopotamus", scientific: "Hippopotamus amphibius" },
        { common: "Rhinoceros", scientific: "Diceros bicornis" },
        { common: "Moose", scientific: "Alces alces" },
      ],
      Birds: [
        { common: "Bald Eagle", scientific: "Haliaeetus leucocephalus" },
        { common: "Peregrine Falcon", scientific: "Falco peregrinus" },
        { common: "Common Raven", scientific: "Corvus corax" },
        { common: "Ostrich", scientific: "Struthio camelus" },
        { common: "Peacock", scientific: "Pavo cristatus" },
        { common: "African Grey Parrot", scientific: "Psittacus erithacus" },
        { common: "House Sparrow", scientific: "Passer domesticus" },
        { common: "Ruby-throated Hummingbird", scientific: "Archilochus colubris" },
        { common: "Green Woodpecker", scientific: "Picus viridis" },
        { common: "Kingfisher", scientific: "Alcedo atthis" },
        { common: "Greater Flamingo", scientific: "Phoenicopterus roseus" },
        { common: "Emperor Penguin", scientific: "Aptenodytes forsteri" },
        { common: "Barn Swallow", scientific: "Hirundo rustica" },
        { common: "Herring Gull", scientific: "Larus argentatus" },
        { common: "Blue Jay", scientific: "Cyanocitta cristata" },
      ],
      "Reptiles/Amphibians": [
        { common: "American Alligator", scientific: "Alligator mississippiensis" },
        { common: "Green Iguana", scientific: "Iguana iguana" },
        { common: "Komodo Dragon", scientific: "Varanus komodoensis" },
        { common: "Panther Chameleon", scientific: "Furcifer pardalis" },
        { common: "Garter Snake", scientific: "Thamnophis sirtalis" },
        { common: "King Cobra", scientific: "Ophiophagus hannah" },
        { common: "American Bullfrog", scientific: "Lithobates catesbeianus" },
        { common: "Common Toad", scientific: "Bufo bufo" },
        { common: "Axolotl", scientific: "Ambystoma mexicanum" },
        { common: "Eastern Newt", scientific: "Notophthalmus viridescens" },
        { common: "Nile Crocodile", scientific: "Crocodylus niloticus" },
        { common: "Green Sea Turtle", scientific: "Chelonia mydas" },
        { common: "Green Anole", scientific: "Anolis carolinensis" },
        { common: "Five-lined Skink", scientific: "Plestiodon fasciatus" },
        { common: "House Gecko", scientific: "Hemidactylus frenatus" },
      ],
      Insects: [
        { common: "Monarch Butterfly", scientific: "Danaus plexippus" },
        { common: "Honey Bee", scientific: "Apis mellifera" },
        { common: "Ladybug", scientific: "Coccinella septempunctata" },
        { common: "Dragonfly", scientific: "Anax junius" },
        { common: "Grasshopper", scientific: "Schistocerca americana" },
        { common: "Firefly", scientific: "Photinus pyralis" },
        { common: "Ant", scientific: "Formica rufa" },
        { common: "Beetle", scientific: "Coleoptera" },
        { common: "Moth", scientific: "Lepidoptera" },
        { common: "Mosquito", scientific: "Culicidae" },
        { common: "Cockroach", scientific: "Periplaneta americana" },
        { common: "Praying Mantis", scientific: "Mantis religiosa" },
        { common: "Termite", scientific: "Reticulitermes flavipes" },
        { common: "Wasp", scientific: "Vespula vulgaris" },
        { common: "Periodical Cicada", scientific: "Magicicada septendecim" },
      ],
      Plants: [
        { common: "Rose", scientific: "Rosa rubiginosa" },
        { common: "Sunflower", scientific: "Helianthus annuus" },
        { common: "Tulip", scientific: "Tulipa gesneriana" },
        { common: "Oak", scientific: "Quercus robur" },
        { common: "Maple", scientific: "Acer saccharum" },
        { common: "Pine", scientific: "Pinus sylvestris" },
        { common: "Bamboo", scientific: "Phyllostachys edulis" },
        { common: "Lavender", scientific: "Lavandula angustifolia" },
        { common: "Orchid", scientific: "Phalaenopsis amabilis" },
        { common: "Daisy", scientific: "Bellis perennis" },
        { common: "Daffodil", scientific: "Narcissus pseudonarcissus" },
        { common: "Cactus", scientific: "Carnegiea gigantea" },
        { common: "Fern", scientific: "Nephrolepis exaltata" },
        { common: "Ivy", scientific: "Hedera helix" },
        { common: "Mint", scientific: "Mentha spicata" },
      ],
    };

    const modalBody = document.getElementById("commonSpeciesModalBody");

    function showCategorySelection() {
      modalBody.innerHTML = "";
      Object.keys(commonSpeciesData).forEach((category) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-secondary m-1";
        btn.textContent = category;
        btn.addEventListener("click", () => {
          showSpeciesForCategory(category);
        });
        modalBody.appendChild(btn);
      });
    }

    function showSpeciesForCategory(category) {
      modalBody.innerHTML = "";
      const backBtn = document.createElement("button");
      backBtn.className = "btn btn-link mb-2";
      backBtn.textContent = "← Back";
      backBtn.addEventListener("click", showCategorySelection);
      modalBody.appendChild(backBtn);

      const ul = document.createElement("ul");
      ul.className = "list-group";
      commonSpeciesData[category].forEach((species) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.style.cursor = "pointer";
        li.textContent = `${species.common} (${species.scientific})`;
        li.addEventListener("click", () => {
          document.getElementById("speciesInput").value = species.scientific;
          const modalEl = document.getElementById("commonSpeciesModal");
          const modal =
            bootstrap.Modal.getInstance(modalEl) ||
            new bootstrap.Modal(modalEl);
          modal.hide();
          fetchSpecies();
        });
        ul.appendChild(li);
      });
      modalBody.appendChild(ul);
    }
    showCategorySelection();
  });

  /**
   * Map Initialization using Leaflet.
   */
  const map = L.map("map", {
    zoomControl: false,
    minZoom: 1,
    maxZoom: 18,
  }).setView([10, -15], 3);
  L.control.zoom({ position: "bottomleft" }).addTo(map);

  const basemaps = {
    osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }),
    "light carto": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; CartoDB",
    }),
    "dark carto": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; CartoDB",
    }),
    terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenTopoMap",
    }),
  };

  let currentBasemap = basemaps.osm;
  currentBasemap.addTo(map);

  const markersLayer = L.layerGroup().addTo(map);
  let heatLayer = null;

  /**
   * Show and hide the loading spinner.
   */
  function showLoading() {
    document.getElementById("loadingSpinner").classList.remove("d-none");
  }
  function hideLoading() {
    document.getElementById("loadingSpinner").classList.add("d-none");
  }

  /**
   * Change the basemap when the user selects a new option.
   */
  function changeBasemap(value) {
    if (currentBasemap) {
      map.removeLayer(currentBasemap);
    }
    currentBasemap = basemaps[value];
    currentBasemap.addTo(map);
  }
  window.changeBasemap = changeBasemap;

  /**
   * Parse year range input (e.g., "2000,2023").
   */
  function parseYearRange(yearRange) {
    const years = yearRange.split(",").map((y) => y.trim());
    if (years.length === 2) {
      const startYear = parseInt(years[0], 10);
      const endYear = parseInt(years[1], 10);
      if (!isNaN(startYear) && !isNaN(endYear) && startYear <= endYear) {
        return { startYear, endYear };
      }
    }
    return null;
  }

  /**
   * Update the occurrence bar chart using Chart.js.
   */
  function updateChart(results) {
    const chartContainer = document.getElementById("chartContainer");
    chartContainer.innerHTML = "";

    const countryCounts = {};
    results.forEach((d) => {
      if (d.country) {
        countryCounts[d.country] = (countryCounts[d.country] || 0) + 1;
      }
    });
    const chartData = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    if (chartData.length === 0) {
      chartContainer.textContent = "No valid country data available to display the chart.";
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    chartContainer.appendChild(canvas);

    const labels = chartData.map((item) => item.country);
    const dataCounts = chartData.map((item) => item.count);
    const data = {
      labels: labels,
      datasets: [
        {
          label: "Occurrences",
          data: dataCounts,
          backgroundColor: "#28a745",
          borderColor: "#218838",
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} occurrences`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: "Country" } },
          y: { title: { display: true, text: "Occurrences" }, beginAtZero: true },
        },
      },
    };

    new Chart(canvas, config);
  }
  window.updateChart = updateChart;

  /**
   * Fetch species occurrence data from GBIF with pagination.
   */
  async function fetchSpecies() {
    markersLayer.clearLayers();
    if (heatLayer) {
      map.removeLayer(heatLayer);
      heatLayer = null;
      document.getElementById("heatmapLegend").classList.add("d-none");
    }
    // Hide chart offcanvas and clear previous chart content
    const chartOffcanvasEl = document.getElementById("offcanvasChart");
    const chartOffcanvas =
      bootstrap.Offcanvas.getInstance(chartOffcanvasEl) ||
      new bootstrap.Offcanvas(chartOffcanvasEl);
    chartOffcanvas.hide();
    document.getElementById("chartContainer").innerHTML = "";

    const species = document.getElementById("speciesInput").value.trim();
    const country = document.getElementById("countryInput").value.trim();
    const yearRangeInput = document.getElementById("yearRange").value.trim();

    if (!species) {
      showToast("Please enter a species name.", "warning");
      return;
    }

    let baseUrl = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(species)}&hasCoordinate=true`;
    if (country) {
      baseUrl += `&country=${encodeURIComponent(country)}`;
    }
    if (yearRangeInput) {
      const parsedYears = parseYearRange(yearRangeInput);
      if (parsedYears) {
        baseUrl += `&year=${parsedYears.startYear},${parsedYears.endYear}`;
      } else {
        showToast("Invalid year range. Please enter as 'startYear,endYear'.", "warning");
        return;
      }
    }

    const limit = 300;
    const maxRecords = 1200;
    let offset = 0;
    let allResults = [];
    let totalRecords = Infinity;

    showLoading();
    try {
      while (offset < totalRecords && offset < maxRecords) {
        const url = `${baseUrl}&limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from GBIF:", response.status, errorText);
          throw new Error(`GBIF API returned status ${response.status}`);
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
          break;
        }
        if (offset === 0 && data.count) {
          totalRecords = data.count;
        }
        allResults = allResults.concat(data.results);
        offset += limit;
      }

      if (allResults.length === 0) {
        showToast("No records found. Try different search criteria.", "warning");
        hideLoading();
        return;
      }

      lastSpeciesResults = allResults;

      const heatData = [];
      allResults.forEach((d) => {
        if (d.decimalLatitude && d.decimalLongitude) {
          const latLng = [d.decimalLatitude, d.decimalLongitude];
          // Use our custom occurrenceIcon for these markers
          const marker = L.marker(latLng, { icon: occurrenceIcon })
            .bindPopup(`
        <b>${d.scientificName}</b><br>
        🗓️ Date: ${d.eventDate || "Unknown"}<br>
        📍 Country: ${d.country || "Unknown"}
      `)
            .bindTooltip(`
        <b>${d.scientificName}</b><br>
        🗓️ Date: ${d.eventDate || "Unknown"}<br>
        📍 Country: ${d.country || "Unknown"}
      `, {
              direction: "top",
              opacity: 0.9,
            });
          markersLayer.addLayer(marker);
          heatData.push(latLng);
        }
      });


      // Ensure markersLayer is added back to the map
      if (!map.hasLayer(markersLayer)) {
        map.addLayer(markersLayer);
      }

      heatLayer = L.heatLayer(heatData, {
        radius: 22,
        blur: 15,
        maxZoom: 10,
        gradient: { 0.25: "yellow", 0.5: "orange", 0.75: "red", 1: "purple" },
        minOpacity: 0.4,
      });

      if (markersLayer.getLayers().length > 0) {
        const group = L.featureGroup(markersLayer.getLayers());
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }

      fetchSpeciesDetails(species);
    } catch (error) {
      console.error("Error fetching species data:", error);
      showToast("Error fetching species data. Please try again later.", "danger");
    } finally {
      hideLoading();
    }
  }
  window.fetchSpecies = fetchSpecies;

  /**
   * Generate the Occurrence Bar Chart.
   */
  function generateChart() {
    if (lastSpeciesResults && lastSpeciesResults.length > 0) {
      updateChart(lastSpeciesResults);
      const chartOffcanvasEl = document.getElementById("offcanvasChart");
      const chartOffcanvas =
        bootstrap.Offcanvas.getInstance(chartOffcanvasEl) ||
        new bootstrap.Offcanvas(chartOffcanvasEl);
      chartOffcanvas.show();
    } else {
      showToast("Please perform a species search first to generate the chart.", "warning");
    }
  }
  window.generateChart = generateChart;

  /**
   * Fetch Species Details from Wikipedia.
   */
  async function fetchSpeciesDetails(species) {
    const detailsContainer = document.getElementById("speciesDetails");
    if (speciesCache[species]) {
      detailsContainer.innerHTML = speciesCache[species];
      return;
    }

    const formattedSpecies = species.replace(/\s/g, "_");
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedSpecies)}`;

    try {
      const response = await fetch(wikiUrl);
      if (!response.ok) {
        console.warn("Wikipedia API returned status", response.status);
        detailsContainer.innerHTML = `<p>No Wikipedia page found for "<b>${species}</b>".</p>`;
        speciesCache[species] = `<p>No Wikipedia page found for "<b>${species}</b>".</p>`;
        return;
      }
      const data = await response.json();
      let content = "";
      if (data.type === "standard") {
        content = `<h5>${data.title}</h5>
                   <img src="${data.thumbnail?.source ||
          "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
          }" alt="${data.title}" class="img-fluid mb-2">
                   <p>${data.extract}</p>
                   <a href="${data.content_urls.desktop.page}" target="_blank" class="btn btn-primary">🔗 Read More</a>`;
      } else {
        content = `<p>No Wikipedia page found for "<b>${species}</b>".</p>`;
      }
      detailsContainer.innerHTML = content;
      speciesCache[species] = content;
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
      detailsContainer.innerHTML = `<p>Error loading Wikipedia info for "<b>${species}</b>".</p>`;
    }
  }

  /**
   * Toggle between Heatmap and Marker view.
   */
  function toggleHeatmap() {
    if (heatLayer) {
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
        map.addLayer(markersLayer);
        document.getElementById("heatmapLegend").classList.add("d-none");
      } else {
        map.removeLayer(markersLayer);
        map.addLayer(heatLayer);
        document.getElementById("heatmapLegend").classList.remove("d-none");
      }
    } else {
      showToast("Fetch species first before toggling heatmap.", "warning");
    }
  }
  window.toggleHeatmap = toggleHeatmap;

  /**
   * Locate the user and center the map on their location.
   */
  function locateUser() {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "warning");
      return;
    }
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 4);
        // Use custom userIcon for the user's location marker
        const userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .bindPopup("You are here!");
        userMarker.addTo(map).openPopup();
        hideLoading();
      },
      (error) => {
        console.error(error);
        showToast("Unable to retrieve your location.", "warning");
        hideLoading();
      }
    );
  }
  window.locateUser = locateUser;
})();
