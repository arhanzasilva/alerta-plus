# 🗺️ Configuração do Mapbox

O Alerta+ agora usa **Mapbox GL JS** para mapas modernos e de alta qualidade.

## 📝 Como obter sua API Key (GRATUITA)

### 1. Criar conta no Mapbox
1. Acesse https://account.mapbox.com/auth/signup/
2. Crie uma conta gratuita (pode usar Google/GitHub)
3. **Free tier**: 50.000 carregamentos de mapa/mês (MUITO generoso)

### 2. Obter Access Token
1. Após login, vá para https://account.mapbox.com/access-tokens/
2. Copie seu **Default public token** (começa com `pk.`)
3. OU crie um novo token com permissões de leitura

### 3. Configurar no projeto
1. Crie um arquivo `.env` na raiz do projeto:
```bash
VITE_MAPBOX_TOKEN=seu_token_aqui
```

2. Exemplo de `.env`:
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWV1dXN1YXJpbyIsImEiOiJjbGV4YW1wbGUifQ.exemplo
```

### 4. Iniciar servidor de dev
```bash
npm run dev
```

## ✅ Verificar se está funcionando

Se o token estiver correto, você verá:
- ✅ Mapa com tiles modernos do Mapbox
- ✅ Dark mode funcionando (alterna com tema do app)
- ✅ Animações suaves (WebGL)
- ✅ Controles de zoom/navegação no canto superior direito

Se algo der errado:
- ❌ Mapa em branco → token inválido ou não configurado
- ❌ Console com erro → verificar formato do token

## 📊 Monitorar uso

- Dashboard: https://account.mapbox.com/
- Limite grátis: 50k loads/mês
- Após limite: $5 por 1000 loads extras (muito barato)

## 🎨 Estilos disponíveis

O projeto usa:
- **Light mode**: `mapbox://styles/mapbox/streets-v12`
- **Dark mode**: `mapbox://styles/mapbox/dark-v11`

Você pode trocar para outros estilos em `src/config/mapbox.ts`:
- `satellite-streets-v12` (satélite)
- `outdoors-v12` (outdoor/trilhas)
- Ou criar seu próprio estilo customizado no Mapbox Studio

## 🆘 Problemas comuns

### Token não carrega
```bash
# Certifique-se que o arquivo .env está na raiz do projeto
# E que o nome da variável é EXATAMENTE: VITE_MAPBOX_TOKEN
```

### Mapa não aparece
- Abra DevTools (F12) e veja o console
- Procure por erros de "accessToken"
- Verifique se o token começa com `pk.`

## 📚 Mais informações

- Docs oficiais: https://docs.mapbox.com/mapbox-gl-js/guides/
- Limites da API: https://www.mapbox.com/pricing
- Criar estilos customizados: https://studio.mapbox.com/

---

**Nota**: O token público pode ser exposto no código front-end — Mapbox permite isso e usa restrições de domínio para segurança.
