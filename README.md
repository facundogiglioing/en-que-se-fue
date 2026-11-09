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

## Importar y deshacer resúmenes

Los movimientos del PDF se cargan en la tarjeta y el mes seleccionados en la
pantalla, no en el mes de cierre del resumen. Para tarjetas a mes vencido, se
guardan en el período de consumo anterior para aparecer en el mes seleccionado.
La fecha original del consumo se conserva; la detección de duplicados usa el
período seleccionado. Las fechas de cierre y vencimiento solo se actualizan
cuando el resumen está vigente.

El botón de deshacer junto al importador permite borrar, previa confirmación,
los movimientos de la última importación de esa tarjeta, aunque se hayan cargado
en otro mes. Se identifica el lote por su fecha de creación compartida y la fecha
de movimiento del PDF. No borra compras manuales ni revierte cambios de cierre
y vencimiento. No vuelve a ubicar automáticamente importaciones anteriores:
para corregirlas, deshacer la última y volver a importar en el mes deseado.

Validación del período y duplicados: `yarn test:statements`.

## Tablero de pagos

La pantalla principal abre la vista operativa del mes actual: total, pagado y
pendiente, con filtros de estado y grupos plegables de gastos y tarjetas.
Los vencimientos pendientes aparecen primero dentro de cada grupo. El monto
visible usa el importe real confirmado, o la estimación si todavía está pendiente;
los conceptos sin monto se identifican y los totales se muestran como parciales.

“Confirmar pago” guarda el monto visible en un clic. El lápiz permite ajustarlo
antes de confirmar y “Gestionar pago” permite corregir o desmarcar un pago.
El próximo mes es solo una proyección. La pestaña Histórico / Proyección muestra
los 12 meses del año actual y conserva la gestión de pagos actuales y anteriores.
Las tarjetas a mes vencido mantienen el desplazamiento al período de consumo,
también al pasar de diciembre a enero. Los KPIs no cambian al filtrar la lista.

Validación de cálculos: `yarn test:dashboard`.

## Header general

Las páginas autenticadas comparten un header con logo, título de la ruta actual
y usuario de la sesión (nombre, email y foto). La columna del logo y el menú
usan el mismo ancho de 80 px en escritorio, definido por `--sidebar-width`.
En móvil se conserva el menú inferior y se muestra el avatar con el nombre y
email accesibles; en escritorio también se muestran en texto.

Al volver a iniciar sesión con Google se actualizan el nombre y la foto del
perfil, conservando los permisos del usuario precargado. Las sesiones existentes
muestran los datos guardados hasta el siguiente login. Sin foto, o si no carga,
se muestran las iniciales. Los títulos de página y enlaces del menú se declaran
en `src/lib/navigation.ts`; los encabezados de formularios y paneles específicos
se conservan en el contenido.

Validación de rutas e iniciales: `yarn test:navigation`.

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