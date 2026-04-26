import sys
import os
import json
from urllib.parse import urlparse
from curl_cffi import requests

def build_output_path(url):
    parsed = urlparse(url)
    path = parsed.path
    if path.endswith('/'):
        path = path[:-1]
    
    parts = path.split('/')
    if len(parts) >= 7:
        category_slug = parts[-1]
        model_slug = parts[-2]
        year = parts[-3]
        machine = parts[-4]
        brand = parts[-5]
        
        base_dir = f"/Users/gsoto/Desktop/motopillos/datos_extraidos/{brand}/{machine}/{year}/{model_slug}"
        os.makedirs(base_dir, exist_ok=True)
        return os.path.join(base_dir, f"productos_{category_slug}.json")
    return "/Users/gsoto/Desktop/motopillos/datos_extraidos/test_category_output.json"

def scrape_category_products(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    print(f"Descargando {url} ...")
    try:
        response = requests.get(url, headers=headers, impersonate="chrome120")
    except Exception as e:
        print(f"Error HTTP: {e}")
        return None
        
    text = response.text.replace('\\"', '"').replace('\\\\', '\\')
    
    # Extraer el array principal de productos
    idx = text.find('"catalogProduct":[')
    products_output = []
    
    if idx != -1:
        start = idx + 17
        end = start
        count = 0
        in_string = False
        escape = False
        
        for i in range(start, len(text)):
            char = text[i]
            if not escape and char == '"':
                in_string = not in_string
                
            if not in_string:
                if char == '[':
                    count += 1
                elif char == ']':
                    count -= 1
                    if count == 0:
                        end = i + 1
                        break
                        
            if char == '\\' and not escape:
                escape = True
            else:
                escape = False
                
        arr_str = text[start:end]
        try:
            arr = json.loads(arr_str)
            for item in arr:
                # Comprobar si esta disponible
                is_sellable = item.get("isSellable", True)
                
                if not is_sellable:
                    precio_final = "out stock"
                else:
                    # El usuario quiere el precio MAS ALTO.
                    prices = [float(p) for p in [item.get("priceLvl1"), item.get("priceLvl2"), item.get("priceLvl3")] if p]
                    precio_final = max(prices) if prices else None
                
                # Format exactly as requested
                products_output.append({
                    "numero": item.get("refId"),
                    "nombre": item.get("productName"),
                    "sku": item.get("sku"),
                    "precio": precio_final
                })
        except Exception as e:
            print("Error parseando arreglo de productos:", e)
    
    # Extraer imagen del diagrama
    img_url = None
    img_idx = text.find('"image":"')
    if img_idx != -1:
        img_start = img_idx + 9
        img_end = text.find('"', img_start)
        img_str = text[img_start:img_end]
        if img_str:
            img_url = "https://cdn.partzilla.com/cdn-cgi/image/quality=75,format=auto,fit=contain/" + img_str

    result = {
        "diagrama_url": img_url,
        "productos": products_output
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = "https://www.partzilla.com/catalog/honda/motorcycle/2010/cbr600ra-ac/abs-control-unit-cbr600ra"
        
    data = scrape_category_products(url)
    if data:
        out_path = build_output_path(url)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        print(f"Completado! Se guardo la informacion en {out_path}")
