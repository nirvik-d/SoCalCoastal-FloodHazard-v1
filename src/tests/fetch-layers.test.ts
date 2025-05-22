import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ArcGIS JS SDK modules
vi.mock("@arcgis/core/layers/FeatureLayer", () => {
  return {
    default: vi.fn().mockImplementation(({ url, definitionExpression }) => {
      return {
        url,
        definitionExpression,
        outFields: ["*"],
        load: vi.fn().mockResolvedValue(true),
      };
    }),
  };
});

import "../components/fetch-layers"; // Adjust path if needed
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

describe("<fetch-feature-layer>", () => {
  let el: HTMLElement;

  beforeEach(() => {
    // Setup a fake arcgis-map + view + map
    (document.body.innerHTML as any) = `
      <arcgis-map></arcgis-map>
      <fetch-feature-layer id="test" layer="https://fake-url.com/layer" expression="1=1"></fetch-feature-layer>
    `;
    (document.querySelector("arcgis-map") as any).view = { map: {} };

    el = document.querySelector("fetch-feature-layer")!;
  });

  it("should eventually call FeatureLayer with correct props", async () => {
    const flMock = FeatureLayer as unknown;
    await new Promise((r) => setTimeout(r, 20)); // Wait for isMapReady + loadLayer

    expect(flMock).toHaveBeenCalledWith({
      url: "https://fake-url.com/layer",
      outFields: ["*"],
      definitionExpression: "1=1",
    });
  });

  it("should dispatch 'layer-loaded' event after layer is loaded", async () => {
    const listener = vi.fn();
    el.addEventListener("layer-loaded", listener);

    await new Promise((r) => setTimeout(r, 20));

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.detail.id).toBe("test");
    expect(event.detail.featureLayer.url).toBe("https://fake-url.com/layer");
  });
});
