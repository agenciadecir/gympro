# 🚀 Guía Completa de Despliegue - GymPro

## 📋 Índice
1. [¿Qué es cada servicio?](#qué-es-cada-servicio)
2. [Paso 1: Crear cuenta en GitHub](#paso-1-crear-cuenta-en-github)
3. [Paso 2: Subir tu código a GitHub](#paso-2-subir-tu-código-a-github)
4. [Paso 3: Crear base de datos en Turso](#paso-3-crear-base-de-datos-en-turso)
5. [Paso 4: Desplegar en Vercel](#paso-4-desplegar-en-vercel)
6. [Paso 5: Configurar variables de entorno](#paso-5-configurar-variables-de-entorno)
7. [Paso 6: ¡Listo!](#paso-6-listo)

---

## ¿Qué es cada servicio?

### 🐙 GitHub
Es como un "almacenamiento en la nube" para tu código. Imagina que es como Google Drive pero especializado para programadores. Guarda tu código y permite que Vercel lo descargue automáticamente.

### 🗄️ Turso
Es una base de datos en la nube gratuita. Tu aplicación necesita guardar información (usuarios, rutinas, dietas) y Turso te da ese espacio de forma gratuita.

### ▲ Vercel
Es el servidor donde tu aplicación "vive". Cuando alguien entra a tu web, Vercel sirve tu aplicación. Es gratuito y muy fácil de configurar.

---

## Paso 1: Crear cuenta en GitHub

1. Ve a **https://github.com**
2. Haz clic en **"Sign up"** (registrarse) en la esquina superior derecha
3. Ingresa tu email
4. Crea una contraseña
5. Elige un nombre de usuario (ejemplo: `tu-nombre-gympro`)
6. Completa el captcha y verification
7. Selecciona el plan **"Free"** (gratuito)
8. Verifica tu email

**✅ Listo! Ya tienes cuenta en GitHub**

---

## Paso 2: Subir tu código a GitHub

### 2.1 Crear un nuevo repositorio

1. En GitHub, haz clic en el **signo +** (arriba a la derecha)
2. Selecciona **"New repository"**
3. Nombra tu repositorio: `gympro`
4. Asegúrate que esté en **"Public"** (público) - necesario para el plan gratuito de Vercel
5. **NO** marques "Add a README file" (ya tenemos código)
6. Haz clic en **"Create repository"**

### 2.2 Descargar tu código del sandbox actual

Antes de subir a GitHub, necesitas descargar tu código:

1. En este sandbox, busca la opción para **descargar archivos** o **exportar proyecto**
2. Descarga todo el proyecto como un archivo ZIP
3. Descomprime el ZIP en tu computadora

### 2.3 Instalar Git en tu computadora (si no lo tienes)

**Windows:**
1. Ve a https://git-scm.com/download/win
2. Descarga el instalador
3. Ejecuta el instalador (sigue las opciones por defecto)

**Mac:**
Abre Terminal y escribe:
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install git
```

### 2.4 Subir tu código a GitHub

Abre una terminal (o Git Bash en Windows) en la carpeta donde descomprimiste tu proyecto:

```bash
# 1. Inicializar Git (solo la primera vez)
git init

# 2. Configurar tu nombre y email (solo la primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# 3. Agregar todos los archivos
git add .

# 4. Crear tu primer "commit" (guardar los cambios)
git commit -m "Mi primera versión de GymPro"

# 5. Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU-USUARIO/gympro.git

# 6. Subir el código
git branch -M main
git push -u origin main
```

**Si te pide credenciales:**
- Usa tu nombre de usuario de GitHub
- Para la contraseña, necesitas crear un "Personal Access Token":
  1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. "Generate new token (classic)"
  3. Dale un nombre y marca "repo"
  4. Copia el token generado (¡guárdalo!)
  5. Úsalo como contraseña

**✅ Listo! Tu código está en GitHub**

---

## Paso 3: Crear base de datos en Turso

### 3.1 Crear cuenta en Turso

1. Ve a **https://turso.tech**
2. Haz clic en **"Start Free"** o **"Sign Up"**
3. Puedes registrarte con GitHub (más fácil) o con email
4. Completa el proceso de registro

### 3.2 Crear tu base de datos

1. Una vez dentro, haz clic en **"Create Database"**
2. Nombra tu base de datos: `gympro-db`
3. Selecciona la región más cercana a ti
4. Haz clic en **"Create"**

### 3.3 Obtener las credenciales

1. En tu base de datos, ve a **"Settings"** o **"Connect"**
2. Busca y copia estos valores:

   **DATABASE_URL (URL de la base de datos):**
   - Se ve como: `libsql://tu-base-de-datos-usuario.turso.io`

3. Ve a **"API Tokens"** en el menú lateral
4. Haz clic en **"Create Token"**
5. Nombra el token: `gympro-token`
6. Copia el token generado

**Guarda estos dos valores, los necesitarás:**
- `DATABASE_URL`: La URL de tu base de datos
- `TURSO_AUTH_TOKEN`: El token que acabas de crear

**✅ Listo! Ya tienes tu base de datos en Turso**

---

## Paso 4: Desplegar en Vercel

### 4.1 Crear cuenta en Vercel

1. Ve a **https://vercel.com**
2. Haz clic en **"Sign Up"**
3. **IMPORTANTE:** Regístrate con tu cuenta de GitHub (elige "Continue with GitHub")
4. Autoriza a Vercel para acceder a tu GitHub

### 4.2 Importar tu proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Verás una lista de tus repositorios de GitHub
3. Busca `gympro` y haz clic en **"Import"**

### 4.3 Configurar el proyecto

1. **Framework Preset:** Vercel debería detectar automáticamente "Next.js"
2. **Root Directory:** `./` (dejar como está)
3. **Build Command:** `prisma generate && next build` (puedes dejar el default)
4. **Output Directory:** `.next` (dejar como está)

**⚠️ IMPORTANTE:** NO hagas clic en Deploy todavía, necesitamos configurar las variables de entorno primero.

---

## Paso 5: Configurar variables de entorno

### 5.1 En la pantalla de configuración de Vercel

1. Busca la sección **"Environment Variables"**
2. Agrega las siguientes variables una por una:

| Nombre | Valor | Entorno |
|--------|-------|---------|
| `DATABASE_URL` | `libsql://tu-db.turso.io` | Production, Preview, Development |
| `TURSO_AUTH_TOKEN` | `tu-token-de-turso` | Production, Preview, Development |
| `JWT_SECRET` | (genera uno aleatorio, ejemplo abajo) | Production, Preview, Development |

### 5.2 Generar JWT_SECRET

El JWT_SECRET es una clave secreta para cifrar las sesiones. Puedes generarlo aquí:

**Opción A - Usando un generador online:**
- Ve a https://www.uuidgenerator.net y copia un UUID

**Opción B - En tu computadora (Mac/Linux):**
```bash
openssl rand -base64 32
```

**Opción C - En tu computadora (Windows PowerShell):**
```powershell
[Convert]::ToBase64String((1..32|%{Get-Random -Maximum 256}))
```

Copia el resultado como valor de `JWT_SECRET`.

### 5.3 Ejemplo de cómo se ve:

```
DATABASE_URL = libsql://gympro-db-miusuario.turso.io
TURSO_AUTH_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 5.4 Finalizar el despliegue

1. Una vez agregadas las 3 variables, haz clic en **"Deploy"**
2. Espera unos minutos mientras Vercel compila y despliega tu aplicación
3. Cuando termine, verás un mensaje de éxito con confeti 🎉

---

## Paso 6: ¡Listo!

### 6.1 Tu URL

Vercel te dará una URL como:
```
https://gympro-tu-usuario.vercel.app
```

¡Esa es tu aplicación funcionando en internet!

### 6.2 Dominio personalizado (opcional)

Si quieres un dominio propio como `migimnasio.com`:

1. En Vercel, ve a tu proyecto → **Settings** → **Domains**
2. Agrega tu dominio
3. Configura los DNS en tu proveedor de dominio

### 6.3 Actualizaciones futuras

Cada vez que hagas cambios en tu código:

```bash
# En tu computadora, en la carpeta del proyecto
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel automáticamente detectará los cambios y volverá a desplegar.

---

## 🔧 Solución de problemas comunes

### Error: "Prisma Client could not be generated"

**Solución:** Agrega un script en `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Error: "Database connection failed"

**Solución:** Verifica que:
1. La URL de Turso sea correcta
2. El token de Turso sea válido
3. Las variables de entorno estén bien configuradas en Vercel

### Error: "JWT_SECRET is not defined"

**Solución:** Asegúrate de haber agregado `JWT_SECRET` en las variables de entorno de Vercel.

---

## 📞 ¿Necesitas ayuda?

Si tienes algún problema:
1. Revisa los logs en Vercel (Project → Deployments → clic en el deployment → "Function Logs")
2. Verifica que todas las variables de entorno estén correctas
3. Asegúrate que el código se subió completo a GitHub

---

## 📝 Resumen de lo que necesitas:

| Servicio | Qué obtienes | Para qué sirve |
|----------|-------------|----------------|
| GitHub | Repositorio `gympro` | Almacenar tu código |
| Turso | URL + Token | Base de datos en la nube |
| Vercel | URL de tu app | Servidor donde vive tu app |

**¡Buena suerte con tu despliegue! 🚀**
