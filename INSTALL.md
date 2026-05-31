# Euro Learn & Play — Instalación y desarrollo

Guía para instalar, arrancar y resetear datos del proyecto en entorno local.

## Requisitos

- PHP 8.3+ con extensiones habituales de Laravel
- Composer
- MySQL
- Node.js 24 (usar `nvm use` en la raíz del proyecto; lee `.nvmrc`)

## Instalación (primera vez)

### Backend (Laravel)

```bash
cd backend
composer install
```

Si no existe `backend/.env`:

```bash
cp .env.example .env
php artisan key:generate
```

Configura MySQL en `backend/.env`:

```env
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=learnandplay
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

Crea la base de datos:

```sql
CREATE DATABASE learnandplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecuta migraciones y datos iniciales (4 clusters, 16 preguntas):

```bash
php artisan migrate --seed
```

Jugadores de prueba (**opcional**, no incluidos en `DatabaseSeeder`):

```bash
php artisan db:seed --class=UserSeeder
```

| Usuario   | Email               | Password |
|-----------|---------------------|----------|
| testuser  | testuser@elp.local  | secret1  |
| test2     | test2@elp.local     | secret1  |

Tras un `migrate:fresh --seed`, ejecuta de nuevo `UserSeeder` si quieres recuperar estas cuentas.

### Frontend (Angular)

Desde la raíz del proyecto:

```bash
nvm use
cd frontend
npm install
```

## Arrancar la app (desarrollo)

Usa **dos terminales**.

**Terminal 1 — API (puerto 8000):**

```bash
cd backend
php artisan serve --port=8000
```

**Terminal 2 — Frontend (puerto 4700):**

```bash
nvm use
cd frontend
npm start
```

URLs:

| Servicio  | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:4700        |
| API       | http://localhost:8000/api    |

El frontend apunta a la API en `frontend/src/environments/environment.ts` (`http://localhost:8000/api`).

## Resetear datos

### Reset completo de base de datos

Borra tablas, las recrea y vuelve a cargar clusters y preguntas. **También elimina usuarios y partidas.**

```bash
cd backend
php artisan migrate:fresh --seed
```

Tras este comando hay que volver a registrarse en la app, o ejecutar:

```bash
php artisan db:seed --class=UserSeeder
```

### Borrar solo el progreso de juego (dev)

**Desde la UI:** botón rojo **DEV Reset** (abajo a la derecha). Borra el progreso, cierra sesión y redirige a login.

**Por API** (requiere token Bearer; solo disponible con `APP_ENV=local` o `APP_DEBUG=true`):

```bash
curl -X POST http://localhost:8000/api/game/abandon \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

### Reiniciar tras completar el juego

Desde la pantalla Game Over con el botón **Play again**, o vía `POST /api/game/restart` con usuario autenticado.

## Comandos útiles

```bash
# Crear jugadores de prueba (solo local, manual)
cd backend && php artisan db:seed --class=UserSeeder

# Listar rutas API
cd backend && php artisan route:list --path=api

# Compilar frontend para producción
cd frontend && npm run build

# Limpiar caché Laravel
cd backend && php artisan config:clear && php artisan cache:clear
```

## Notas

- Los jugadores de prueba están en `UserSeeder` y se ejecutan **manualmente** (no forman parte de `migrate --seed`).
- `UserSeeder` solo actúa con `APP_ENV=local`.
- Plan detallado del proyecto: [`docs/plan-euro-learn-play.md`](docs/plan-euro-learn-play.md).
