# Despliegue — Euro Learn & Play

Frontend en la **raíz del dominio**. API Laravel en **`/backend/api`**, con el código Laravel **fuera del webroot**.

Dominio de ejemplo: `https://ecebgamapp.midominio.com`

---

## Qué va dónde

| Ubicación | Contenido |
|-----------|-----------|
| **FUERA de `www`** (`public_html`) | Laravel completo: `app/`, `.env`, `storage/`, `vendor/`, etc. |
| **DENTRO de `www`** (raíz) | Build de Angular: `index.html`, `.js`, `.css`, `img/` |
| **DENTRO de `www/backend/`** | Solo `index.php` y `.htaccess` de Laravel (`public/`) |

---

## Estructura en el servidor

```
/home/tuusuario/
│
├── euro-api/                        ← FUERA del www (NO accesible por URL)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   ├── artisan
│   └── public/
│       ├── index.php
│       └── .htaccess
│
└── public_html/                     ← www (webroot)
    ├── index.html                   ← Angular
    ├── main-xxxxx.js
    ├── styles-xxxxx.css
    ├── img/
    ├── favicon.ico
    └── backend/                     ← puerta de entrada a Laravel
        ├── index.php
        └── .htaccess
```

---

## Paso 1 — Frontend (en tu PC)

### 1.1 URL de la API

Archivo: `frontend/src/environments/environment.prod.ts`

```ts
export const environment = {
    production: true,
    apiUrl: '/backend/api',
};
```

### 1.2 Compilar

```bash
cd frontend
nvm use
npm ci
npx ng build --configuration production
```

### 1.3 Subir a `www`

Sube **todo** el contenido de:

```
www/
```

(en la raíz del repo, generado por el build de producción)

→ a la **raíz** de `public_html/`.

---

## Paso 2 — Backend fuera del www

### 2.1 Subir Laravel

Sube la carpeta `euro-api/` del proyecto a:

```
/home/tuusuario/euro-api/
```

**No** subas esta carpeta dentro de `public_html/`.

### 2.2 Configurar `.env`

Archivo: `/home/tuusuario/euro-api/.env`

```env
APP_NAME="Euro Learn & Play"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ecebgamapp.midominio.com/backend

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=learnandplay
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password

# URL del frontend (enlaces de reset de contraseña). Sin barra final.
FRONTEND_URL=https://ecebgamapp.midominio.com

# SMTP del hosting (necesario para verificación de email y reset de contraseña)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"
```

### 2.3 Instalar dependencias y migrar

Si **`composer` no está disponible** en el servidor (comando no encontrado), basta con dejar el archivo **`composer.phar`** dentro de la carpeta `euro-api/` y ejecutarlo con PHP.

**Descargar `composer.phar` desde consola** (en tu PC o por SSH, dentro de `euro-api/`):

```bash
cd /home/tuusuario/euro-api

# Opción A — instalador oficial (recomendado)
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
# Genera composer.phar en la carpeta actual

# Opción B — descarga directa con curl
curl -sS https://getcomposer.org/installer | php

# Opción C — descarga directa del .phar (sin instalador)
curl -sS -o composer.phar https://getcomposer.org/download/latest-stable/composer.phar
```

Comprueba que funciona:

```bash
php composer.phar --version
```

Luego instala dependencias y migra:

```bash
cd /home/tuusuario/euro-api
php composer.phar install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
chmod -R 775 storage bootstrap/cache
```

Si subes el archivo por FTP en lugar de descargarlo en el servidor, colócalo en `/home/tuusuario/euro-api/composer.phar` (misma carpeta que `artisan`).

Si `composer` sí está instalado globalmente:

```bash
cd /home/tuusuario/euro-api
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
chmod -R 775 storage bootstrap/cache
```

---

## Paso 3 — Enlazar `/backend` con Laravel (fuera del www)

El navegador llama a `https://tudominio.com/backend/api/...`.  
Eso debe llegar a `euro-api/public/index.php`, **sin** exponer `.env` ni `storage/`.

### Opción A — Symlink (recomendado, requiere SSH)

```bash
cd /home/tuusuario/public_html
rm -rf backend
ln -s ../euro-api/public backend
```

No hace falta tocar `index.php`: las rutas `../vendor`, `../bootstrap`, etc. siguen siendo correctas.

### Opción B — Solo FTP (copiar y editar `index.php`)

1. Copia `euro-api/public/index.php` y `.htaccess` → `public_html/backend/`
2. Sustituye el contenido de `public_html/backend/index.php` por:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Ruta a Laravel FUERA del www (carpeta hermana de public_html)
$laravel = dirname(__DIR__) . '/euro-api';

if (file_exists($maintenance = $laravel.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $laravel.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $laravel.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
```

> Si tu carpeta Laravel no se llama `euro-api` o no está al mismo nivel que `public_html`, ajusta la ruta en `$laravel`.

---

## Paso 4 — Regla SPA en la raíz

El build incluye `frontend/public/.htaccess` → se copia a `www/` al compilar.  
Si al **recargar** `/login`, `/reset-password` o `/clusters` aparece **404**, comprueba que ese `.htaccess` está en la raíz de `public_html/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    RewriteRule ^backend - [L]

    RewriteRule ^ index.html [L]
</IfModule>
```

Sirve `index.html` para las rutas de Angular. No afecta a `/backend`.

**Local con `ng serve`:** no hace falta `.htaccess`; el dev server ya redirige rutas.  
**Local sirviendo `www/` con otro servidor:** usa modo SPA (p. ej. `npx serve www -s`).

---

## Paso 5 — Comprobar

| Prueba | URL |
|--------|-----|
| App carga | `https://ecebgamapp.midominio.com/` |
| API responde | `https://ecebgamapp.midominio.com/backend/api/clusters` (401 sin token = OK) |
| Login | Registro/login desde la app |

---

## Resumen

1. `apiUrl: '/backend/api'` → `ng build` → subir build a `public_html/`
2. Subir Laravel a `euro-api/` **fuera** de `public_html/`
3. `.env`, `composer install`, `migrate`, `config:cache`
4. Symlink `public_html/backend` → `../euro-api/public` (o copiar `index.php` editado)
5. Probar app y login

---

## Qué NO subir

| No subir a `public_html/` | Motivo |
|---------------------------|--------|
| `euro-api/` completo | Debe quedar fuera del www |
| `node_modules/`, `SRC/` | Solo desarrollo |
| `.env` de tu PC | Crear uno nuevo en el servidor |
| Código fuente `frontend/` | Solo el build compilado |

---

## Actualizar la app

**Frontend:** nuevo build → subir contenido de `www/` a `public_html/`.

**Backend:** subir cambios a `euro-api/` → en el servidor:

```bash
cd /home/tuusuario/euro-api
composer install --no-dev
# o, si no hay composer global: php composer.phar install --no-dev
php artisan migrate --force
php artisan config:cache
```

---

## URLs

| Qué | URL |
|-----|-----|
| App | `https://ecebgamapp.midominio.com/` |
| Rutas Angular | `/login`, `/clusters`, etc. |
| API | `https://ecebgamapp.midominio.com/backend/api/...` |

Mismo dominio → no hace falta CORS especial.

---

## Documentación relacionada

- Instalación local: [`INSTALL.md`](INSTALL.md)
- Plan del proyecto: [`docs/plan-euro-learn-play.md`](docs/plan-euro-learn-play.md)
