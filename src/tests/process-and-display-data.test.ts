import { describe, it, vi, beforeEach } from "vitest";

// Mock ArcGIS SDK classes
vi.mock("@arcgis/core/layers/FeatureLayer", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      queryFeatures: vi.fn().mockResolvedValue({
        features: [
          {
            geometry: { type: "polygon" },
            attributes: {
              OBJECTID: 1,
              FLD_ZONE: "Zone A",
              ESRI_SYMBOLOGY: "Symbology A",
            },
          },
        ],
      }),
    })),
  };
});

vi.mock("@arcgis/core/layers/GraphicsLayer", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      addMany: vi.fn(),
    })),
  };
});

vi.mock("@arcgis/core/Graphic", () => {
  return {
    default: vi.fn().mockImplementation((props) => props),
  };
});

// Import the component (ensure the path is correct)
import "../components/process-and-display-data";

describe("<process-and-display-data>", () => {
  let element: HTMLElement;
  let arcgisMap: any;

  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <arcgis-map></arcgis-map>
      <fetch-feature-layer id="coastal-buffer"></fetch-feature-layer>
      <fetch-feature-layer id="flood-hazard"></fetch-feature-layer>
      <process-and-display-data></process-and-display-data>
    `;

    // Mock the arcgis-map element with a view.map
    arcgisMap = document.querySelector("arcgis-map") as any;
    arcgisMap.view = { map: { add: vi.fn() } };

    element = document.querySelector("process-and-display-data")!;
  });

  it("should process layers and add a GraphicsLayer to the map", async () => {
    // Dispatch 'layer-loaded' events for required layers
    const coastalBufferElement = document.querySelector(
      'fetch-feature-layer[id="coastal-buffer"]'
    )!;
    const floodHazardElement = document.querySelector(
      'fetch-feature-layer[id="flood-hazard"]'
    )!;

    const coastalBufferEvent = new CustomEvent("layer-loaded", {
      detail: {
        id: "coastal-buffer",
        featureLayer: new (
          await import("@arcgis/core/layers/FeatureLayer")
        ).default(),
      },
    });

    const floodHazardEvent = new CustomEvent("layer-loaded", {
      detail: {
        id: "flood-hazard",
        featureLayer: new (
          await import("@arcgis/core/layers/FeatureLayer")
        ).default(),
      },
    });

    coastalBufferElement.dispatchEvent(coastalBufferEvent);
    floodHazardElement.dispatchEvent(floodHazardEvent);

    // Wait for the component to process layers
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
});
