# SoCal Coastal Flood Hazard Explorer (v1)
This project visualizes flood hazard zones that intersect with coastal cities in Southern California. It uses Web Components and the ArcGIS Maps SDK for JavaScript to load and process spatial data, then renders the results directly on the map.

## Features:
- Custom web components with encapsulated GIS logic
- Dynamically loads ArcGIS FeatureLayers
- Performs spatial intersection queries between layers

## Project Structure:
- fetch-feature-layer.ts: Loads a FeatureLayer and dispatches a "layer-loaded" event
- process-and-display-data.ts: Waits for loaded layers, queries spatial intersections, and renders results
- public/index.html: Main entry point for the web app
- tests/: Contains unit tests for each custom element

## How to Run:
- Clone the repository:
git clone https://github.com/nirvik-d/SoCalCoastal-FloodHazard-v1
- Install dependencies:
npm install
- Run tests:
npx vitest

### To preview the app, serve the public folder locally:
npx serve public

<img width="1908" alt="image" src="https://github.com/user-attachments/assets/d5cdfe2c-877d-4cc3-8c9d-c7d0bfe3d0d0" />
