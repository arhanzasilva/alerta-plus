# Alerta+ 🚨

App de alertas urbanos para Manaus/AM - Sistema inteligente de rotas seguras e notificações em tempo real.

## 🌐 Demo Online

**[https://alerta-plus.vercel.app](https://alerta-plus.vercel.app)**

## ✨ Funcionalidades

- 🗺️ **Mapa interativo** com alertas em tempo real
- 🛣️ **Rotas seguras** com análise de riscos
- 🌓 **Dark mode** completo
- 🌍 **Multi-idioma** (Português, English, Español)
- 📱 **Responsivo** (mobile, tablet, desktop)
- 🔔 **Sistema de notificações**
- 👤 **Perfil de usuário** com conquistas
- 🆘 **Sistema de ajuda** e emergências

## 🚀 Tecnologias

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS v4** - Estilização
- **Leaflet** - Mapas interativos
- **React Router v7** - Navegação
- **Motion** (Framer Motion) - Animações
- **Sonner** - Notificações toast

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## 🎯 Estrutura do Projeto

```
src/
├── app/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas do app
│   ├── context/        # Context API (estado global)
│   └── data/           # Dados estáticos
├── styles/             # CSS e temas
└── main.tsx            # Entry point
```

## 🔐 Estados de Autenticação

- **Guest** - Usuário visitante
- **Anonymous** - Perfil local sem login
- **Authenticated** - Login completo (Google/Apple)

## 🎨 Temas

- Light mode
- Dark mode
- Sistema (automático)

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Android Chrome
- ✅ Tablets e desktops

## 📄 Licença

© 2025 Alerta+ - Todos os direitos reservados
