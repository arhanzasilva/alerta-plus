# Alerta+ — Alertas Urbanos de Manaus

PWA de alertas urbanos colaborativos para Manaus/AM. Permite que cidadãos reportem, confirmem e visualizem em tempo real ocorrências como alagamentos, crimes, obras e pontos fixos de risco na cidade.

**Demo:** https://alerta-plus.vercel.app

---

## Funcionalidades

### Mapa Interativo
- Mapa vetorial com Mapbox GL JS (dark/light mode automático, tiles WebGL)
- Marcadores coloridos por tipo/gravidade de alerta e zonas de risco de Manaus
- GPS de alta precisão com atualização contínua da posição
- Banner de proximidade: alerta visual quando o usuário está a menos de 200m de um incidente ativo
- Clique em qualquer ponto do mapa para ver o endereço e reportar um alerta naquele local
- Bottom sheet expansível com detalhes, votos e ações de cada alerta

### Alertas em Tempo Real
- Sincronização entre todos os usuários via Firestore `onSnapshot`
- Dados oficiais pré-populados: SSP-AM, Defesa Civil de Manaus, MANAUSTRANS
- **Tipos de alerta:**
  - Segurança: Crime, Zona de perigo, Furto/Roubo, Assalto
  - Infraestrutura: Alagamento, Obstáculo, Obra, Sem iluminação
  - Acessibilidade: Problema de acessibilidade
  - Ponto Fixo: Boca de tráfico, Território de gangue
- Expiração automática: alertas de usuários expiram em 4h; pontos fixos em 30 dias
- Alertas muito contestados (3+ negações > confirmações) são removidos automaticamente
- Compartilhamento nativo via `navigator.share` com fallback para clipboard

### Sistema de Votos
- Confirmar ou contestar alertas de outros usuários
- Proteção contra voto duplo por sessão
- Contadores em tempo real com Firestore `increment` atômico

### Autenticação Firebase
- Cadastro e login com e-mail e senha
- Login com Google (`signInWithPopup`)
- 3 estados de autenticação: `guest` (sem conta), `anonymous` (sem login), `authenticated`
- Perfil salvo no Firestore (`users/{uid}`) com cache offline no localStorage
- Troca de senha com reautenticação segura (`reauthenticateWithCredential`)

### Perfil e Gamificação
- Pontos por reporte (5–20 conforme gravidade) e por confirmação de alertas (+5)
- Nível de confiança (1–5) que sobe a cada 5 reportes: Iniciante → Ativo → Confiável → Veterano
- **8 conquistas desbloqueáveis** com barras de progressão e ícones:
  - Primeiro Alerta, Vigilante (5 reportes), Guardião (20 reportes), Herói da Cidade (50 reportes)
  - Colaborador (5 confirmações), Explorador (3 bairros), Navegador (5 rotas), Madrugador (alerta entre 0h–5h)
- Todos os dados sincronizados no Firestore para usuários autenticados
- Avatar gerado por iniciais com cor dinâmica

### Central de Notificações
- Listagem de alertas próximos filtráveis por raio (500m, 1km, 2km, 5km, Todos)
- Raio padrão "Todos" para garantir visibilidade imediata
- Leitura individual ou em massa; descarte individual por notificação
- "Limpar tudo" com confirmação em dois toques (previne descarte acidental)
- Clicar em um alerta navega direto para o mapa
- Badge de não lidas sincronizado via AppContext

### Notificações Push (FCM)
- Token FCM registrado no Firestore (`users/{uid}/fcmTokens`)
- Notificações em foreground via `onMessage`
- Notificações em background via `firebase-messaging-sw.js` (service worker separado)
- Ao entrar no app: única notificação resumida para novos alertas (evita flood)
- Notificação local automática quando novo alerta aparece a menos de 2km do usuário

### Rotas e Navegação
- Busca de endereços com Mapbox Geocoding API (POIs e endereços de Manaus)
- Planejamento de rotas com análise de segurança baseada em zonas de crime
- Score de segurança visual (0–100) com detalhamento por zonas interceptadas
- Modo navegação GPS com instruções passo a passo e ETA dinâmico
- Destinos rápidos: Casa (verde) e Trabalho (azul) configuráveis
- Rotas favoritas salvas no Firestore para usuários autenticados

### Configurações
- Dark mode com toggle persistido (variáveis CSS + classe `dark` no `<html>`)
- 3 idiomas: Português, English, Español (todas as telas traduzidas)
- Unidade de distância: km ou milhas
- Tipo de veículo, combustível e preferências de navegação salvos por dispositivo
- Edição de nome, e-mail, bairro e senha diretamente no app
- Notificações por categoria: alertas, comunidade, conquistas, som e vibração

### PWA
- Instalável em Android e iOS como app nativo (A2HS)
- Cache offline com Workbox (via vite-plugin-pwa)
- Service worker FCM separado para push notifications em background
- Safe area para iOS (notch e home indicator via `env(safe-area-inset-*)`)

### Acessibilidade e Responsividade
- Mobile-first (375px) com breakpoints para tablet e desktop
- No desktop: conteúdo centralizado com max-width e grids maiores
- Fontes Poppins + Inter via Google Fonts

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 18.3 + TypeScript |
| Build | Vite 6.3 |
| Estilo | Tailwind CSS v4 (sem tailwind.config.js) |
| Roteamento | react-router v7 (Data mode, `createBrowserRouter`) |
| Animações | motion/react 12.x |
| Mapa | Mapbox GL JS |
| Banco de dados | Firebase Firestore (tempo real) |
| Autenticação | Firebase Auth (email/senha + Google) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Ícones | @tabler/icons-react |
| Toasts | sonner |
| PWA | vite-plugin-pwa + Workbox |
| Estado global | Context API + localStorage (prefixo `alertaplus_`) |
| Deploy | Vercel (CI automático no push para `main`) |

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
    │   ├── AppContext.tsx          # Estado global, auth, incidents, gamificação, notificações
    │   └── translations.ts         # i18n pt/en/es (~1500 chaves)
    ├── components/
    │   ├── Layout.tsx              # Shell com navbar inferior (Mapa / Alertas / Perfil)
    │   └── NavigationMode.tsx      # Overlay de modo navegação GPS
    ├── hooks/
    │   ├── useNotifications.ts     # FCM token + notificações foreground
    │   ├── useSearchHistory.ts     # Histórico de buscas de endereços
    │   └── usePlannedRoutes.ts     # Rotas planejadas (estado local + Firestore)
    ├── pages/
    │   ├── MapView.tsx             # Tela principal — mapa, alertas, bottom sheet, relatório
    │   ├── Splash.tsx              # Tela de abertura com animação SVG
    │   ├── Onboarding.tsx          # Fluxo de boas-vindas (4 etapas)
    │   ├── Login.tsx               # Login (email + Google)
    │   ├── Register.tsx            # Cadastro de conta
    │   ├── Profile.tsx             # Perfil, conquistas, gamificação, logout
    │   ├── Notifications.tsx       # Central de notificações com filtro de raio
    │   ├── Routes.tsx              # Planejador de rotas com análise de segurança
    │   ├── Settings.tsx            # Configurações completas do app
    │   ├── HelpFeedback.tsx        # Formulário de feedback e ajuda
    │   └── HelpHistory.tsx         # Histórico de alertas reportados pelo usuário
    ├── data/
    │   ├── seedIncidents.ts        # Dados oficiais SSP-AM / Defesa Civil / MANAUSTRANS
    │   └── crimeZones.ts           # Polígonos de zonas de risco de Manaus
    └── lib/
        ├── mapboxService.ts        # Geocoding, reverse geocoding e sugestões
        └── routeSafetyAnalyzer.ts  # Análise de segurança de rotas por zona

public/
└── firebase-messaging-sw.js       # Service worker FCM (push em background)

firestore.rules                    # Regras de segurança do Firestore
firebase.json                      # Configuração Firebase CLI
```

---

## Firestore — Estrutura de Dados

```
incidents/{incidentId}
  type: string              # flood | obstacle | crime | drug-traffic | gang-territory | ...
  location: { lat, lng, address }
  timestamp: number
  status: active | expired | resolved
  severity: low | medium | high | critical
  confirmations: number
  denials: number
  official?: boolean        # true para alertas SSP-AM / Defesa Civil / MANAUSTRANS
  permanent?: boolean       # true para pontos fixos (expiram em 30 dias)
  reportedBy: string
  description?: string
  officialSource?: string
  nextReviewAt?: number

users/{uid}
  name, email, loginMethod
  points, trustLevel, reportsCount
  confirmationsGiven, denialsGiven, routesSearched
  transportMode: car | moto | bike | walk
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

O Firebase é configurado diretamente em `src/config/firebase.ts` (sem variáveis de ambiente adicionais).

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
