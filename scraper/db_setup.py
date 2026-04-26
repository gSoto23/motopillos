import sqlite3
import os

DB_PATH = '/Users/gsoto/Desktop/motopillos/motopillos_catalog.db'

def create_database():
    print(f"Conectando a SQLite: {DB_PATH}")
    # Remove existing db for a fresh start during setup
    if os.path.exists(DB_PATH):
        print("Eliminando base de datos anterior para recrear el esquema de ceros...")
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Habilitar Foreign Keys en SQLite (por defecto vienen desactivadas)
    cursor.execute('PRAGMA foreign_keys = ON;')

    # 1. Tabla Marcas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );
    ''')

    # 2. Tabla Vehiculos (Year + Model) - Combinado para soportar el flujo Marca -> Año -> Modelo
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        model_name TEXT NOT NULL,
        slug TEXT,
        FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE,
        UNIQUE(brand_id, year, model_name)
    );
    ''')

    # 3. Tabla Categorias (Ej: ABS Control Unit)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT,
        diagram_image_path TEXT,
        original_diagram_url TEXT,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
        UNIQUE(vehicle_id, slug)
    );
    ''')

    # 4. Tabla Catálogo Global de Repuestos (Únicos por SKU)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        sku TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        current_price REAL -- Guardamos el precio numérico
    );
    ''')

    # 5. Tabla Relacional de Categoría a Producto (Ej. Pieza #14 del ABS Control Unit)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS category_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        product_sku TEXT NOT NULL,
        diagram_ref_number TEXT, -- Puede ser un número o una letra ej. "14", "A"
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        FOREIGN KEY (product_sku) REFERENCES products (sku) ON DELETE CASCADE
    );
    ''')

    # Crear índices para velocidad extrema
    cursor.execute('CREATE INDEX idx_vehicle_brand ON vehicles(brand_id);')
    cursor.execute('CREATE INDEX idx_vehicle_year ON vehicles(year);')
    cursor.execute('CREATE INDEX idx_category_vehicle ON categories(vehicle_id);')
    cursor.execute('CREATE INDEX idx_cat_prod_cat ON category_products(category_id);')
    cursor.execute('CREATE INDEX idx_cat_prod_sku ON category_products(product_sku);')

    conn.commit()
    conn.close()
    print("¡Esquema de Base de Datos relacional creado existosamente!")

if __name__ == '__main__':
    create_database()
