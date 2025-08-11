// GoogleAddressAutocomplete.js
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const GoogleAddressAutocomplete = ({
  onPlaceSelected,
  register = {},
  error,
  className = '',
  placeholder = 'Rechercher une adresse...',
  inputRef: externalRef,
}) => {
  const [value, setValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Débouncer pour limiter les appels API
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    try {
      const response = await fetch('https://places.googleapis.com/v1/places :autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': [
            'suggestions.placePrediction.textualMatch',
            'suggestions.placePrediction.primaryText',
            'suggestions.placePrediction.secondaryText',
            'suggestions.placePrediction.placeId',
          ].join(','),
        },
        body: JSON.stringify({
          input,
          includedPrimaryTypes: ['address'],
          regionCode: 'TN', // Tunisie
          locationRestriction: {
            rectangle: {
              low: { latitude: 30.0, longitude: 7.0 },   // Coin sud-ouest approximatif de la Tunisie
              high: { latitude: 37.5, longitude: 11.8 },  // Coin nord-est
            },
          },
        }),
      });

      if (!response.ok) {
        console.error('Erreur API:', await response.text());
        setPredictions([]);
        return;
      }

      const data = await response.json();
      setPredictions(data.suggestions || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Erreur réseau ou requête:', err);
      setPredictions([]);
    }
  };

  const debouncedFetch = useRef(
    debounce((input) => {
      fetchPredictions(input);
    }, 300)
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setValue(val);
    if (register?.onChange) register.onChange(e);
    debouncedFetch.current(val);
  };

  const selectPlace = async (placeId) => {
    try {
      const fieldMask = [
        'displayName',
        'formattedAddress',
        'addressComponents',
        'geometry.location',
      ].join(',');

      const detailsResponse = await fetch(
        `https://places.googleapis.com/v1/places/ ${placeId}?fields=${fieldMask}`,
        {
          headers: {
            'X-Goog-Api-Key': API_KEY,
          },
        }
      );

      if (!detailsResponse.ok) {
        console.error('Erreur détails:', await detailsResponse.text());
        return;
      }

      const place = await detailsResponse.json();

      // Format similaire à google.maps.places.PlaceResult
      onPlaceSelected({
        place_id: place.name.split('/').pop(),
        formatted_address: place.formattedAddress,
        geometry: {
          location: {
            lat: () => place.geometry?.location?.latitude || 0,
            lng: () => place.geometry?.location?.longitude || 0,
          },
        },
        address_components: place.addressComponents?.map((comp) => ({
          long_name: comp.longText?.text || '',
          short_name: comp.shortText?.text || '',
          types: comp.types || [],
        })),
      });

      setValue(place.displayName?.text || place.formattedAddress);
      setShowDropdown(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={externalRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && predictions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        aria-invalid={!!error}
      />

      {/* Dropdown des suggestions */}
      {showDropdown && predictions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto mt-1">
          {predictions.map((pred, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col text-sm"
              onClick={() => selectPlace(pred.placePrediction.placeId)}
            >
              <span className="font-medium">{pred.placePrediction.primaryText?.text}</span>
              <span className="text-gray-500">{pred.placePrediction.secondaryText?.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Fonction utilitaire : debounce
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

GoogleAddressAutocomplete.propTypes = {
  onPlaceSelected: PropTypes.func.isRequired,
  register: PropTypes.object,
  error: PropTypes.object,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

export default GoogleAddressAutocomplete;