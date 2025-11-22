export interface LocationResult {
  name: string;
  type: 'city' | 'neighborhood' | 'address';
  fullName: string;
  state?: string;
  city?: string;
}

const getCityName = (address: any): string => {
  return address.city || address.town || address.village || address.municipality || '';
};

const processAddressType = (address: any): LocationResult => {
  const road = address.road || address.street;
  const suburb = address.suburb || address.neighbourhood || '';
  const city = getCityName(address);
  const state = address.state || '';
  const parts = [road];
  if (suburb) parts.push(suburb);
  if (city) parts.push(city);
  if (state) parts.push(state);
  return {
    name: road,
    type: 'address',
    fullName: parts.join(', '),
    state: address.state,
    city: city || undefined,
  };
};

const processNeighborhoodType = (address: any): LocationResult => {
  const name = address.suburb || address.neighbourhood;
  const city = getCityName(address);
  const state = address.state || '';
  const parts = [name];
  if (city) parts.push(city);
  if (state) parts.push(state);
  return {
    name,
    type: 'neighborhood',
    fullName: parts.join(', '),
    state: address.state,
    city: city || undefined,
  };
};

const processCityType = (address: any): LocationResult => {
  const name = getCityName(address);
  const state = address.state || '';
  return {
    name,
    type: 'city',
    fullName: state ? `${name}, ${state}` : name,
    state: address.state,
    city: undefined,
  };
};

const processLocationItem = (item: any): LocationResult => {
  const address = item.address || {};
  
  if (address.road || address.street) {
    return processAddressType(address);
  }
  
  if (address.suburb || address.neighbourhood) {
    return processNeighborhoodType(address);
  }
  
  if (address.city || address.town || address.village || address.municipality) {
    return processCityType(address);
  }
  
  return {
    name: item.display_name.split(',')[0],
    type: 'address',
    fullName: item.display_name,
    state: address.state,
    city: getCityName(address) || undefined,
  };
};

export const locationService = {
  async searchCities(query: string): Promise<LocationResult[]> {
    if (!query || query.length < 3) return [];
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`
      );
      const data = await res.json();
      return data
        .filter((city: any) =>
          city.nome.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map((city: any) => ({
          name: city.nome,
          type: 'city' as const,
          state: city.microrregiao.mesorregiao.UF.sigla,
          fullName: `${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`,
        }));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return [];
    }
  },

  async searchLocations(query: string): Promise<LocationResult[]> {
    if (!query || query.length < 3) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query + ', Brasil')}&` +
        `format=json&addressdetails=1&limit=10`,
        {
          headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
        }
      );
      const data = await res.json();
      return data
        .map((item: any) => processLocationItem(item))
        .filter((item: { name: string; fullName: string; }) => item.name && item.fullName);
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      return [];
    }
  },

  async searchAll(query: string): Promise<LocationResult[]> {
    if (!query || query.length < 3) return [];
    try {
      const nominatimResults = await locationService.searchLocations(query);
      if (nominatimResults.length > 0) return nominatimResults.slice(0, 8);
      const ibgeResults = await locationService.searchCities(query);
      return ibgeResults;
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      try {
        return await locationService.searchCities(query);
      } catch (fallbackError) {
        console.error('Erro no fallback IBGE:', fallbackError);
        return [];
      }
    }
  },
};
