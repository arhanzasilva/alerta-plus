# Alerta+ — Contexto do Projeto para Claude Code

## O que e
App de alertas urbanos para Manaus/AM. React 18 + Vite + Tailwind CSS v4 + react-router v7 (Data mode). **NAO e React Native** — e uma SPA web.

## Comandos
- `npm run dev` — servidor de desenvolvimento (Vite)
- `npm run build` — build de producao (tsc + vite build)
- `npm run preview` — servir build local

## Stack Principal
- **React 18.3.1** + TypeScript
- **Vite 6.3.5** como bundler
- **Tailwind CSS v4.1.12** via plugin `@tailwindcss/vite` (sem tailwind.config.js)
- **react-router v7.13.0** — Data mode com `createBrowserRouter` + `RouterProvider`
- **motion 12.x** — animacoes via `import { motion } from "motion/react"`
- **Mapbox GL JS** — mapas modernos com WebGL, dark mode nativo, tiles vetoriais. API key configurada via `.env` (ver `MAPBOX_SETUP.md`)
- **@tabler/icons-react** — icones (outline em geral; filled em CATEGORY_CONFIG do Routes.tsx e ACHIEVEMENT_DEFS do AppContext.tsx)
- **sonner** — toasts
- **Context API + localStorage** — estado global (prefixo `alertaplus_`)

## Estrutura
```
src/
  main.tsx                    # Entry point (ReactDOM.createRoot)
  styles/                     # CSS: fonts, tailwind, theme (dark mode vars)
  app/
    App.tsx                   # Root: AppProvider + RouterProvider + Toaster
    routes.tsx                # createBrowserRouter com todas as rotas
    context/
      AppContext.tsx           # Estado global, 3 estados de auth, persistencia localStorage
      translations.ts         # i18n pt/en/es com funcao t(key, language)
    components/
      Layout.tsx              # Shell com navbar inferior (3 abas: Mapa, Alertas, Perfil)
      NavigationMode.tsx      # Navegacao GPS
      ui/                     # Componentes shadcn-ui (Radix)
    pages/                    # Todas as telas do app
    data/
      crimeZones.ts           # Zonas de risco de Manaus
  imports/                    # SVGs do Figma (apenas 4 usados pelo app)
```

## Regras Criticas

### Responsividade:
- O app foi desenvolvido mobile-first (375px) mas DEVE ser responsivo
- Usar breakpoints Tailwind CSS v4: sm: (640px), md: (768px), lg: (1024px), xl: (1280px)
- Mobile (< 768px): layout coluna unica (estilo atual)
- Tablet (md:): ajustar espacamentos, grids 2 colunas quando fizer sentido
- Desktop (lg:): conteudo centralizado com max-width, panels laterais, grids maiores
- No desktop: navbar inferior pode virar sidebar lateral; bottom sheets podem virar paineis laterais

### Arquivos com edicoes manuais — NAO sobrescrever sem ler primeiro:
- `Settings.tsx`
- `Onboarding.tsx`
- `Register.tsx`
- `Notifications.tsx`
- `Login.tsx`

### Bug recorrente:
- Linha ~620 de `Routes.tsx` — backtick/`}` faltando em template literal de `className`. Sempre verificar apos edicoes.

### Autenticacao (3 estados no AppContext):
- **guest**: `userProfile === null`
- **anonymous**: `userProfile` existe mas sem `loginMethod`
- **authenticated**: `userProfile` com `loginMethod` preenchido
- Profile.tsx tem 3 renderizacoes distintas por estado

### Dark mode:
- Toggle via `toggleTheme()` no AppContext
- Classe `dark` no `<html>` + variaveis CSS em `theme.css`
- Hook `useThemeClasses(theme)` retorna classes tematicas (`tc.isDark`, etc.)

### Traducoes:
- 3 idiomas: pt (padrao), en, es
- `t(key, language)` em `translations.ts`
- `formatDistanceWithUnit(meters, unit, language)` para distancias

### Layout:
- Navbar inferior: apenas 3 abas (Mapa, Alertas, Perfil)
- Tela de Rotas: full-screen sem navbar, acessivel pelos atalhos no bottom sheet do MapView
- Routes.tsx: `home` = IconHome verde (#00BC7D), `work` = IconBriefcase2 azul (#2b7fff), `custom` renomeada "Outro"

### Paginas com dark mode + traducoes COMPLETOS:
MapView, Notifications, Profile, Settings, Layout, Routes, NavigationMode, Login, Register, HelpFeedback, HelpHistory, Onboarding

### Paginas FALTANDO dark mode + traducoes:
Nenhuma (todas as paginas principais estao completas)

## Dependencias nao usadas (removidas do package.json)
@emotion/*, @mui/*, @popperjs/core, react-dnd*, leaflet, @types/leaflet, react-leaflet, react-popper, react-responsive-masonry, react-slick, date-fns

## Configuracao do Mapbox
- **API Key necessaria**: Configure `VITE_MAPBOX_TOKEN` em arquivo `.env` na raiz
- **Free tier**: 50.000 map loads/mes (muito generoso)
- **Guia completo**: Ver `MAPBOX_SETUP.md` para instrucoes passo a passo
- **Estilos**: Dark/Light mode automatico (configurado em `src/config/mapbox.ts`)

## Pasta /src/imports/ (Figma)
Contem ~80 arquivos de referencia visual do Figma. Apenas 4 SVGs sao usados pelo app:
- `svg-hkfx6ct22z.ts` (Layout.tsx)
- `svg-90w5vqo0ll.ts` (Onboarding.tsx)
- `svg-53og7kmmrf.ts` (Onboarding.tsx)
- `svg-h2odaglmib.ts` (Splash.tsx)

Para limpar os nao usados:
- Windows: `scripts\cleanup-figma-imports.bat`
- Mac/Linux: `bash scripts/cleanup-figma-imports.sh`