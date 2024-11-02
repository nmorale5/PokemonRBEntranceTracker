import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import L from 'leaflet';

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
