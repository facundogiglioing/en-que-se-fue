This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Autenticación y permisos

El login usa Better Auth con sesiones persistidas en Postgres. No hay registro
público, tampoco desde Google: solo ingresan usuarios cargados previamente.

1. Agregar a `.env.local` las variables de `.env.example`, conservando `DATABASE_URL`.
   Generar `BETTER_AUTH_SECRET` con `openssl rand -base64 48`; usar un valor estable
   y privado. `BETTER_AUTH_URL` debe ser el origen público de la aplicación.
2. Ejecutar `yarn db:migrate`. La migración de autenticación carga únicamente
   `fac.giglio@gmail.com` y `sabrinagbravi@gmail.com` con rol `admin`, sin contraseñas.
3. Crear un cliente OAuth de tipo aplicación web en Google Cloud y configurar
   `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. Habilitar estas cuentas como usuarios
   de prueba si la aplicación OAuth sigue en modo de prueba.
4. Autorizar el callback `http://localhost:3000/api/auth/callback/google` y su
   equivalente HTTPS en producción. Reiniciar el servidor después de configurar.

Las cuentas iniciales acceden con Google. Una cuenta desconocida no se crea al
autenticarse y un email no verificado por Google no puede vincularse a una cuenta
precargada. Si falta la configuración OAuth, el formulario lo informa y deshabilita
el botón de Google; el acceso por contraseña sigue disponible.

### Usuarios con email y contraseña

Para agregar usuarios sin Gmail, usar el comando administrativo (no existe una
pantalla pública de alta). La contraseña se guarda con el hash scrypt de Better Auth.
En Bash, sin mostrar la contraseña ni guardarla en el historial:

```bash
read -r -s -p "Contraseña (12 a 128 caracteres): " PASSWORD; echo
printf '%s' "$PASSWORD" | yarn auth:create-user "persona@ejemplo.com" "Nombre" admin
unset PASSWORD
```

El comando rechaza emails existentes y roles no declarados en código. No modifica
las cuentas iniciales. Por ahora no hay recuperación de contraseña por correo.

### Roles y páginas

Los roles se declaran en `src/lib/roles.ts`. Cada página decide su acceso llamando
a `await requireRoles([ROLES.ADMIN])` **antes de leer datos**. Para incorporar un
rol, agregar su constante y habilitarlo explícitamente en las páginas y operaciones
correspondientes. Las Server Actions y las consultas de tarjetas también validan
el rol: ocultar la navegación o proteger un layout no sustituye estos controles.

Las sesiones duran siete días, se validan en la base de datos sin caché de cookies
y se eliminan al cerrar sesión. El rol se consulta desde el usuario persistido.
Los intentos con contraseña se limitan a cinco por minuto, con contadores en la
base de datos para compartir el límite entre instancias. En producción, configurar
el proxy para que reemplace `X-Forwarded-For` con la IP real y evitar el acceso
directo al servidor. Usar HTTPS para las cookies seguras.

Validaciones: `yarn test:auth`, `yarn tsc --noEmit` y `yarn build`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

/*
P.R.I.Y.A.
a e n   l
g s g   e
o ú r   r
s m e   t
  e s   a
  n o   s
  e s 
  s 

Porque a tu plata la querés... pero se te escapa
*/