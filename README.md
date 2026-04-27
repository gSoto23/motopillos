# Motopillos E-Commerce Platform 🏍️🔥

Motopillos es una plataforma web de alto rendimiento orientada a la localización e importación de repuestos genuinos (OEM) de las principales marcas mundiales de motocicletas. La arquitectura está diseñada para sostener millones de registros tabulares y facilitar búsquedas instantáneas de diagramas explosivos.

## 🏗️ Pila Tecnológica (Next Generation)

Esta aplicación fue migrada enteramente hacia una infraestructura de grado corporativo:

- **Frontend / Backend-End (SSR)**: Next.js 16.2.0 (App Router + Turbopack).
- **Base de Datos Principal**: PostgreSQL 18.3 en Amazon Web Services (AWS RDS / Lightsail).
- **Motor ORM**: Prisma Client (`provider = "postgresql"`).
- **Almacenamiento Multimedia**: Amazon S3 (`bucket-motopillos`) - Hospedaje de más de 290,000 imágenes de diagramas técnicos con endpoints públicos CDN.

## 📊 Dimensiones de Datos Activos
La base de datos en estado de producción alberga un ecosistema colosal e interconectado:
- **5,011** Vehículos únicos indexados.
- **202,190** Repuestos (SKUs únicos) registrados.
- **295,384** Categorías/Diagramas técnicos aislados.
- **6,586,025** Nodos de pivote: Conexiones transaccionales absolutas (`category_products`) que entrelazan los modelos, diagramas y referencias universales.

## 🛠️ Flujo de Operación de Extracción (Scrapers)
El repositorio conserva en su formato original la carpeta `/scraper/` utilizada originariamente para la ingesta Big Data desde proveedores norteamericanos. Actualmente operan en Python puro bajo arquitecturas de SQLite persistente y concurrencia. No interfiere con el servidor Next.js y funge de código fuente para futuras re-indexaciones de catálogo.

## 🛍️ Roadmap: Facturación y Checkout (Fase E2E)
Para las futuras iteraciones de equipo de desarrollo, el embudo E2E comercial está diseñado de la siguiente manera:

1. **Cart Context API**: Opera persitentemente en `localStorage` transformando dólares a colones en tiempo real mediante el multiplicador centralizado de la Base de Datos (`AdminConfig`).
2. **Checkout (Logística)**: Proceso final para confirmar las direcciones de recolección (Mensajería o Recolección).
3. **Módulo Transaccional Principal**: Integrado vía **Tilopay** Gateway.
4. **Validación Automática**: Emisión paralela de recibos por correo electrónico transaccional y derivación al WhatsApp de importación para consolidación del pago o verificaciones de pedido.

## 🚀 Despliegue (Production Next.js)
Dado el peso de los diagramas, los mismos residen puramente en Amazon S3. 
Para ejecutar un clon local asegurate siempre de tener disponible en tu `.env` las llaves del `DATABASE_URL` y las credenciales del `S3_BUCKET_NAME`. Un simple `npx prisma generate && npm run dev` encenderá el motor web.
