import L from "leaflet";

export async function readJsonFile(filename: string): Promise<any> {
  const response = await fetch(filename);
  return response.json();
}

export function latLngFromPixelCoordinates(x: number, y: number): L.LatLng {
  return L.latLng(0.72 - y / 10000, x / 10000);
}

export function pixelCoordinatesFromLatLng(latlng: L.LatLng): [number, number] {
  // @ts-ignore
  return [latlng.lng * 10000, 7200 - latlng.lat * 10000].map(Math.round);
}

export function setToArray<T>(set: Set<T>): Array<T> {
  const arr = new Array<T>();
  set.forEach(item => arr.push(item));
  return arr;
}
