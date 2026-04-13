# Mayolista-OK - Deploy Guide (GitHub + Vercel + Neon)

## Preparado ✅
- Base de datos Neon configurada y funcionando
- Tablas creadas automáticamente via Prisma
- Auth simplificado (sin NextAuth, usa header `x-user-id`)

## Paso 1: Subir a GitHub

1. Abrí VS Code en la carpeta del proyecto
2. Abrí la terminal (Ctrl+`)
3. Ejecutá estos comandos:

```bash
git init
git add .
git commit -m "Mayolista-OK v1.0 - App completa"
git remote add origin https://github.com/TU-USUARIO/mayolista-ok.git
git push -u origin main
```

## Paso 2: Deploy en Vercel

1. Andá a https://vercel.com
2. Hacé login con GitHub
3. Tocá **"Add New" → "Project"**
4. Elegí el repo **mayolista-ok**
5. En **Environment Variables**, agregá:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_YDJoQIc9Xay3@ep-floral-grass-amb75w35.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_YDJoQIc9Xay3@ep-floral-grass-amb75w35.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require` |

6. Tocá **"Deploy"**

## Paso 3: Crear las tablas en producción

Después del deploy, Vercel va a mostrar la URL de tu app (ej: `https://mayolista-ok.vercel.app`).

No necesitás hacer nada más - las tablas ya están creadas en Neon desde que ejecutamos `prisma db push`.

## Paso 4: Probar

Abrí la URL de Vercel, ingresá tu nombre y email, y listo! 🎉

## Variables de entorno (NO compartas estas keys!)

```
DATABASE_URL=postgresql://neondb_owner:npg_YDJoQIc9Xay3@ep-floral-grass-amb75w35.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://neondb_owner:npg_YDJoQIc9Xay3@ep-floral-grass-amb75w35.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```
