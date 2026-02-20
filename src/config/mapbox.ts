/**
 * Mapbox Configuration
 *
 * Para usar o Mapbox:
 * 1. Crie uma conta gratuita em https://account.mapbox.com/
 * 2. Copie seu Access Token
 * 3. Crie um arquivo .env na raiz do projeto
 * 4. Adicione: VITE_MAPBOX_TOKEN=seu_token_aqui
 *
 * Free tier: 50,000 map loads/mês
 */

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ||
  // Token público de demonstração (apenas para desenvolvimento)
  'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';

export const MAPBOX_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;
