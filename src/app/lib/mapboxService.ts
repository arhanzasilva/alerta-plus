/**
 * Mapbox Service
 *
 * Módulo central de acesso às APIs REST do Mapbox.
 * Fornece métodos para geocoding, reverse geocoding e routing.
 */

import { MAPBOX_TOKEN } from "../../config/mapbox";

// ═══════════════════════════════════════
// ═══ TIPOS ═══
// ═══════════════════════════════════════

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  geometry: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxGeocodingResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  address: string;
  lng: number;
  lat: number;
  relevance?: number;
}

export interface RouteOptions {
  origin: [number, number]; // [lng, lat]
  destination: [number, number]; // [lng, lat]
  profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
  alternatives?: boolean;
  steps?: boolean;
  geometries?: 'geojson' | 'polyline' | 'polyline6';
  language?: 'pt' | 'en' | 'es';
}

export interface RouteResponse {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    type: 'LineString';
    coordinates: Array<[number, number]>; // [[lng, lat], ...]
  };
  steps?: Array<{
    distance: number;
    duration: number;
    instruction: string;
  }>;
  alternatives?: Array<{
    distance: number;
    duration: number;
    geometry: {
      type: 'LineString';
      coordinates: Array<[number, number]>;
    };
    steps?: Array<{
      distance: number;
      duration: number;
      instruction: string;
    }>;
  }>;
}

// ═══════════════════════════════════════
// ═══ CLASSE MAPBOX SERVICE ═══
// ═══════════════════════════════════════

class MapboxService {
  private readonly baseUrl = 'https://api.mapbox.com';
  private readonly token: string;

  constructor() {
    this.token = MAPBOX_TOKEN;

    if (!this.token || this.token.includes('your_mapbox_token_here')) {
      console.warn(
        '⚠️ Mapbox token não configurado. Configure VITE_MAPBOX_TOKEN no arquivo .env'
      );
    }
  }

  // ═══════════════════════════════════════
  // ═══ GEOCODING (busca de endereços) ═══
  // ═══════════════════════════════════════

  /**
   * Busca sugestões de endereços com base em uma query.
   *
   * @param query - Texto de busca (ex: "Teatro Amazonas", "Av Constantino Nery")
   * @param proximity - Coordenadas [lng, lat] para priorizar resultados próximos
   * @param options - Opções adicionais
   * @returns Array de sugestões de endereços
   *
   * @example
   * ```ts
   * const suggestions = await mapboxService.getAddressSuggestions(
   *   "Teatro Amazonas",
   *   [-60.021, -3.119] // Manaus
   * );
   * ```
   */
  async getAddressSuggestions(
    query: string,
    proximity?: [lng: number, lat: number],
    options: {
      limit?: number;
      language?: 'pt' | 'en' | 'es';
      types?: string[]; // ['address', 'poi', 'place', 'region']
      bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
    } = {}
  ): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const {
      limit = 5,
      language = 'pt',
      types,
      bbox,
    } = options;

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = new URL(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${encodedQuery}.json`
      );

      // Parâmetros obrigatórios
      url.searchParams.set('access_token', this.token);
      url.searchParams.set('language', language);
      url.searchParams.set('limit', limit.toString());

      // Parâmetros opcionais
      if (proximity) {
        url.searchParams.set('proximity', `${proximity[0]},${proximity[1]}`);
      }

      if (types && types.length > 0) {
        url.searchParams.set('types', types.join(','));
      }

      if (bbox) {
        url.searchParams.set('bbox', bbox.join(','));
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data: MapboxGeocodingResponse = await response.json();

      return data.features.map((feature) => ({
        id: feature.id,
        label: this.extractShortLabel(feature),
        address: feature.place_name,
        lng: feature.center[0],
        lat: feature.center[1],
        relevance: feature.relevance,
      }));
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════
  // ═══ REVERSE GEOCODING ═══
  // ═══════════════════════════════════════

  /**
   * Busca o endereço de uma coordenada (reverse geocoding).
   *
   * @param lng - Longitude
   * @param lat - Latitude
   * @returns Endereço formatado
   *
   * @example
   * ```ts
   * const address = await mapboxService.reverseGeocode(-60.021, -3.119);
   * // "Av. Eduardo Ribeiro, Centro, Manaus - AM"
   * ```
   */
  async reverseGeocode(
    lng: number,
    lat: number,
    language: 'pt' | 'en' | 'es' = 'pt'
  ): Promise<string> {
    try {
      const url = new URL(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${lng},${lat}.json`
      );

      url.searchParams.set('access_token', this.token);
      url.searchParams.set('language', language);
      url.searchParams.set('limit', '1');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data: MapboxGeocodingResponse = await response.json();

      if (data.features.length === 0) {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      return data.features[0].place_name;
    } catch (error) {
      console.error('Erro ao fazer reverse geocoding:', error);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }

  // ═══════════════════════════════════════
  // ═══ DIRECTIONS (rotas) ═══
  // ═══════════════════════════════════════

  /**
   * Calcula uma rota entre dois pontos.
   *
   * @param options - Opções da rota (origem, destino, perfil)
   * @returns Informações da rota (distância, duração, geometria)
   *
   * @example
   * ```ts
   * const route = await mapboxService.getRoute({
   *   origin: [-60.021, -3.119],
   *   destination: [-60.015, -3.125],
   *   profile: 'driving',
   *   steps: true
   * });
   * ```
   */
  async getRoute(options: RouteOptions): Promise<RouteResponse> {
    const {
      origin,
      destination,
      profile = 'driving',
      alternatives = false,
      steps = false,
      geometries = 'geojson',
      language = 'pt',
    } = options;

    try {
      const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
      const url = new URL(
        `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinates}`
      );

      url.searchParams.set('access_token', this.token);
      url.searchParams.set('geometries', geometries);
      url.searchParams.set('overview', 'full');
      url.searchParams.set('alternatives', alternatives.toString());
      url.searchParams.set('steps', steps.toString());
      url.searchParams.set('language', language);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('Nenhuma rota encontrada');
      }

      const route = data.routes[0];

      // Se alternatives foi solicitado, retornar também as alternativas
      const routeResponse: RouteResponse = {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: steps
          ? route.legs[0].steps.map((step: any) => ({
              distance: step.distance,
              duration: step.duration,
              instruction: step.maneuver.instruction,
            }))
          : undefined,
        alternatives: alternatives && data.routes.length > 1
          ? data.routes.slice(1).map((alt: any) => ({
              distance: alt.distance,
              duration: alt.duration,
              geometry: alt.geometry,
              steps: steps
                ? alt.legs[0].steps.map((step: any) => ({
                    distance: step.distance,
                    duration: step.duration,
                    instruction: step.maneuver.instruction,
                  }))
                : undefined,
            }))
          : undefined,
      };

      return routeResponse;
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════
  // ═══ HELPERS PRIVADOS ═══
  // ═══════════════════════════════════════

  /**
   * Extrai um label curto e legível do feature do Mapbox.
   * Prioriza o nome principal sem informações redundantes.
   */
  private extractShortLabel(feature: MapboxFeature): string {
    // Para POIs (pontos de interesse), use apenas o nome
    if (feature.place_type.includes('poi')) {
      return feature.text;
    }

    // Para endereços, combine texto principal + bairro/cidade
    const parts: string[] = [feature.text];

    if (feature.context) {
      // Adiciona o primeiro contexto relevante (geralmente bairro ou distrito)
      const neighborhood = feature.context.find(
        (ctx) => ctx.id.startsWith('neighborhood') || ctx.id.startsWith('locality')
      );
      if (neighborhood) {
        parts.push(neighborhood.text);
      } else {
        // Se não tiver bairro, adiciona a cidade
        const place = feature.context.find((ctx) => ctx.id.startsWith('place'));
        if (place) {
          parts.push(place.text);
        }
      }
    }

    return parts.join(', ');
  }

  /**
   * Formata distância em metros para string legível.
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Formata duração em segundos para string legível.
   */
  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }
}

// ═══════════════════════════════════════
// ═══ SINGLETON EXPORT ═══
// ═══════════════════════════════════════

/**
 * Instância singleton do MapboxService.
 * Use este objeto para acessar todas as funcionalidades do Mapbox.
 *
 * @example
 * ```ts
 * import { mapboxService } from '@/app/lib/mapboxService';
 *
 * const suggestions = await mapboxService.getAddressSuggestions(
 *   "Teatro Amazonas",
 *   [-60.021, -3.119]
 * );
 * ```
 */
export const mapboxService = new MapboxService();

// Export da classe para casos de uso avançados (mocking, testes, etc)
export { MapboxService };
