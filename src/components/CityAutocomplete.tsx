// src/components/CityAutocomplete.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';
import { locationService } from '../utils/LocationResult';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  required = false,
  placeholder = "Digite sua cidade...",
  className = "",
  label = "Localização"
}: CityAutocompleteProps) {
  const [cityQuery, setCityQuery] = useState(value);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);

  // Atualizar cityQuery quando value mudar externamente
  useEffect(() => {
    setCityQuery(value);
  }, [value]);

  // Buscar cidades quando o usuário digita
  useEffect(() => {
    const searchCities = async () => {
      if (cityQuery.length < 2) {
        setCitySuggestions([]);
        return;
      }

      setIsSearchingCity(true);
      try {
        const results = await locationService.searchCities(cityQuery);
        setCitySuggestions(results);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        setCitySuggestions([]);
      } finally {
        setIsSearchingCity(false);
      }
    };

    const timeoutId = setTimeout(searchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [cityQuery]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCityQuery(inputValue);
    
    // Se o input estiver vazio, limpa o valor
    // Senão, mantém o último valor válido até selecionar outro
    if (!inputValue) {
      onChange('');
    }
    
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    // Se já tem um valor e menos de 2 caracteres foram digitados, busca pelo valor atual
    if (cityQuery.length >= 2) {
      // Força uma nova busca
      setCitySuggestions([]);
    }
  };

  const selectCity = (city: any) => {
    onChange(city.fullName);
    setCityQuery(city.fullName);
    setShowSuggestions(false);
    setCitySuggestions([]);
  };

  const clearCity = () => {
    onChange('');
    setCityQuery('');
    setCitySuggestions([]);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative" ref={cityInputRef}>
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <input
          type="text"
          value={cityQuery}
          onChange={handleCityInputChange}
          onFocus={handleFocus}
          required={required}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder={placeholder}
          autoComplete="off"
        />
        {cityQuery && (
          <button
            type="button"
            onClick={clearCity}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Dropdown de sugestões */}
        {showSuggestions && cityQuery.length >= 2 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {isSearchingCity ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Buscando cidades...
              </div>
            ) : citySuggestions.length > 0 ? (
              citySuggestions.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectCity(city)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {city.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {city.state}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Nenhuma cidade encontrada
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}