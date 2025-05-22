import "../components/toggle-layer";
import { describe, expect, it } from "vitest";

describe("<toggle-layer>", () => {
  it("should render a disabled button initially", () => {
    document.body.innerHTML = `<toggle-layer></toggle-layer>`;
    const btn = document.querySelector("button")!;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toMatch(/loading/i);
  });

  it("should update button when map and layer are available", () => {
    document.body.innerHTML = `<toggle-layer></toggle-layer>`;
    const toggle = document.querySelector("toggle-layer") as any;

    // Mock map + layer
    toggle.map = {
      findLayerById: () => ({ visible: true }),
    };

    toggle.enableButton();

    const btn = document.querySelector("button")!;
    expect(btn.disabled).toBe(false);
    expect(btn.textContent?.toLowerCase()).toContain("hide");
  });
});
