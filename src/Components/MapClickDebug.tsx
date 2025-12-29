import { useMapEvent } from "react-leaflet";
import { pixelCoordinatesFromLatLng } from "../util";

const MapClickDebug = () => {
  useMapEvent("click", async e => {
    const [x, y] = pixelCoordinatesFromLatLng(e.latlng).map(num => Math.round((num + 8) / 16) * 16 - 8);
    await navigator.clipboard.writeText(`,\n      "coordinates": {\n        "x": ${x},\n        "y": ${y}\n      }`);
  });

  return null; // This component doesn't render anything visible
};

export default MapClickDebug;
