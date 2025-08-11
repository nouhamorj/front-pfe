import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "i18n/config";

import "simplebar-react/dist/simplebar.min.css";

import "styles/index.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Supprimer l'URL par défaut pour forcer le remplacement
delete L.Icon.Default.prototype._getIconUrl;

// Appliquer les bonnes URLs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
