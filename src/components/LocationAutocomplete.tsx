import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Building2, Home } from 'lucide-react';
import { Input, Spin, Tooltip } from 'antd';
import { LocationResult, locationService } from '../utils/LocationResult';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocationAutocomplete({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await locationService.searchAll(value);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocationIcon = (type: string) => {
    if (type === 'city') return <Building2 className="w-4 h-4 text-blue-500" />;
    if (type === 'neighborhood') return <Home className="w-4 h-4 text-purple-500" />;
    return <MapPin className="w-4 h-4 text-green-500" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'city') return 'Cidade';
    if (type === 'neighborhood') return 'Bairro';
    return 'Endereço';
  };

  const handleSelectSuggestion = (location: LocationResult) => {
    onChange(location.fullName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
  };

  const renderSuggestionsContent = () => {
    if (loading) {
      return (
        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Spin size="small" /> Buscando localizações...
        </div>
      );
    }

    if (suggestions.length > 0) {
      return (
        <>
          {suggestions.map((location) => (
            <button
              key={location.fullName}
              type="button"
              onClick={() => handleSelectSuggestion(location)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="mt-0.5">
                {getLocationIcon(location.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {location.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {location.fullName}
                </div>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  {getTypeLabel(location.type)}
                </div>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
            💡 Não encontrou? Digite o endereço completo manualmente
          </div>
        </>
      );
    }

    return (
      <div className="px-4 py-3 text-sm text-gray-500">
        <div className="mb-2">Nenhuma sugestão encontrada</div>
        <div className="text-xs text-gray-400">
          Você pode digitar o endereço completo manualmente
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={inputRef}>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
      <Tooltip title={placeholder || "Ex: Rua das Flores, 123 ou São Paulo, SP"} placement="top">
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          size="large"
          className="pl-10"
          placeholder={placeholder || "Ex: Rua das Flores, 123 ou São Paulo, SP"}
          autoComplete="off"
        />
      </Tooltip>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {showSuggestions && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {renderSuggestionsContent()}
        </div>
      )}
    </div>
  );
}
