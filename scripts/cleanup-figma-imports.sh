#!/bin/bash
# ================================================================
# Alerta+ — Limpeza de arquivos de referencia do Figma Make
# ================================================================
# Este script remove os arquivos em /src/imports/ que eram apenas
# referencia visual do Figma (telas exportadas como componentes React)
# e NAO sao importados pelo app funcional.
#
# Arquivos MANTIDOS (usados pelo app):
#   - svg-hkfx6ct22z.ts  (Layout.tsx — icones do navbar)
#   - svg-90w5vqo0ll.ts  (Onboarding.tsx — ilustracoes)
#   - svg-53og7kmmrf.ts  (Onboarding.tsx — seta voltar)
#   - svg-h2odaglmib.ts  (Splash.tsx — logo)
#
# Uso: bash scripts/cleanup-figma-imports.sh
# ================================================================

set -e

IMPORTS_DIR="src/imports"
COUNT=0

# Arquivos SVG que o app REALMENTE usa
KEEP_FILES=(
  "svg-hkfx6ct22z.ts"
  "svg-90w5vqo0ll.ts"
  "svg-53og7kmmrf.ts"
  "svg-h2odaglmib.ts"
)

echo "Limpando arquivos de referencia do Figma em $IMPORTS_DIR..."
echo ""

for file in "$IMPORTS_DIR"/*; do
  filename=$(basename "$file")

  # Pular os arquivos que precisamos manter
  keep=false
  for keep_file in "${KEEP_FILES[@]}"; do
    if [ "$filename" = "$keep_file" ]; then
      keep=true
      break
    fi
  done

  if [ "$keep" = false ]; then
    echo "  Removendo: $filename"
    rm "$file"
    COUNT=$((COUNT + 1))
  else
    echo "  Mantendo:  $filename (usado pelo app)"
  fi
done

echo ""
echo "Concluido! $COUNT arquivos removidos."
echo ""
echo "Arquivos de referencia do Figma tambem podem ser removidos:"
echo "  - /replace_font.py"
echo "  - /guidelines/Guidelines.md"
echo "  - /ATTRIBUTIONS.md"
echo "  - /src/app/components/figma/ImageWithFallback.tsx (nao usado pelo app)"
