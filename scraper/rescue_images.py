import os
import shutil
from glob import glob

SRC_DIR = '/Users/gsoto/Desktop/motopillos/datos_extraidos'
DST_DIR = '/Users/gsoto/Desktop/motopillos/s3_images'

print("=== RESCATE DE IMAGENES PARA S3 ===")
print("Iniciando transferencia de diagramas, por favor espera...")

files = glob(os.path.join(SRC_DIR, "**", "diagrama_*.*"), recursive=True)
print(f"Se detectaron {len(files)} diagramas limpios a rescatar.")

movidos = 0
for file_path in files:
    # Obtener subruta: honda/motorcycle/2010/cbr600/diagrama_clutch.png
    rel_path = os.path.relpath(file_path, SRC_DIR)
    new_path = os.path.join(DST_DIR, rel_path)
    
    # Asegurar que el directorio destino existe
    os.makedirs(os.path.dirname(new_path), exist_ok=True)
    
    # Mover el archivo
    shutil.move(file_path, new_path)
    movidos += 1
    
    if movidos % 5000 == 0:
        print(f"Progreso: {movidos}/{len(files)}")

print(f"¡Éxito! Se movieron {movidos} imágenes hacia la estructura cloud s3_images/")
print("Ahora puedes eliminar la carpeta datos_extraidos libremente de tu repositorio.")
