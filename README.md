# SoCal Coastal Flood Hazard Explorer (v1)

A web application visualizing flood hazard zones for Southern California coastal cities using ArcGIS Maps SDK for JavaScript and Web Components.

## Features

- **Flood Hazard Visualization**: Interactive visualization of flood hazard zones
- **Web Components**: Custom Web component to turn the flood zone layer on and off
- **Modern UI**: Clean and responsive user interface
- **Test-Driven Development**: Comprehensive unit test coverage

## Screenshots

<img width="959" alt="image" src="https://github.com/user-attachments/assets/a38a9f35-f8fe-4b1c-aa67-19223edb43b9" />

*Interactive flood hazard visualization*

## Prerequisites

- Node.js
- Vite
- ArcGIS Maps SDK for JavaScript

## Project Structure

- `fetch-feature-layer.ts`: Loads and manages ArcGIS FeatureLayers
- `process-and-display-data.ts`: Handles spatial analysis and visualization
- `public/index.html`: Main application entry point
- `tests/`: Unit tests for custom elements

## Code Implementation

### Fetch Feature Layer (fetch-feature-layer.ts)

```typescript
// Custom web component for fetching ArcGIS FeatureLayers
class FetchFeatureLayer extends HTMLElement {
  private layer: FeatureLayer | null = null;
  private layerLoadedCallback: ((layer: FeatureLayer) => void) | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadLayer();
  }

  private async loadLayer() {
    try {
      const layer = new FeatureLayer({
        url: this.getAttribute('layer-url') || '',
        outFields: ['*']
      });

      this.layer = layer;
      this.dispatchEvent(new CustomEvent('layer-loaded', { 
        detail: { layer },
        bubbles: true 
      }));

    } catch (error) {
      console.error('Error loading layer:', error);
      this.dispatchEvent(new CustomEvent('layer-error', { 
        detail: { error },
        bubbles: true 
      }));
    }
  }
}

// Register the custom element
customElements.define('fetch-feature-layer', FetchFeatureLayer);
```

### Process and Display Data (process-and-display-data.ts)

```typescript
// Custom web component for processing and displaying flood hazard data
class ProcessFloodData extends HTMLElement {
  private mapView: MapView | null = null;
  private graphicsLayer: GraphicsLayer | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Listen for layer-loaded events
    this.addEventListener('layer-loaded', this.handleLayerLoaded.bind(this));
  }

  private async handleLayerLoaded(event: CustomEvent) {
    const layer = event.detail.layer as FeatureLayer;
    
    // Create graphics layer if not exists
    if (!this.graphicsLayer) {
      this.graphicsLayer = new GraphicsLayer();
      this.mapView?.map.add(this.graphicsLayer);
    }

    // Query spatial intersection
    const query = layer.createQuery();
    query.geometry = this.mapView?.viewpoint.targetGeometry;
    query.spatialRelationship = 'intersects';

    const results = await layer.queryFeatures(query);
    
    // Process and display results
    results.features.forEach(feature => {
      const graphic = new Graphic({
        geometry: feature.geometry,
        symbol: {
          type: 'simple-fill',
          color: [255, 0, 0, 0.3],
          outline: {
            color: [255, 0, 0],
            width: 2
          }
        }
      });
      
      this.graphicsLayer?.add(graphic);
    });
  }
}

// Register the custom element
customElements.define('process-flood-data', ProcessFloodData);
```

### Main HTML Structure (public/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <title>SoCal Coastal Flood Hazard Explorer</title>

  <!-- ArcGIS CSS -->
  <link rel="stylesheet" href="https://js.arcgis.com/4.32/esri/themes/light/main.css" />
  
  <!-- Custom styles -->
  <style>
    html, body {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
    }
    #viewDiv {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <!-- Main map container -->
  <div id="viewDiv"></div>

  <!-- Custom web components -->
  <fetch-feature-layer layer-url="your-flood-hazard-layer-url"></fetch-feature-layer>
  <process-flood-data></process-flood-data>

  <!-- ArcGIS JavaScript -->
  <script src="https://js.arcgis.com/4.32/"></script>
  
  <!-- Custom components -->
  <script type="module" src="./fetch-feature-layer.ts"></script>
  <script type="module" src="./process-and-display-data.ts"></script>
</body>
</html>
```

## Running the Application

1. **Development Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Run tests
   npx vitest
   ```

2. **Preview the Application**
   ```bash
   # Serve the public folder
   npx serve public
   ```

## Usage

1. **View Flood Hazards**
   - Open the application to see the flood hazard visualization
   - The map displays flood hazard zones for Southern California coastal areas
   - Interactive zones show detailed information on hover

2. **Spatial Analysis**
   - The application performs real-time spatial intersection queries
   - Flood zones are dynamically loaded and processed
   - Results are immediately displayed on the map

3. **Use Web Components**
   - The application uses custom web components for modularity
   - Components encapsulate GIS-specific logic
   - Components can be reused in other applications

4. **Testing**
   - Comprehensive unit tests ensure reliability
   - Tests cover all custom elements
   - Test coverage is maintained for future development
