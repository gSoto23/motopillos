import os
import sys
import time
import json
from glob import glob
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from curl_cffi import requests

EXTRACT_DIR = "/Users/gsoto/Desktop/motopillos/datos_extraidos"

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

def get_all_product_files():
    pattern = os.path.join(EXTRACT_DIR, "**", "productos_*.json")
    return sorted(glob(pattern, recursive=True))

def download_image(args):
    url, output_path, retries = args
    if os.path.exists(output_path):
        return True, "existente" # Ya esta descargada
        
    for attempt in range(retries):
        try:
            res = requests.get(url, headers=headers, impersonate="chrome120", timeout=15)
            if res.status_code == 200:
                with open(output_path, 'wb') as f:
                    f.write(res.content)
                return True, "descargado"
            else:
                time.sleep(2 + attempt)
        except Exception as e:
            time.sleep(2 + attempt)
            
    return False, "fallido"

if __name__ == "__main__":
    print("=== ORQUESTADOR DE IMAGENES INICIADO ===")
    
    prod_files = get_all_product_files()
    total_files = len(prod_files)
    print(f"Buscando diagramas en {total_files} archivos...")
    
    tasks = []
    
    # Pre-calcular tareas para alimentar el ThreadPool
    count_skipped = 0
    for file_path in prod_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except:
                continue
                
        img_url = data.get("diagrama_url")
        if not img_url:
            count_skipped += 1
            continue
            
        dir_name = os.path.dirname(file_path)
        base_name = os.path.basename(file_path)
        slug = base_name.replace('productos_', '').replace('.json', '')
        
        # Extraer extension del URL o usar .png por defecto
        parsed_url = urlparse(img_url)
        ext = os.path.splitext(parsed_url.path)[1]
        if not ext:
            ext = ".png"
            
        img_path = os.path.join(dir_name, f"diagrama_{slug}{ext}")
        tasks.append((img_url, img_path, 3))
    
    print(f"Archivos sin diagrama ignorados: {count_skipped}")
    print(f"Total de imágenes a procesar: {len(tasks)}")
    print("Iniciando pool de descargas concurrentes (Max Workers=10)...")
    
    completados = 0
    fallidos = 0
    existentes = 0
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_image, task): task for task in tasks}
        
        for i, future in enumerate(as_completed(futures), 1):
            url, img_path, _ = futures[future]
            try:
                success, status = future.result()
                if status == "existente":
                    existentes += 1
                elif status == "descargado":
                    completados += 1
                else:
                    fallidos += 1
                    print(f"[!] FALLO al descargar {url}")
            except Exception as exc:
                fallidos += 1
                print(f"[!] ERROR al descargar {url} generó excepcion: {exc}")
                
            if i % 1000 == 0:
                print(f"Progreso: {i}/{len(tasks)} (Descargados: {completados}, Existentes: {existentes}, Fallidos: {fallidos})")

    print("\n¡LA COSECHA DE DIAGRAMAS HA CONCLUIDO!")
    print(f"Resumen Final:\n Descargados Nuevos: {completados}\n Preexistentes: {existentes}\n Fallidos: {fallidos}")
