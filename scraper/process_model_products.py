import sys
import os
import json
import time

# Asumimos que correrá desde la raíz o dentro de scraper/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scrape_products import scrape_category_products, build_output_path

def process_model(json_path):
    print(f"Leyendo categorias desde: {json_path}")
    if not os.path.exists(json_path):
        print("El archivo no existe.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    categorias = data.get("categorias", [])
    total = len(categorias)
    print(f"Encontradas {total} categorias para extraer.")

    count = 0
    for cat in categorias:
        count += 1
        url = cat.get("url")
        nombre = cat.get("nombre")
        slug = cat.get("slug")
        
        out_path = build_output_path(url)
        
        # Saltamos si ya está scrapeada
        if os.path.exists(out_path):
            print(f"[{count}/{total}] {nombre} ya estaba extraída. Saltando...")
            continue
            
        print(f"\n[{count}/{total}] Extrayendo: {nombre}")
        
        # Intentos simples por bloqueos
        retries = 3
        success = False
        for i in range(retries):
            prod_data = scrape_category_products(url)
            if prod_data:
                # Comprobar si realmente nos dio datos o el array devolvió vacio por un posible 403
                if len(prod_data.get("productos", [])) > 0 or "diagrama_url" in prod_data:
                    with open(out_path, "w", encoding="utf-8") as out_f:
                        json.dump(prod_data, out_f, indent=4)
                    success = True
                    break
            print(f"Fallo extrayendo {nombre}, intento {i+2}/{retries}...")
            time.sleep(2)
            
        if not success:
            print(f"--> FALLO FINAL para la categoría {nombre}. URL: {url}")
            
        # Pausa para no sobrecargar el servidor
        time.sleep(0.5)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        path = sys.argv[1]
    else:
        path = "/Users/gsoto/Desktop/motopillos/datos_extraidos/honda/motorcycle/2010/cbr600ra-ac/categorias_cbr600ra-ac.json"
        
    process_model(path)
