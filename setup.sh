#!/bin/bash

# ============================================================
#   WHATSAPP STM BOT - Script de setup desde cero
# ============================================================

set -e

VERDE="\033[0;32m"
AMARILLO="\033[1;33m"
ROJO="\033[0;31m"
RESET="\033[0m"

ok()  { echo -e "${VERDE}✔ $1${RESET}"; }
info(){ echo -e "${AMARILLO}→ $1${RESET}"; }
err() { echo -e "${ROJO}✘ $1${RESET}"; exit 1; }

echo ""
echo "=============================================="
echo "   WhatsApp STM Bot - Setup automático"
echo "=============================================="
echo ""

# 1. Verificar herramientas necesarias
info "Verificando herramientas necesarias..."
command -v node >/dev/null 2>&1 || err "Node.js no está instalado. Instalalo desde https://nodejs.org"
command -v npm  >/dev/null 2>&1 || err "npm no está instalado."
command -v git  >/dev/null 2>&1 || err "Git no está instalado."
ok "Node $(node -v), npm $(npm -v), Git $(git --version | cut -d' ' -f3)"

# 2. Instalar dependencias
info "Instalando dependencias del proyecto..."
npm install
ok "Dependencias instaladas"

# 3. Crear archivo .env si no existe
if [ ! -f .env ]; then
  info "Creando archivo .env desde .env.example..."
  cp .env.example .env
  echo ""
  echo -e "${AMARILLO}⚠️  Completá el archivo .env con tus credenciales antes de continuar:${RESET}"
  echo "   • TWILIO_ACCOUNT_SID"
  echo "   • TWILIO_AUTH_TOKEN"
  echo "   • STM_CLIENT_ID"
  echo "   • STM_CLIENT_SECRET"
  echo ""
  read -p "Presioná Enter cuando hayas completado el .env..."
else
  ok "Archivo .env ya existe"
fi

# 4. Inicializar git si no está inicializado
if [ ! -d .git ]; then
  info "Inicializando repositorio Git..."
  git init
  git branch -M main
  ok "Repositorio Git inicializado"
else
  ok "Repositorio Git ya existe"
fi

# 5. Pedir URL del repositorio de GitHub
echo ""
echo -e "${AMARILLO}→ Necesitás crear un repositorio vacío en GitHub (sin README):${RESET}"
echo "   https://github.com/new"
echo ""
read -p "Pegá la URL del repositorio (ej: https://github.com/tuusuario/whatsapp-stm-bot): " REPO_URL

if [ -z "$REPO_URL" ]; then
  err "La URL del repositorio no puede estar vacía."
fi

# 6. Agregar remote y hacer push
info "Configurando remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git add .
git commit -m "🚀 Setup inicial del bot" 2>/dev/null || git commit --allow-empty -m "🚀 Setup inicial del bot"
git push -u origin main
ok "Código subido a GitHub"

# 7. Instalar Vercel CLI si no está
if ! command -v vercel >/dev/null 2>&1; then
  info "Instalando Vercel CLI..."
  npm install -g vercel
  ok "Vercel CLI instalado"
else
  ok "Vercel CLI ya instalado ($(vercel --version))"
fi

# 8. Login y deploy a Vercel
echo ""
info "Iniciando sesión en Vercel (abrirá el navegador)..."
vercel login

echo ""
info "Deployando a Vercel..."
echo -e "${AMARILLO}Cuando Vercel pregunte:${RESET}"
echo "  • Set up and deploy? → Y"
echo "  • Which scope? → tu cuenta personal"
echo "  • Link to existing project? → N"
echo "  • Project name? → whatsapp-stm-bot (o el que quieras)"
echo "  • In which directory? → . (punto, la raíz)"
echo ""
vercel --prod

echo ""
ok "¡Deploy completado!"

# 9. Configurar variables de entorno en Vercel
echo ""
info "Configurando variables de entorno en Vercel..."
echo -e "${AMARILLO}Cargando variables desde tu archivo .env...${RESET}"

while IFS='=' read -r KEY VALUE; do
  # Saltar líneas vacías y comentarios
  [[ -z "$KEY" || "$KEY" == \#* ]] && continue
  VALUE=$(echo "$VALUE" | tr -d '"' | tr -d "'")
  echo "  → Cargando $KEY..."
  echo "$VALUE" | vercel env add "$KEY" production --force 2>/dev/null || \
    vercel env add "$KEY" production <<< "$VALUE" 2>/dev/null || \
    echo -e "  ${AMARILLO}⚠️  Agregá $KEY manualmente en el dashboard de Vercel${RESET}"
done < .env

ok "Variables de entorno configuradas"

# 10. Obtener URL del proyecto
echo ""
VERCEL_URL=$(vercel ls 2>/dev/null | grep "whatsapp-stm-bot" | awk '{print $2}' | head -1)

echo ""
echo "=============================================="
echo -e "${VERDE}   ✅ ¡Setup completado exitosamente!${RESET}"
echo "=============================================="
echo ""
echo "📋 Próximos pasos manuales en Twilio:"
echo ""
echo "   1. Ir a: https://console.twilio.com"
echo "   2. Messaging → Try it out → Send a WhatsApp message"
echo "   3. En 'When a message comes in', pegar:"
echo ""
echo "      https://whatsapp-stm-bot.vercel.app/api/webhook"
echo ""
echo "   4. Método: HTTP POST → Guardar"
echo "   5. Conectar tu WhatsApp enviando el código de unión"
echo "      al número +14155238886"
echo ""
echo "   ¡Listo! Escribí 'ayuda' al bot para probarlo."
echo ""
