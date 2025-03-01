# Biodiversity Unveiled: A Global Perspective on Species Occurrence

The site is live at: [https://binayaadh.github.io/species-occurrence-maps/](https://binayaadh.github.io/species-occurrence-maps/)

## Overview

**Biodiversity Unveiled** is an interactive web mapping application that visualizes global species occurrence data. Using GBIF’s Occurrence API as the primary data source and integrating species details from the Wikipedia API, this tool transforms raw occurrence records into a visually engaging narrative. The map is designed to support researchers, conservationists, policymakers, and educators in exploring global biodiversity patterns.

## Data Sources & Technologies

### Primary Data Source
- **GBIF Occurrence API:**  
  Provides open access to millions of species occurrence records from around the globe.  
  - **API Endpoint:** [GBIF Occurrence API](https://api.gbif.org/v1/occurrence/search?hasCoordinate=true)
  - **Data Format:** The API returns JSON data (no GeoJSON was used), which is parsed directly for integration into the mapping application.

### Supplementary Data
- **Wikipedia API:**  
  Retrieves species details—such as summary texts and images—to enrich marker popups and tooltips.
- **REST Countries API:**  
  Supplies country information to support filter functionality.

### Technology Stack
- **Mapping & Visualization:**  
  - **Leaflet:** Core library for rendering the interactive map.
  - **Leaflet.heat:** For dynamic heatmap overlays.
  - **Chart.js:** For generating occurrence bar charts.
- **Frontend Framework:**  
  - **Bootstrap:** Provides a responsive layout with a fixed header and footer.
- **Data Processing:**  
  - Data is handled directly as JSON, with no conversion to GeoJSON.
- **Custom Scripting:**  
  - Custom JavaScript integrates filters, map interactions, and API calls.
- **Other Tools:**  
  - R and QGIS were used for initial data cleaning and wrangling.

## Project Objectives

### What
The application maps global species occurrence data to capture biodiversity across multiple taxonomic groups—mammals, birds, reptiles, insects, and plants. Its primary aim is to:
- Display spatial patterns and hotspots of species occurrence.
- Allow users to filter data by species, country, and basis of record.
- Offer additional context through detailed species information from Wikipedia.

### Where
The map has a global scope, emphasizing biodiversity hotspots and underexplored regions. Users can zoom in to inspect local patterns or view data on a continental scale.

### Why
As a PhD student specializing in ecology, I have firsthand experience interpreting complex ecological datasets. This project leverages my research insights and technical expertise to create a tool that:
- Supports conservation efforts by highlighting species density and distribution.
- Provides a user-friendly interface for policymakers, researchers, and educators.
- Enhances public understanding of global biodiversity through interactive visualization.

## User Interface & Features

- **Fixed Header & Footer:**  
  Ensure a consistent navigation experience.
- **Responsive Main Content:**  
  Includes an interactive Leaflet map, a sidebar for species details, and dynamic overlay buttons.
- **Filter Interface:**  
  Users can search by species scientific name, country code, and basis of record. A dedicated button for visualizing common species provides quick access to frequently queried data.
- **Interactive Overlays:**  
  Toggle between marker and heatmap views. Generate occurrence bar charts using Chart.js for supplementary insights.
- **Custom Markers:**  
  Distinct marker icons (created using Leaflet’s L.divIcon) are used for occurrence points and user location.

## Research & Data Processing

This project is part of an ongoing research initiative aimed at visualizing global species distribution patterns. By integrating occurrence data from GBIF with contextual species information from Wikipedia, the application provides an accessible platform for exploring biodiversity. Initial data cleaning and spatial transformations were conducted using R and QGIS.

## Links & Additional Resources

- **GBIF Occurrence API:** [GBIF API](https://api.gbif.org/v1/occurrence/search?hasCoordinate=true)
- **Wikipedia API:** [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)
- **Project Repository & Code:**  
  - [GitHub](https://github.com/binayaadh)
  - [Google Scholar](https://scholar.google.com/citations?user=By9S9uAAAAAJ&hl=en)
  - [ResearchGate](https://www.researchgate.net/profile/Binaya-Adhikari-2/research)

