import Map from "@arcgis/core/Map";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

class ToggleCoastalLayer extends HTMLElement {
  private button!: HTMLButtonElement;
  private map!: Map;
  private readonly layerId = "coastal-flood-zones";

  connectedCallback() {
    this.style.display = "inline-block";
    this.render();
    this.isMapReady();
  }

  private render() {
    this.innerHTML = `
        <style>
          button {
            all: unset;
            background-color: #007ac2;
            color: white;
            padding: 0.5em 1em;
            border-radius: 4px;
            font-family: var(--calcite-font-family, Avenir Next, sans-serif);
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #005e95;
          }
          button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        </style>
        <button id="toggle-btn" disabled>Loading...</button>
      `;
    this.button = this.querySelector("#toggle-btn")!;
    this.button.addEventListener("click", () => this.toggleLayer());
  }

  private isMapReady() {
    const isLayerReady = () => {
      const arcgisMap = document.querySelector("arcgis-map") as any;
      if (arcgisMap?.view?.map) {
        this.map = arcgisMap.view.map;
        const layer = this.map.findLayerById(this.layerId) as GraphicsLayer;

        if (layer) {
          // Wait until the layer has finished loading
          if (layer) {
            this.enableButton();
          }
        } else {
          // Retry until the layer is added to the map
          requestAnimationFrame(isLayerReady);
        }
      } else {
        requestAnimationFrame(isLayerReady);
      }
    };
    isLayerReady();
  }

  private enableButton() {
    const layer = this.map.findLayerById(this.layerId);
    if (layer) {
      this.button.disabled = false;
      this.button.textContent = layer.visible
        ? "Hide Coastal Flood Zones"
        : "Show Coastal Flood Zones";
    } else {
      this.button.textContent = "Layer Not Found";
    }
  }

  private toggleLayer() {
    const layer = this.map.findLayerById(this.layerId) as GraphicsLayer;
    if (!layer) return;

    layer.visible = !layer.visible;
    this.button.textContent = layer.visible
      ? "Hide Coastal Flood Zones"
      : "Show Coastal Flood Zones";

    this.dispatchEvent(
      new CustomEvent("layer-toggle", {
        detail: { id: this.layerId, visible: layer.visible },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("toggle-layer", ToggleCoastalLayer);
