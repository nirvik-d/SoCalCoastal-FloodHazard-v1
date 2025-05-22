import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Map from "@arcgis/core/Map";

class FetchFeatureLayer extends HTMLElement {
  map!: Map;
  featureLayer?: FeatureLayer;

  static get observedAttributes() {
    return ["id", "layer", "expression"];
  }

  connectedCallback() {
    const isMapReady = () => {
      const arcgisMap = document.querySelector("arcgis-map") as any;
      if (!arcgisMap) {
        requestAnimationFrame(isMapReady);
        return;
      }

      const view = arcgisMap.view;
      if (view?.map) {
        this.map = view.map;
        this.loadLayer();
      } else {
        requestAnimationFrame(isMapReady);
      }
    };

    isMapReady();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.loadLayer();
  }

  private async loadLayer() {
    if (!this.map) return null;

    console.log("Loading feature layer.");
    const url = this.getAttribute("layer")!;
    const definitionExpression = this.getAttribute("expression")!;

    if (url === "") return null;

    this.featureLayer = new FeatureLayer({
      url,
      outFields: ["*"],
      definitionExpression,
    });

    console.log("Waiting for the feature layer to finish loading.");
    await this.featureLayer.load();

    this.dispatchEvent(
      new CustomEvent("layer-loaded", {
        detail: {
          id: this.getAttribute("id"),
          featureLayer: this.featureLayer,
        },
        bubbles: true,
        composed: true,
      })
    );

    console.log("Feature layer loaded.");
  }
}

customElements.define("fetch-feature-layer", FetchFeatureLayer);
