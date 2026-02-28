# Deploy en VPS/Hosting con Node.js

## Requisitos del Servidor
- Ubuntu 20.04+ o similar
- Node.js 20+
- 1GB RAM mínimo (2GB recomendado)
- Puerto 3000 disponible

## Pasos de Instalación

### 1. Conectar al servidor via SSH
```bash
ssh usuario@tu-servidor.com
```

### 2. Instalar Node.js (si no está instalado)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g bun pm2
```

### 3. Crear directorio para la app
```bash
sudo mkdir -p /var/www/gympro
sudo chown $USER:$USER /var/www/gympro
cd /var/www/gympro
```

### 4. Subir los archivos
Opción A - Con Git:
```bash
git clone tu-repo.git .
```

Opción B - Con SCP desde tu PC:
```bash
# En tu PC local, comprimir y subir
cd /home/z/my-project
tar -czvf gympro.tar.gz --exclude='node_modules' --exclude='.next' .
scp gympro.tar.gz usuario@tu-servidor.com:/var/www/gympro/

# En el servidor
cd /var/www/gympro
tar -xzvf gympro.tar.gz
```

### 5. Instalar dependencias y construir
```bash
bun install
bun run build
```

### 6. Configurar base de datos
```bash
bun run db:push
```

### 7. Crear el primer admin
```bash
bun run scripts/make-admin.ts
```

### 8. Iniciar con PM2
```bash
pm2 start npm --name "gympro" -- start
pm2 save
pm2 startup
```

### 9. Configurar Nginx (proxy reverso)
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/gympro
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/gympro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Configurar SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

## Variables de Entorno

Crear archivo `.env` en el servidor:
```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="tu-clave-secreta-muy-larga-y-segura"
NEXTAUTH_URL="https://tudominio.com"
```

## Comandos Útiles

```bash
# Ver logs
pm2 logs gympro

# Reiniciar app
pm2 restart gympro

# Ver estado
pm2 status

# Actualizar app
cd /var/www/gympro
git pull  # si usas git
bun install
bun run build
pm2 restart gympro
```

## Backup de Base de Datos

```bash
# Crear backup
cp /var/www/gympro/db/custom.db /var/www/backups/gympro-$(date +%Y%m%d).db

# Programar backup diario
crontab -e
# Agregar:
0 2 * * * cp /var/www/gympro/db/custom.db /var/www/backups/gympro-$(date +\%Y\%m\%d).db
```
