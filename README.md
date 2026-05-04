# 🚌 WhatsApp STM Bot

Chatbot de WhatsApp para consultar el transporte público de Montevideo en tiempo real.

## ¿Qué hace?
- Enviás un número de parada (ej: `1192`) y el bot responde con los próximos ómnibus y tiempos de espera.
- Compartís tu ubicación y el bot encuentra las paradas más cercanas con sus próximos buses.

## Setup rápido

### Opción A: Script automático (recomendado)
```bash
chmod +x setup.sh
./setup.sh
```
El script hace todo: instala dependencias, sube el código a GitHub, deployea en Vercel y configura las variables de entorno.

### Opción B: Manual
```bash
npm install
cp .env.example .env
# Completar .env con tus credenciales
git init && git add . && git commit -m "primer commit"
git remote add origin https://github.com/TU-USUARIO/whatsapp-stm-bot.git
git push -u origin main
# Luego conectar el repo en vercel.com
```

## Credenciales necesarias

| Variable | Dónde obtenerla |
|---|---|
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) → Dashboard |
| `TWILIO_AUTH_TOKEN` | [console.twilio.com](https://console.twilio.com) → Dashboard |
| `TWILIO_PHONE_NUMBER` | `+14155238886` (Sandbox fijo) |
| `STM_CLIENT_ID` | [api.montevideo.gub.uy](https://api.montevideo.gub.uy) → Mis Aplicaciones |
| `STM_CLIENT_SECRET` | Ídem anterior |

## Deploy automático (CI/CD)

Cada push a `main` dispara un deploy automático a Vercel via GitHub Actions.

Para activarlo, agregá estos secrets en tu repo de GitHub (Settings → Secrets → Actions):
- `VERCEL_TOKEN` → desde [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` → desde `.vercel/project.json` después del primer deploy
- `VERCEL_PROJECT_ID` → desde `.vercel/project.json` después del primer deploy

## Configuración del webhook en Twilio

En el Sandbox de WhatsApp → "When a message comes in":
```
https://whatsapp-stm-bot.vercel.app/api/webhook
```
Método: **HTTP POST**

## Arquitectura

```
WhatsApp → Twilio Sandbox → Vercel (Node.js) → API Montevideo
```

## Ampliar paradas

El archivo `data/stops.json` tiene 10 paradas de ejemplo. Se puede ampliar con el dataset completo del CKAN de Montevideo:
https://ckan.montevideo.gub.uy
