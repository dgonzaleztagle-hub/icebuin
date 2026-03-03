# Vercel Postgres Setup Guide

## Overview

Este proyecto usa **Vercel Postgres** (Neon provider) como base de datos para almacenar productos.

## Inicialización de la Base de Datos

### Opción 1: API Endpoint (Recomendado)

Una vez deployado en Vercel, ejecuta el siguiente curl desde tu terminal:

```bash
curl -X POST https://icebuin.vercel.app/api/init-db \
  -H "Authorization: Bearer YOUR_INIT_TOKEN" \
  -H "Content-Type: application/json"
```

**Pasos:**
1. Ve al Dashboard de Vercel → Proyecto "icebuin" → Settings → Environment Variables
2. Crea una variable `INIT_TOKEN` con un valor seguro (ej: "your-secure-token")
3. Usa el comando curl anterior, reemplazando `YOUR_INIT_TOKEN` con el valor

### Opción 2: Neon Dashboard (Manual)

1. Ve a [Neon Console](https://console.neon.tech/)
2. Selecciona el proyecto "icebuin"
3. Ve a "SQL Editor"
4. Copia y pega el SQL del archivo `scripts/init-db.sql`
5. Ejecuta

## Schema de la Tabla

```sql
CREATE TABLE products (
  sku VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  precioUnit DECIMAL(10, 2),
  precioMayor DECIMAL(10, 2),
  umbralMayor INT,
  favorito BOOLEAN DEFAULT false,
  superfavorito BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categoria ON products(categoria);
CREATE INDEX idx_visible ON products(visible);
```

## API Endpoints

### GET /api/products
Obtiene todos los productos.

```bash
curl https://icebuin.vercel.app/api/products
```

**Respuesta:**
```json
[
  {
    "sku": "00001",
    "nombre": "Helado Vainilla",
    "categoria": "helados",
    "precioUnit": 3500,
    "precioMayor": 3000,
    "umbralMayor": 12,
    "favorito": true,
    "superfavorito": false,
    "visible": true
  }
]
```

### POST /api/products
Carga productos en bulk (reemplaza todos los existentes).

```bash
curl -X POST https://icebuin.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '[
    {
      "sku": "00001",
      "nombre": "Helado Vainilla",
      "categoria": "helados",
      "precioUnit": 3500,
      "precioMayor": 3000,
      "umbralMayor": 12,
      "favorito": true,
      "superfavorito": false,
      "visible": true
    }
  ]'
```

### PUT /api/products
Actualiza un producto existente.

```bash
curl -X PUT https://icebuin.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "00001",
    "nombre": "Helado Chocolate",
    "favorito": false
  }'
```

### DELETE /api/products?sku=00001
Elimina un producto.

```bash
curl -X DELETE "https://icebuin.vercel.app/api/products?sku=00001"
```

## Uso en la Aplicación

### HomePage
Carga productos automáticamente en este orden:
1. API (`GET /api/products`)
2. Fallback a `localStorage` (si existe)
3. Fallback final a `mockProducts`

### AdminPage
Al subir un Excel con productos:
1. Envía `POST /api/products` con el contenido
2. Guarda también en `localStorage` como backup
3. Si la API falla, al menos queda el backup en localStorage

## Troubleshooting

### "Error de conexión a la base de datos"
- Verifica que `STORAGE_URL` está configurado en Variables de Entorno de Vercel
- Asegúrate de que la tabla existe ejecutando el endpoint `/api/init-db`

### "No se cargan los productos"
- Verifica el navegador → Developer Tools → Network → `/api/products`
- Si falla, revisa que la tabla esté creada en Neon Dashboard

### "Los cambios no se guardan"
- El formulario AdminPage guarda en la API y también en localStorage
- Si ves que funciona localmente pero no en Vercel, revisa los logs de Vercel

## Variables de Entorno Necesarias

Estas las configura Vercel automáticamente:
- `STORAGE_URL` - Connection string de Neon (auto-configurado)

Opcionales:
- `INIT_TOKEN` - Token para proteger el endpoint `/api/init-db`

## Notas

- La base de datos está en modo FREE (0.5GB)
- Suficiente para ~10,000 productos
- Los índices en `categoria` y `visible` optimizan las búsquedas
- Todos los datos se replican en localStorage como fallback
