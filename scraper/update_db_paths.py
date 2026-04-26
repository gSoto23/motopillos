import sqlite3

DB_PATH = '/Users/gsoto/Desktop/motopillos/motopillos_catalog.db'

print("=== ACTUALIZANDO RUTAS PARA LA NUBE (AWS S3) ===")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

texto_a_borrar = '/Users/gsoto/Desktop/motopillos/datos_extraidos/'

print(f"Borrando prefijo local de Mac: {texto_a_borrar}")

# Transformamos rutas estáticas (Mac) a S3 Keys (S3 object keys sin primer slash)
cursor.execute(f"UPDATE categories SET diagram_image_path = replace(diagram_image_path, '{texto_a_borrar}', '') WHERE diagram_image_path IS NOT NULL;")

filas_afectadas = cursor.rowcount
conn.commit()
conn.close()

print(f"¡Éxito! Se actualizaron {filas_afectadas} filas en la tabla categories.")
print("Ahora la base de datos está oficialmente lista para Producción, apuntando a las AWS S3 Object Keys exactas.")
