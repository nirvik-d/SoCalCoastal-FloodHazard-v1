import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import EsriMap from "@arcgis/core/Map";

export class ProcessAndDisplayData extends HTMLElement {
  map!: EsriMap;
  filteredCityFeatures!: Graphic[];
  coastalCitiesGraphicsLayer!: GraphicsLayer;

  connectedCallback() {
    const isMapReady = async () => {
      const arcgisMap = document.querySelector("arcgis-map") as any;
      if (!arcgisMap) {
        requestAnimationFrame(isMapReady);
        return;
      }

      const view = arcgisMap.view;
      if (view?.map) {
        this.map = view.map;
        await this.processLayers();
        this.displayData();
        this.map.add(this.coastalCitiesGraphicsLayer);
      } else {
        requestAnimationFrame(isMapReady);
      }
    };

    isMapReady();
  }

  private async processLayers() {
    const layerIds = ["coastal-buffer", "flood-hazard"];
    const layerPromises: Promise<{ id: string; layer: FeatureLayer }>[] = [];

    const loadedLayers = document.querySelectorAll("fetch-feature-layer");

    layerIds.forEach((id) => {
      const layerPromise = new Promise<{ id: string; layer: FeatureLayer }>(
        (resolve) => {
          loadedLayers.forEach((element: any) => {
            element.addEventListener("layer-loaded", (event: Event) => {
              const customEvent = event as CustomEvent<{
                id: string;
                featureLayer: FeatureLayer;
              }>;

              if (customEvent.detail.id === id) {
                resolve({ id, layer: customEvent.detail.featureLayer });
              }
            }),
              { once: true };
          });
        }
      );

      layerPromises.push(layerPromise);
    });

    const layers = await Promise.all(layerPromises);

    const layerMap = new Map<string, FeatureLayer>();
    layers.forEach(({ id, layer }) => layerMap.set(id, layer));

    const [coastalBufferResult] = await Promise.all([
      layerMap.get("coastal-buffer")!.queryFeatures(),
    ]);

    const results = await this.batchQueryFeatures(
      coastalBufferResult.features,
      layerMap.get("flood-hazard")!
    );

    const allCityFeatures = results.flatMap((r) => r.features);

    const alreadyExists = new Set<any>();
    this.filteredCityFeatures = allCityFeatures.filter((feature: any) => {
      const objectID = feature.attributes.OBJECTID;

      if (alreadyExists.has(objectID)) {
        return false;
      } else {
        alreadyExists.add(objectID);
        return true;
      }
    });
  }

  private async batchQueryFeatures(
    features: Graphic[],
    layer: FeatureLayer,
    batchSize = 10
  ) {
    const results: any[] = [];

    for (let i = 0; i < features.length; i += batchSize) {
      const batch = features.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map((feature) =>
          layer.queryFeatures({
            geometry: feature.geometry,
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
          })
        )
      );

      results.push(...batchResults);
    }

    return results;
  }

  private displayData() {
    const coastalCitiesGraphics = this.filteredCityFeatures.map(
      (feature: any) => {
        return new Graphic({
          geometry: feature.geometry,
          attributes: feature.attributes,
          symbol: {
            type: "simple-fill",
            color: [0, 120, 255, 0.5],
            outline: {
              color: [0, 0, 0, 0.6],
              width: 1,
            },
          },
          popupTemplate: {
            title: "{FLD_ZONE}",
            content: `
              <b>Esri Symbology: </b>{ESRI_SYMBOLOGY}<br/>
            `,
          },
        });
      }
    );

    this.coastalCitiesGraphicsLayer = new GraphicsLayer({
      id: "coastal-flood-zones",
    });
    this.coastalCitiesGraphicsLayer.addMany(coastalCitiesGraphics);
  }
}

customElements.define("process-and-display-data", ProcessAndDisplayData);
