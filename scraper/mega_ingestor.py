import os
import json
import sqlite3
import time
from glob import glob

DB_PATH = '/Users/gsoto/Desktop/motopillos/motopillos_catalog.db'
BASE_DIR = '/Users/gsoto/Desktop/motopillos/datos_extraidos'

def get_or_create_brand(cursor, cache, brand_name):
    if brand_name in cache:
        return cache[brand_name]
    cursor.execute('INSERT OR IGNORE INTO brands (name) VALUES (?)', (brand_name,))
    cursor.execute('SELECT id FROM brands WHERE name = ?', (brand_name,))
    brand_id = cursor.fetchone()[0]
    cache[brand_name] = brand_id
    return brand_id

def get_or_create_vehicle(cursor, cache, brand_id, year, model_name, slug):
    key = (brand_id, year, model_name)
    if key in cache:
        return cache[key]
    cursor.execute('''
        INSERT OR IGNORE INTO vehicles (brand_id, year, model_name, slug) 
        VALUES (?, ?, ?, ?)
    ''', (brand_id, year, model_name, slug))
    cursor.execute('SELECT id FROM vehicles WHERE brand_id = ? AND year = ? AND model_name = ?', (brand_id, year, model_name))
    vehicle_id = cursor.fetchone()[0]
    cache[key] = vehicle_id
    return vehicle_id

def get_or_create_category(cursor, cache, vehicle_id, cat_name, slug, img_path, orig_url):
    key = (vehicle_id, slug)
    if key in cache:
        return cache[key]
    cursor.execute('''
        INSERT OR IGNORE INTO categories (vehicle_id, name, slug, diagram_image_path, original_diagram_url) 
        VALUES (?, ?, ?, ?, ?)
    ''', (vehicle_id, cat_name, slug, img_path, orig_url))
    cursor.execute('SELECT id FROM categories WHERE vehicle_id = ? AND slug = ?', (vehicle_id, slug))
    cat_id = cursor.fetchone()[0]
    cache[key] = cat_id
    return cat_id

def parse_price(price_str):
    if not price_str or "out" in str(price_str).lower():
        return None
    try:
        # Strip currency symbols if any, though usually it's just a float in the JSON
        if isinstance(price_str, str):
            price_str = price_str.replace('$', '').replace(',', '')
        return float(price_str)
    except:
        return None

def main():
    print("=== INICIANDO MEGA-INGESTA DE BASE DE DATOS ===")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('PRAGMA synchronous = OFF;')
    cursor.execute('PRAGMA journal_mode = MEMORY;')
    
    brand_cache = {}
    vehicle_cache = {}
    category_cache = {}

    print("Buscando todos los archivos de productos...")
    files = glob(os.path.join(BASE_DIR, "**", "productos_*.json"), recursive=True)
    total_files = len(files)
    print(f"Archivos encontrados: {total_files}")

    start_time = time.time()
    
    products_batch = []
    category_products_batch = []
    BATCH_SIZE = 10000

    count = 0
    for file_path in files:
        count += 1
        
        # /Users/gsoto/Desktop/motopillos/datos_extraidos/honda/motorcycle/2010/cbr600ra-ac/productos_abs.json
        parts = file_path.replace(BASE_DIR, '').strip('/').split('/')
        if len(parts) < 5:
            continue
            
        brand_str = parts[0]
        # tipo = parts[1] # usually 'motorcycle'
        year_str = parts[2]
        model_slug = parts[3]
        filename = parts[4]
        cat_slug = filename.replace('productos_', '').replace('.json', '')
        
        try:
            year_int = int(year_str)
        except:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception:
            continue # Corrupt JSON or locked file
            
        if not data or not isinstance(data, dict):
            continue
            
        productos = data.get("productos", [])
        if not productos:
            continue
            
        # Get DB IDs
        brand_id = get_or_create_brand(cursor, brand_cache, brand_str)
        veh_id = get_or_create_vehicle(cursor, vehicle_cache, brand_id, year_int, model_slug, model_slug)
        
        # Resolver nombre bonito de categoría. A veces no lo tenemos, usamos el slug capitalizado
        cat_name = cat_slug.replace('-', ' ').upper()
        diagram_img = os.path.join(os.path.dirname(file_path), f"diagrama_{cat_slug}.png")
        if not os.path.exists(diagram_img):
            diagram_img = None
            
        orig_url = data.get("diagrama_url", "")
            
        cat_id = get_or_create_category(cursor, category_cache, veh_id, cat_name, cat_slug, diagram_img, orig_url)
        
        for p in productos:
            sku = str(p.get("sku", "")).strip()
            name = str(p.get("nombre", "")).strip()
            num = str(p.get("numero", "")).strip()
            price = parse_price(p.get("precio"))
            
            if not sku:
                continue
                
            products_batch.append((sku, name, price))
            category_products_batch.append((cat_id, sku, num))
            
        if len(products_batch) >= BATCH_SIZE:
            cursor.executemany('''
                INSERT INTO products (sku, name, current_price) 
                VALUES (?, ?, ?) 
                ON CONFLICT(sku) DO UPDATE SET current_price=excluded.current_price, name=excluded.name
            ''', products_batch)
            products_batch = []
            
        if len(category_products_batch) >= BATCH_SIZE:
            cursor.executemany('''
                INSERT INTO category_products (category_id, product_sku, diagram_ref_number)
                VALUES (?, ?, ?)
            ''', category_products_batch)
            category_products_batch = []
            
        if count % 5000 == 0:
            conn.commit()
            elapsed = time.time() - start_time
            print(f"Progreso: {count}/{total_files} | Tiempo: {elapsed:.1f}s")
            
    # Insertar el resto
    if products_batch:
        cursor.executemany('''
                INSERT INTO products (sku, name, current_price) 
                VALUES (?, ?, ?) 
                ON CONFLICT(sku) DO UPDATE SET current_price=excluded.current_price, name=excluded.name
            ''', products_batch)
    if category_products_batch:
        cursor.executemany('''
                INSERT INTO category_products (category_id, product_sku, diagram_ref_number)
                VALUES (?, ?, ?)
            ''', category_products_batch)
            
    conn.commit()
    conn.close()
    
    total_time = time.time() - start_time
    print("==========================================")
    print("¡EL INGESTOR HA TERMINADO EXITOSAMENTE!")
    print(f"Tiempo Total de Ingesta: {total_time/60:.2f} minutos.")
    print("==========================================")

if __name__ == '__main__':
    main()
