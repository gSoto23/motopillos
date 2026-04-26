# Documentación del Scraper (Partzilla) para Motopillos

Este directorio contiene el motor de extracción de datos desarrollado para generar el catálogo maestro de Motopillos extrayendo jerarquías completas desde Partzilla.

## 🛠 Arquitectura Principal

El sistema está diseñado para evadir bloqueos de Firewalls (como Cloudflare) utilizando `curl_cffi` bajo la firma criptográfica humana (`impersonate="chrome120"`). La información interna no se raspa mediante HTML tradicional, sino desencriptando los estados embebidos estáticos de Next.js (`__NEXT_DATA__` u objetos `self.__next_f.push`), garantizando **100% de precisión y cero alucinación de datos**.

---

## 📂 Archivos Esenciales

1. **`master_scraper.py`**
   - Recibe una lista de URLs base de "Vehículos por Año" (ej. Honda Motorcycle 2011).
   - Genera dinámicamente un mapa de carpetas hasta la capa 2 (`datos_extraidos/[Brand]/[Machine]/[Year]/[Model]/categorias_[model].json`).
   - Evita descargas redundantes si el archivo JSON ya existe.

2. **`scrape_products.py`**
   - El extractor nativo de productos finales. Toma la URL de una categoría específica, mapea al catálogo final y abstrae variables críticas como la **indisponibilidad de inventario (`isSellable`)** marcándolas como `"out stock"`. 
   - Aplica validadores lógicos como `max(prices)` para asegurar capturar el MSRP original histórico por encima de precios tachados.

3. **`process_model_products.py`**
   - Iterador puente. Lee directamente un archivo `categorias_XXX.json` y ejecuta internamente a `scrape_products.py` en bucle respetando las velocidades permitidas por Partzilla.

4. **`mega_launcher.py`**
   - Orquestador asíncrono superior. Escanea el disco duro entero (`os.walk`), localiza absolutamente cualquier manifiesto de categoría faltante por completar y reanuda descargas masivas en segundo plano. Es un programa idólatra e ininterrumpible.

5. **`download_diagrams.py`**
   - Rastreador de binarios. Lee el directorio entero de `productos_*.json` descubiertos y descarga orgánicamente los archivos de imagen pura (`.png`) de los Servidores CDN directamente a tu disco local para evitar dependencia eterna de conectividad externa con Partzilla.

---

## 🚀 Flujo para el Futuro: Actualizaciones y Mantenimiento

### 1. ¿Cómo agregar "Nuevos Modelos" (Ej: Sale el Año 2027)?
Si Partzilla lanza motos en 2027, la carga es trivial y aprovecha la misma estructura local.
1. Edita el archivo `master_scraper.py` y agrega la URL que deseas en la matriz de la parte superior (Ej: `"https://www.partzilla.com/catalog/honda/motorcycle/2027"`).
2. Ejecuta `python3 master_scraper.py`. (Verás cómo se genera la carpeta del año 2027 y sus modelos).
3. A continuación, ejecuta `python3 mega_launcher.py`. (Escuchará que existen nuevos modelos a los cuales les faltan productos, visitará Partzilla y bajará todo el 2027 completo en minutos a tu disco duro).
4. Pasa ese nuevo bloque por tu inyector de base de datos local hacia Prisma.

### 2. Sincronización de Precios Futuros
**CRÍTICO:** Los directorios masivos de `datos_extraidos/` funcionan EXCLUSIVAMENTE para poblar la base principal de PostgreSQL en AWS por primera vez (El Big-Bang o "Carga Inicial"). 

Para actualizar precios el año siguiente, **NO** debes vaciar esta estructura de JSON a tu PC otra vez.
El flujo recomendado para Motopillos será usar **Prisma**:
1. Tu base de datos relacional (PosgreSQL) ya poseerá las tablas `Make`, `VehicleModel`, `ComponentAssembly` y `Part`.
2. Como se inyectó la URL del catálogo durante el 'Seeding' inicial al campo `ComponentAssembly`, se programará un simple `cron-job` en Typescript (un script llamado `sync_precios.ts`).
3. El script leerá PostgreSQL línea por línea, pedirá la página web con las mismas cabeceras ocultas (`curl_cffi`), comparará dinámicamente en Memoria RAM el precio viejo con el nuevo, y hará un `UPDATE` en la tabla SQL instantáneamente si detecta cambios. 

### 3. Descarga de Nuevos Diagramas
Siempre puedes ejecutar en la terminal local:
`python3 scraper/download_diagrams.py`
Para forzar a tu computadora a barrer las carpetas locales. Si descubre algún manifiesto JSON nuevo donde aún no exista la imagen físicamente guardada, aislará la solicitud de descarga y reparará la foto en el acto silenciosamente.
