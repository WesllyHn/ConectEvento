// src/utils/locationService.ts

export interface LocationResult {
  name: string;
  type: 'city' | 'neighborhood' | 'address';
  fullName: string;
  state?: string;
  city?: string;
}

export const locationService = {
  // Busca cidades brasileiras via IBGE
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

  // Busca localizações via Nominatim (OpenStreetMap)
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
        .map((item: any) => {
          const address = item.address || {};
          let type: 'city' | 'neighborhood' | 'address' = 'address';
          let name = '';
          let fullName = '';
          if (address.road || address.street) {
            type = 'address';
            const road = address.road || address.street;
            const suburb = address.suburb || address.neighbourhood || '';
            const city = address.city || address.town || address.village || address.municipality || '';
            const state = address.state || '';
            name = road;
            const parts = [road];
            if (suburb) parts.push(suburb);
            if (city) parts.push(city);
            if (state) parts.push(state);
            fullName = parts.join(', ');
          } else if (address.suburb || address.neighbourhood) {
            type = 'neighborhood';
            name = address.suburb || address.neighbourhood;
            const city = address.city || address.town || address.village || address.municipality || '';
            const state = address.state || '';
            const parts = [name];
            if (city) parts.push(city);
            if (state) parts.push(state);
            fullName = parts.join(', ');
          } else if (
            address.city ||
            address.town ||
            address.village ||
            address.municipality
          ) {
            type = 'city';
            name = address.city || address.town || address.village || address.municipality;
            const state = address.state || '';
            fullName = state ? `${name}, ${state}` : name;
          } else {
            name = item.display_name.split(',')[0];
            fullName = item.display_name;
          }
          return {
            name,
            type,
            fullName,
            state: address.state,
            city: type !== 'city' ? address.city || address.town || address.village || address.municipality : undefined,
          };
        })
        .filter((item: { name: string; fullName: string; }) => item.name && item.fullName);
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      return [];
    }
  },

  // Busca combinada: Nominatim antes, fallback IBGE depois
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
