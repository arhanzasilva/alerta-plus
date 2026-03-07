# Alerta+ — Alertas Urbanos de Manaus

PWA de alertas urbanos colaborativos para Manaus/AM. Permite que cidadãos reportem, confirmem e visualizem em tempo real ocorrências como alagamentos, crimes, obras e pontos fixos de risco na cidade.

**Demo:** https://alerta-plus.vercel.app

---

## Funcionalidades

### Mapa Interativo
- Mapa vetorial com Mapbox GL JS (dark/light mode automático)
- Marcadores e zonas de risco com cores por tipo de alerta
- GPS de alta precisão com atualização contínua da posição
- Detecção de proximidade: banner de alerta quando usuário está a menos de 200m de um incidente
- Clique em qualquer ponto do mapa para ver o endereço e reportar um alerta naquele local

### Alertas em Tempo Real
- Compartilhados entre todos os usuários via Firestore (`onSnapshot`)
- Dados oficiais pré-populados: SSP-AM, Defesa Civil de Manaus, MANAUSTRANS
- **Tipos de alerta:**
  - Segurança: Crime, Zona de perigo, Furto/Roubo, Assalto
  - Infraestrutura: Alagamento, Obstáculo, Obra, Sem iluminação
  - Acessibilidade: Problema de acessibilidade
  - Ponto Fixo: Boca de tráfico, Território de gangue (expiram em 30 dias)
- Expiração automática: alertas de usuários expiram em 4h; pontos fixos em 30 dias
- Alertas muito contestados (3+ negações > confirmações) são removidos automaticamente

### Sistema de Votos
- Confirmar ou contestar alertas de outros usuários
- Proteção contra voto duplo por sessão
- Contadores em tempo real com Firestore `increment` atômico

### Compartilhar Alerta
- Compartilhamento nativo via `navigator.share` no celular
- Fallback para cópia para área de transferência com toast de confirmação

### Autenticação Firebase
- Cadastro e login com e-mail e senha
- Login com Google (`signInWithPopup`)
- 3 estados de autenticação: `guest`, `anonymous`, `authenticated`
- Perfil salvo no Firestore (`users/{uid}`) com cache offline no localStorage

### Gamificação
- Pontos por reporte (5–20 conforme gravidade) e por confirmação de alertas (+5)
- Nível de confiança (1–5) que aumenta a cada 5 reportes
- 16 conquistas desbloqueáveis com barras de progressão
- Todos os dados sincronizados no Firestore para usuários autenticados

### Notificações Push (FCM)
- Token FCM registrado no Firestore (`users/{uid}/fcmTokens`)
- Notificações em foreground via `onMessage`
- Notificações em background via `firebase-messaging-sw.js` (service worker separado)
- Notificação local automática quando novo alerta aparece a menos de 2km do usuário
- Central de notificações com leitura/descarte individual e em massa

### Rotas e Navegação
- Busca de endereços com Mapbox Geocoding API (POIs e endereços)
- Planejamento de rotas com análise de segurança baseada em zonas de crime de Manaus
- Modo navegação GPS com instruções passo a passo
- Rotas favoritas salvas no Firestore para usuários autenticados

### PWA
- Instalável em Android e iOS como app nativo
- Cache offline com Workbox (via vite-plugin-pwa)
- Service worker FCM separado para push notifications em background

### UX e Acessibilidade
- Dark mode com toggle persistido (variáveis CSS + classe `dark` no `<html>`)
- 3 idiomas: Português, English, Español
- Safe area para iOS (notch e home indicator)
- Responsivo: mobile-first (375px) até desktop

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 18.3 + TypeScript |
| Build | Vite 6.3 |
| Estilo | Tailwind CSS v4 (sem tailwind.config.js) |
| Roteamento | react-router v7 (Data mode) |
| Animações | motion/react 12.x |
| Mapa | Mapbox GL JS |
| Banco de dados | Firebase Firestore (tempo real) |
| Autenticação | Firebase Auth |
| Push Notifications | Firebase Cloud Messaging |
| Ícones | @tabler/icons-react |
| Toasts | sonner |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | Vercel |

---

## Estrutura do Projeto

```
src/
├── main.tsx
├── styles/                         # CSS global, fontes, tema dark mode
├── config/
│   ├── firebase.ts                 # Firestore, Auth, FCM Messaging
│   └── mapbox.ts                   # Token e estilos Mapbox
└── app/
    ├── App.tsx                     # Root: AppProvider + RouterProvider + Toaster
    ├── routes.tsx                  # createBrowserRouter com todas as rotas
    ├── context/
    │   ├── AppContext.tsx          # Estado global, auth, incidents, gamificação
    │   └── translations.ts         # i18n pt/en/es
    ├── components/
    │   ├── Layout.tsx              # Shell com navbar inferior (3 abas)
    │   └── NavigationMode.tsx      # Modo navegação GPS
    ├── hooks/
    │   ├── useNotifications.ts     # FCM token + notificações foreground
    │   ├── useSearchHistory.ts     # Histórico de buscas
    │   └── usePlannedRoutes.ts     # Rotas planejadas
    ├── pages/
    │   ├── MapView.tsx             # Tela principal — mapa, alertas, formulário
    │   ├── Splash.tsx              # Tela de abertura com animação
    │   ├── Onboarding.tsx          # Fluxo de boas-vindas
    │   ├── Login.tsx               # Login (email + Google)
    │   ├── Register.tsx            # Cadastro de conta
    │   ├── Profile.tsx             # Perfil, conquistas, gamificação
    │   ├── Notifications.tsx       # Central de notificações
    │   ├── Routes.tsx              # Planejador de rotas
    │   ├── Settings.tsx            # Configurações (tema, idioma, unidades)
    │   ├── HelpFeedback.tsx        # Feedback e ajuda
    │   └── HelpHistory.tsx         # Histórico de alertas
    ├── data/
    │   ├── seedIncidents.ts        # Dados oficiais SSP-AM / Defesa Civil / MANAUSTRANS
    │   └── crimeZones.ts           # Zonas de risco + haversineDistance
    └── lib/
        ├── mapboxService.ts        # Geocoding e sugestões de endereço
        └── routeSafetyAnalyzer.ts  # Análise de segurança de rotas

public/
└── firebase-messaging-sw.js       # Service worker FCM (push em background)

firestore.rules                    # Regras de segurança do Firestore
storage.rules                      # Regras do Firebase Storage
firebase.json                      # Configuração Firebase CLI
```

---

## Firestore — Estrutura de Dados

```
incidents/{incidentId}
  type: string              # flood | obstacle | crime | drug-traffic | ...
  location: { lat, lng, address }
  timestamp: number
  status: active | expired | resolved
  severity: low | medium | high | critical
  confirmations: number
  denials: number
  official?: boolean
  permanent?: boolean       # true para pontos fixos (30 dias)
  reportedBy: string
  description?: string
  officialSource?: string
  nextReviewAt?: number

users/{uid}
  name, email, loginMethod
  points, trustLevel, reportsCount
  impactCount, confirmationsGiven, denialsGiven, routesSearched
  badges: string[]
  achievements: { [id]: unlockedAt }   # Map de conquistas desbloqueadas
  favoriteRoutes: FavoriteRoute[]
  notificationSettings: { alerts, community, achievements, sound, vibration }
  fcmTokens: string[]                  # Tokens FCM para push notifications
```

---

## Variáveis de Ambiente

```env
# Mapbox — https://account.mapbox.com/access-tokens/
VITE_MAPBOX_TOKEN=pk.xxx

# Firebase FCM VAPID Key
# Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
VITE_FIREBASE_VAPID_KEY=xxx
```

---

## Rodando Localmente

```bash
npm install
npm run dev      # desenvolvimento (http://localhost:5173)
npm run build    # build de produção
npm run preview  # preview do build local
```

---

## Deploy

Deploy automático no Vercel a cada push para `main`.

```bash
# Deploy manual
vercel --prod

# Atualizar Firestore Security Rules
npx firebase-tools deploy --only firestore:rules
```
