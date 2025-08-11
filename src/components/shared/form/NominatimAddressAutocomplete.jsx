// src/components/shared/form/NominatimAddressAutocomplete.js
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const NominatimAddressAutocomplete = ({
  onPlaceSelected,
  register = {},
  error,
  className = '',
  placeholder = 'Rechercher une adresse...',
  inputRef: externalRef,
  minCharacters = 3,
}) => {
  const [value, setValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Annuler la requête précédente
  const cancelPreviousRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Recherche optimisée
  const fetchPredictions = useCallback(async (input) => {
    if (!input.trim() || input.length < minCharacters) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    cancelPreviousRequest();
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      // 🔁 Normalisation pour améliorer la recherche
      let searchQuery = input.trim();
      if (searchQuery.toLowerCase().includes('hammam sousse')) {
        searchQuery = searchQuery.replace(/hammam sousse/i, 'Sousse, Tunisie');
      }

      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        addressdetails: 1,
        countrycodes: 'TN', // Tunisie
        limit: 10,
        polygon: 1,
        'accept-language': 'fr,ar,en',
      });

      const response = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ShippingLog/1.0 (contact@shippinglog.tn)',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // Filtrer par importance et type
      const filteredData = data
        .filter(item => item.importance > 0.1)
        .sort((a, b) => b.importance - a.importance);

      setPredictions(filteredData);
      if (filteredData.length > 0) {
        setShowDropdown(true);
        setSelectedIndex(-1);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erreur Nominatim:', err);
        setPredictions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [minCharacters]);

  const debouncedFetch = useMemo(
    () => debounce((input) => fetchPredictions(input), 300),
    [fetchPredictions]
  );

  // Nettoyage
  useEffect(() => {
    return () => {
      cancelPreviousRequest();
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setValue(val);
    if (register?.onChange) register.onChange(e);
    if (val.length < minCharacters) {
      setPredictions([]);
      setShowDropdown(false);
      setLoading(false);
    } else {
      debouncedFetch(val);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || predictions.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < predictions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : predictions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectPlace(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectPlace = (place) => {
    const addressComponents = [];
    const addr = place.address || {};

    // Mapping des composants
    if (addr.city || addr.town || addr.village) {
      addressComponents.push({
        long_name: addr.city || addr.town || addr.village,
        short_name: addr.city || addr.town || addr.village,
        types: ['locality'],
      });
    }
    if (addr.state) {
      addressComponents.push({
        long_name: addr.state,
        short_name: addr.state,
        types: ['administrative_area_level_1'],
      });
    }
    if (addr.suburb || addr.hamlet || addr.neighbourhood) {
      addressComponents.push({
        long_name: addr.suburb || addr.hamlet || addr.neighbourhood,
        short_name: addr.suburb || addr.hamlet || addr.neighbourhood,
        types: ['sublocality'],
      });
    }
    if (addr.postcode) {
      addressComponents.push({
        long_name: addr.postcode,
        short_name: addr.postcode,
        types: ['postal_code'],
      });
    }

    onPlaceSelected({
      place_id: place.place_id || `nominatim_${place.osm_id}`,
      formatted_address: place.display_name,
      geometry: {
        location: {
          lat: () => parseFloat(place.lat),
          lng: () => parseFloat(place.lon),
        },
      },
      address_components: addressComponents,
    });

    setValue(place.display_name);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const formatDisplayName = (displayName) => {
    const parts = displayName.split(', ');
    const mainPart = parts.slice(0, 2).join(', ');
    const secondaryPart = parts.slice(2).join(', ');
    return { mainPart, secondaryPart };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={externalRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value && predictions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        aria-invalid={!!error}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        role="combobox"
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {showDropdown && predictions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto mt-1" role="listbox">
          {predictions.map((pred, i) => {
            const { mainPart, secondaryPart } = formatDisplayName(pred.display_name);
            return (
              <li
                key={`${pred.osm_type}_${pred.osm_id}`}
                className={`px-4 py-3 cursor-pointer text-sm transition-colors ${
                  i === selectedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                }`}
                onClick={() => selectPlace(pred)}
                role="option"
                aria-selected={i === selectedIndex}
              >
                <div className="font-medium text-gray-900 mb-1">{mainPart}</div>
                {secondaryPart && <div className="text-gray-500 text-xs">{secondaryPart}</div>}
                <div className="text-gray-400 text-xs mt-1">
                  {pred.type && `${pred.type} • `} {pred.address?.country || 'Tunisie'}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {showDropdown && !loading && predictions.length === 0 && value.length >= minCharacters && (
        <div className="absolute z-50 w-full bg-white border rounded shadow-lg mt-1 p-4 text-center text-sm text-gray-500">
          Aucune adresse trouvée pour &quot;{value}&quot;
        </div>
      )}
    </div>
  );
};

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

NominatimAddressAutocomplete.propTypes = {
  onPlaceSelected: PropTypes.func.isRequired,
  register: PropTypes.object,
  error: PropTypes.object,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  minCharacters: PropTypes.number,
};

export default NominatimAddressAutocomplete;