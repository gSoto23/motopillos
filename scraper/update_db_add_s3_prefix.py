import os
import sqlite3
from dotenv import load_dotenv

# Cargar variables de entorno
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

S3_PUBLIC_ENDPOINT = os.getenv('S3_PUBLIC_ENDPOINT')
if not S3_PUBLIC_ENDPOINT:
    print("Error: No se encontró S3_PUBLIC_ENDPOINT en .env")
    exit(1)

# Asegurar que el endpoint no termine en slash
S3_PUBLIC_ENDPOINT = S3_PUBLIC_ENDPOINT.rstrip('/')

DB_PATH = '/Users/gsoto/Desktop/motopillos/motopillos_catalog.db'

print(f"=== ACTUALIZANDO DATABASE CON LA URL FINAL DE S3 ===")
print(f"URL Base detectada: {S3_PUBLIC_ENDPOINT}")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Transformamos la ruta relativa a una URL pública absoluta
# Si la ruta ya empieza con http, la ignoramos para no duplicar en re-ejecuciones.
cursor.execute(f"""
    UPDATE categories 
    SET diagram_image_path = '{S3_PUBLIC_ENDPOINT}/' || diagram_image_path
    WHERE diagram_image_path IS NOT NULL AND diagram_image_path NOT LIKE 'http%'
""")

filas_afectadas = cursor.rowcount
conn.commit()
conn.close()

print(f"¡Éxito! Se actualizaron {filas_afectadas} rutas relativas a URLs absolutas completas.")
print("Tu base de datos ahora tiene los enlaces directos listos para el navegador.")
