# ALIADAS

Plataforma web de educación financiera y mentoría para mujeres que comienzan un emprendimiento.
Proyecto final de la ruta Avanzada de Jóvenes creaTIvos: una app full stack con IA personalizada.

- **App publicada:** https://wendychicaiza.github.io/aliadas/
- **Contacto:** wendyestefi1999@gmail.com

> ALIADAS es una iniciativa en desarrollo. Hoy ofrece educación y herramientas de gestión; la visión futura es evolucionar hacia un modelo de acceso a financiamiento justo. Todavía no otorga créditos.

## ¿Qué hace?

| Función | Descripción |
| --- | --- |
| Página de inicio | Marca propia, propuesta de valor y calculadora de ganancia. |
| Catálogo público | Cursos y mentoras, leídos desde MongoDB. |
| Cuentas de usuarias | Registro e ingreso; la contraseña se guarda cifrada. |
| Mis finanzas | Registro de ingresos y gastos (emprendimiento o personales), dashboard e historial. |
| Academia | Inscripción a cursos. |
| Formulario de contacto | Guarda los mensajes en la base de datos. |
| Panel de administradora | Login privado: ver mensajes, usuarias y sus cursos; crear, editar y borrar cursos y mentoras. |
| Chatbot con IA | Asistente que conoce los cursos y mentoras y habla con el tono de ALIADAS (Gemini). |

## Tecnologías

- **Frontend:** React 18 + Vite (carpeta `src/`), publicado en GitHub Pages.
- **Backend:** Node.js + Express (carpeta `backend/`), publicado en Render.
- **Base de datos:** MongoDB Atlas con Mongoose.
- **IA:** API de Google Gemini, llamada solo desde el backend.

## Estructura

```
aliadas/
├── src/                  Frontend (React)
│   ├── components/       Componentes reutilizables y pantallas
│   ├── api.js            Dirección del backend y función para pedir datos
│   └── sesion.js         Sesión de la usuaria en el navegador
├── public/               Logo y datos de ejemplo
├── backend/              Servidor (Express)
│   ├── server.js         Rutas de la API, login, chatbot
│   ├── models.js         Esquemas de MongoDB (Mongoose)
│   └── .env.example      Variables necesarias (plantilla)
└── .github/workflows/    Publicación automática en GitHub Pages
```

El frontend y el backend están separados: el frontend solo habla con el backend por HTTP, y las llaves secretas viven únicamente en el backend.

## Cómo correrlo en tu computador

Necesitas Node.js 18 o superior.

1. Instala dependencias, una vez en la raíz y otra en `backend`:
   ```
   npm install
   cd backend
   npm install
   ```
2. Crea el archivo `backend/.env` copiando `backend/.env.example` y llena tus valores (ver más abajo). **Nunca lo subas a GitHub.**
3. Abre dos terminales:
   - Terminal 1, dentro de `backend`: `npm start` (puerto 3001)
   - Terminal 2, en la raíz: `npm run dev` (puerto 5173)
4. Abre `http://localhost:5173`.

Para revisar que el backend esté bien configurado: `http://localhost:3001/api/diagnostico`.

## Variables de entorno (`backend/.env`)

| Variable | Para qué sirve |
| --- | --- |
| `GEMINI_API_KEY` | Llave de Google AI Studio para el chatbot. |
| `GEMINI_MODEL` | Modelo preferido de Gemini (el backend prueba otros si falla). |
| `PORT` | Puerto del servidor (por defecto 3001). |
| `MONGODB_URI` | Dirección de conexión de MongoDB Atlas. |
| `ADMIN_EMAIL` | Correo de la administradora. |
| `ADMIN_PASSWORD` | Contraseña de la administradora. |
| `ADMIN_SECRET` | Texto largo y secreto para firmar las sesiones. |

Sin `MONGODB_URI`, el backend arranca con los cursos y mentoras de ejemplo de `public/`, pero el contacto, las cuentas y el panel necesitan la base de datos.

## API

Públicas:
- `GET /api/cursos`, `GET /api/mentoras`
- `POST /api/contacto`
- `POST /api/chat`
- `POST /api/usuarias/registro`, `POST /api/usuarias/ingreso`
- `GET /api/salud`, `GET /api/diagnostico`

Con sesión de usuaria: `GET/POST /api/movimientos`, `GET/POST /api/inscripciones`, `DELETE /api/inscripciones/:curso`.

Con sesión de administradora: `POST /api/admin/login`, `GET /api/admin/contactos`, `GET /api/admin/usuarias`, y crear, editar y borrar en `/api/cursos` y `/api/mentoras`.

Códigos usados: 200, 201 (creado), 400 (datos inválidos), 401 (sin sesión), 404 (no encontrado), 409 (correo repetido), 429 (muchas consultas a la IA), 500 (error del servidor), 503 (base de datos no conectada).

## Seguridad

- Las contraseñas de las usuarias se guardan con `scrypt` y una sal aleatoria; nunca en texto plano.
- Las sesiones son tokens firmados con vencimiento (2 horas la administradora, 30 días las usuarias).
- Cada usuaria solo accede a sus propios movimientos e inscripciones: el backend toma su identidad del token, no de lo que envía el navegador.
- Las llaves (Gemini, MongoDB, administradora) solo existen en `backend/.env` y en las variables de entorno del servidor.

## Publicación

- **Frontend:** al hacer push a `main`, GitHub Actions construye la app y la publica en GitHub Pages. La dirección del backend se define con la variable de repositorio `VITE_API_URL`.
- **Backend:** servicio web en Render con directorio raíz `backend`, comando de construcción `npm install` y de inicio `npm start`. Las variables de entorno se configuran en el panel de Render.

El plan gratuito de Render duerme el servidor tras un rato sin uso; la primera visita puede tardar hasta un minuto en despertarlo.
