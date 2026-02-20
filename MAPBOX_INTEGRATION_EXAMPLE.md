# 🔌 Exemplo de Integração do MapboxService

## Como integrar busca real de endereços no MapView.tsx

### 1️⃣ **Importar o serviço** (no topo do arquivo)

```ts
import { mapboxService } from "../lib/mapboxService";
```

### 2️⃣ **Adicionar estado para sugestões** (dentro do componente)

```ts
// Junto com os outros estados
const [suggestions, setSuggestions] = useState<Array<{
  id: string;
  label: string;
  address: string;
  lng?: number;
  lat?: number;
}>>(SUGGESTIONS); // Começa com sugestões mockadas

const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
```

### 3️⃣ **Criar função de busca com debounce**

```ts
// Dentro do componente MapView
const searchAddresses = useCallback(
  async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions(SUGGESTIONS); // Volta para sugestões padrão
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const results = await mapboxService.getAddressSuggestions(
        query,
        userLocation ? [userLocation.lng, userLocation.lat] : [-60.021, -3.119], // Proximity = Manaus
        {
          limit: 6,
          language: language as 'pt' | 'en' | 'es',
          types: ['address', 'poi', 'place'] // Endereços, POIs e lugares
        }
      );

      // Mapeia para o formato esperado
      setSuggestions(
        results.map(r => ({
          id: r.id,
          label: r.label,
          address: r.address,
          lng: r.lng,
          lat: r.lat
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      // Em caso de erro, mantém as sugestões mockadas
      setSuggestions(SUGGESTIONS);
    } finally {
      setIsLoadingSuggestions(false);
    }
  },
  [userLocation, language]
);

// Debounce para evitar muitas chamadas à API
useEffect(() => {
  if (!showSearch) return;

  const timer = setTimeout(() => {
    searchAddresses(searchQuery);
  }, 300); // 300ms de delay

  return () => clearTimeout(timer);
}, [searchQuery, showSearch, searchAddresses]);
```

### 4️⃣ **Atualizar o input de busca** (mostrar loading)

No modal de busca, onde está o input:

```tsx
<div className={`w-full h-[55px] ${sheetInputBg} rounded-[16px] flex items-center gap-2 px-4`}>
  <IconSearch className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-[#c2c3ca]"}`} />

  <input
    type="text"
    placeholder={t("mapview.searchPlaceholder", language)}
    autoFocus
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className={`flex-1 bg-transparent text-[16px] font-['Poppins'] ${
      isDark ? "placeholder:text-gray-500 text-white" : "placeholder:text-[#c2c3ca] text-[#101828]"
    } focus:outline-none`}
  />

  {/* Indicador de loading */}
  {isLoadingSuggestions ? (
    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
  ) : (
    <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
      <IconX className={`w-5 h-5 ${sheetTextMuted}`} />
    </button>
  )}
</div>
```

### 5️⃣ **Atualizar a lista de sugestões** (usar dados reais)

```tsx
{/* Suggestions */}
<div className="px-5 flex-1 overflow-y-auto">
  <p className={`${isDark ? "text-gray-500" : "text-[#404751] opacity-[0.36]"} text-[14px] font-semibold font-['Poppins'] mb-3`}>
    {t("mapview.suggestions", language)}
  </p>

  {isLoadingSuggestions ? (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-3 border-gray-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ) : suggestions.length === 0 ? (
    <p className={`${sheetTextMuted} text-center py-8`}>
      Nenhum resultado encontrado
    </p>
  ) : (
    suggestions.map((s) => (
      <button
        key={s.id}
        onClick={() => {
          setShowSearch(false);
          navigate("/routes", {
            state: {
              origin: t("mapview.currentLocation", language),
              destination: s.address,
              destinationCoords: s.lng && s.lat ? { lng: s.lng, lat: s.lat } : undefined,
              autoSearch: true
            }
          });
        }}
        className={`w-full flex items-center gap-2.5 py-3.5 border-b ${sheetBorder}`}
      >
        <div className={`w-8 h-8 ${isDark ? "bg-gray-600" : "bg-[#c0c0c0]"} rounded-full flex items-center justify-center flex-shrink-0`}>
          <IconMapPin className="w-[18px] h-[18px] text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className={`${sheetText} text-[15px] font-semibold font-['Poppins']`}>
            {s.label}
          </p>
          <p className={`${sheetTextSec} text-[13px] font-medium font-['Poppins']`}>
            {s.address}
          </p>
        </div>
      </button>
    ))
  )}
</div>
```

---

## 🎯 **Exemplo completo de uso**

### Buscar endereços próximos ao usuário:
```ts
const suggestions = await mapboxService.getAddressSuggestions(
  "teatro",
  userLocation ? [userLocation.lng, userLocation.lat] : undefined
);
```

### Buscar apenas POIs (pontos de interesse):
```ts
const pois = await mapboxService.getAddressSuggestions(
  "shopping",
  [-60.021, -3.119],
  { types: ['poi'] }
);
```

### Buscar apenas endereços:
```ts
const addresses = await mapboxService.getAddressSuggestions(
  "Av Constantino Nery",
  [-60.021, -3.119],
  { types: ['address'] }
);
```

### Limitar busca a uma região (bounding box):
```ts
// Bbox de Manaus: [minLng, minLat, maxLng, maxLat]
const results = await mapboxService.getAddressSuggestions(
  "centro",
  undefined,
  { bbox: [-60.1, -3.2, -59.9, -3.0] }
);
```

---

## 📊 **Vantagens desta integração:**

✅ **Busca real** de endereços do Mapbox
✅ **Autocomplete** inteligente
✅ **Proximidade** - prioriza resultados perto do usuário
✅ **Multilíngue** - pt/en/es
✅ **Tipos customizáveis** - POIs, endereços, lugares
✅ **Debounce** - evita chamadas excessivas à API
✅ **Loading states** - UX profissional
✅ **Fallback** - volta para sugestões mockadas em caso de erro

---

## 🔥 **Próximos passos sugeridos:**

1. **Integrar no MapView.tsx** - seguir o exemplo acima
2. **Integrar no Routes.tsx** - usar para busca de origem/destino
3. **Adicionar cache** - salvar buscas recentes no localStorage
4. **Usar getRoute()** - calcular rotas reais entre pontos
5. **Usar reverseGeocode()** - mostrar endereço ao clicar no mapa

---

## ⚠️ **Limites da API (Free tier):**

- **50.000 requests/mês** grátis
- Geocoding: ilimitado dentro do limite total
- Directions: ilimitado dentro do limite total
- Após limite: ~$0.50 por 1000 requests (muito barato)

**Dica**: Use debounce e cache para economizar requests!
