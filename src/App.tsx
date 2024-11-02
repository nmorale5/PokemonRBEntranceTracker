import React, {useEffect} from 'react';
import './App.css';
import L from 'leaflet';
import {readJsonFile} from "./util";

function App() {
  useEffect(() => {
    const map = L.map('map').setView([.3600, .3600]);

    const imageUrl = '/PokemonRedMapNoArrows.png';
    const altText = 'Pokemon Red/Blue Map';
    const latLngBounds = L.latLngBounds([[0, 0], [.7200, .7200]]);

    const imageOverlay = L.imageOverlay(imageUrl, latLngBounds, {
      alt: altText,
      interactive: true
    }).addTo(map);

    map.fitBounds(latLngBounds);

    interface Entrance {
      x: number,
      y: number,
      region: string,
    }

    async function renderWarps() {
      const warps = await readJsonFile("/PokemonData/warps.json") as { from: Entrance, to: Entrance }[];
      for (const warp of warps) {
        L.marker([.7200 - warp.from.y / 10000, warp.from.x / 10000], {
          title: `${warp.from.region} to ${warp.to.region}`
        }).addTo(map);
        L.marker([ .7200 - warp.to.y / 10000, warp.to.x / 10000], {
          title: `${warp.to.region} to ${warp.from.region}`
        }).addTo(map);
      }
    }

    void renderWarps();

    return () => {
      map.remove();
    }
  }, [])

  return (
    <div className="App">
      <div id="map"></div>
    </div>
  );
}

export default App;
