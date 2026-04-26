import os
import sys
import time
from glob import glob

# Importar la lógica que ya validamos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from process_model_products import process_model

EXTRACT_DIR = "/Users/gsoto/Desktop/motopillos/datos_extraidos"

def get_all_category_files():
    # Usar glob para buscar recursivamente todos los categorias_*.json
    pattern = os.path.join(EXTRACT_DIR, "**", "categorias_*.json")
    files = glob(pattern, recursive=True)
    return sorted(files)

if __name__ == "__main__":
    print("=== MEGA LANZADOR DE PRODUCTOS ACTIVADO ===")
    
    cat_files = get_all_category_files()
    total_files = len(cat_files)
    
    print(f"Se encontraron {total_files} manifiestos de modelos para procesar masivamente.")
    
    for i, file_path in enumerate(cat_files):
        print(f"\n==================================================")
        print(f"[{i+1}/{total_files}] Iniciando procesamiento de Modelo")
        print(f"==================================================")
        try:
            process_model(file_path)
        except Exception as e:
            print(f"Error procesando {file_path}: {e}")
        
        # Pausa extra entre modelos grandes
        time.sleep(1)
        
    print("\n¡TODOS LOS PRODUCTOS DE TODAS LAS MARCAS HAN SIDO EXTRAIDOS!")
