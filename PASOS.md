# Registro del Encuentro: pasos para activarlo

## 1. Copiar archivos a C:\Serambi-Ecopil
Copia el contenido de `archivos/` encima del proyecto (respeta las carpetas):
- src/lib/ecopil.ts (nuevo)
- src/app/registro/page.tsx (nuevo)
- src/app/admin/registros/page.tsx (nuevo)
- src/app/perfil/page.tsx, src/components/landing/LandingPage.tsx, src/components/layout/Header.tsx, src/components/layout/BottomNav.tsx (modificados)
- supabase/migrations/20261028_encuentro_registro.sql (ya aplicado en la base; solo es registro)

## 2. Variables de entorno
En `.env.local` y en Vercel (Settings → Environment Variables) agrega:

```
NEXT_PUBLIC_ECOPIL_SUPABASE_URL=https://jtnxmxmtyfmdhojpivgy.supabase.co
NEXT_PUBLIC_ECOPIL_SUPABASE_ANON_KEY=sb_publishable__6c-rvs6SdyJOsl7kjm9DQ_7qf6bcJ1
```
(Es la llave pública; es seguro tenerla en el navegador.)

## 3. Supabase → Authentication (proyecto Provicional EcopilGo)
- URL Configuration → Redirect URLs: agrega `https://<dominio-de-la-app-del-encuentro>/registro` y `http://localhost:3000/registro`.
  No cambies el Site URL: es el de jornadas.
- Email Templates → Magic Link: para que llegue el código de 6 dígitos, agrega `{{ .Token }}` al texto
  (por ejemplo: "Tu código: {{ .Token }}"). El enlace sigue funcionando igual para jornadas.

## 4. Staff
Por ahora solo Luis es admin. Para dar acceso a cada persona del staff (Karla, Marcos, Alexia, Wendy…),
en el SQL Editor:

```
insert into encuentro_staff (email, rol) values ('correo@ejemplo.com', 'staff');
```

## Cómo se usa
- Agentes: portada → "Voy al Encuentro: registrarme" → correo → código → formulario (foto, celular, nodo, emergencia).
  Si su correo ya está en jornadas, se precargan nombre, teléfono, ciudad, foto y nodo.
- Staff: Perfil → Herramientas → Registros (o /admin/registros). Tocar A o B aprueba y asigna grupo.
