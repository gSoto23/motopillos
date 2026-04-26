import sys
import json
import re
import os
import time
from urllib.parse import urlparse
from curl_cffi import requests

YEAR_URLS = [
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2010",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2011",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2012",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2013",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2014",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2015",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2016",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2017",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2018",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2019",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2020",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2021",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2022",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2023",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2024",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2025",
    "https://www.partzilla.com/catalog/yamaha/motorcycle/2026"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

def get_with_retry(url, retries=3):
    for attempt in range(retries):
        try:
            res = requests.get(url, headers=headers, impersonate="chrome120", timeout=15)
            if res.status_code == 200:
                return res
            elif res.status_code == 404:
                print(f"  [404] No encontrado: {url}")
                return None
            else:
                print(f"  [HTTP {res.status_code}] Retrying {url}...")
        except Exception as e:
            print(f"  [Error] {e}. Retrying {url}...")
        time.sleep(2)
    return None

def process_year(year_url):
    print(f"=== Procesando Año: {year_url} ===")
    
    parsed = urlparse(year_url)
    path = parsed.path
    if path.endswith('/'): path = path[:-1]
    
    parts = path.split('/')
    year = parts[-1]
    machine = parts[-2]
    brand = parts[-3]
    
    res = get_with_retry(year_url)
    if not res:
        print(f"Falló al obtener la url del año {year_url}")
        return
        
    text = res.text.replace('\\"', '"')
    
    # extraer modelos
    escape_path = re.escape(path)
    pattern = r'"href":"(' + escape_path + r'/[^"]+)".*?"children":"([^"]+)"'
    matches = re.finditer(pattern, text)
    
    unique_models = {}
    for m in matches:
        href = m.group(1)
        name = m.group(2)
        slug = href.split('/')[-1]
        
        # Avoid nested and React garbage
        if len(href.strip('/').split('/')) == 5 and not name.startswith('$'):
            unique_models[slug] = {
                "nombre": name,
                "slug": slug,
                "url": "https://www.partzilla.com" + href
            }

    models_list = list(unique_models.values())
    models_list.sort(key=lambda x: x["nombre"])
    
    if len(models_list) == 0:
        print(f"Cero modelos encontrados para {year_url}. Saltando.")
        return

    year_dir = f"/Users/gsoto/Desktop/motopillos/datos_extraidos/{brand}/{machine}/{year}"
    os.makedirs(year_dir, exist_ok=True)
    models_path = os.path.join(year_dir, f"modelos_{year}.json")

    with open(models_path, "w", encoding="utf-8") as f:
        json.dump({
            "url_base": year_url,
            "cantidad_de_modelos": len(models_list),
            "modelos": models_list
        }, f, indent=4)
        
    print(f"Guardados {len(models_list)} modelos para el año {year}. Extrayendo categorias...")
    
    for i, model in enumerate(models_list):
        print(f"  [{i+1}/{len(models_list)}] Descargando Modelo: {model['nombre']}...")
        model_url = model['url']
        model_slug = model['slug']
        
        cat_res = get_with_retry(model_url)
        if not cat_res: continue
        
        cat_text = cat_res.text.replace('\\"', '"')
        
        cat_parsed = urlparse(model_url)
        m_path = cat_parsed.path
        if m_path.endswith('/'): m_path = m_path[:-1]
        
        cat_escape_path = re.escape(m_path)
        cat_pattern = r'"href":"(' + cat_escape_path + r'/[^"]+)".*?"children":"([^"]+)"'
        cat_matches = re.finditer(cat_pattern, cat_text)
        
        unique_cats = {}
        for cm in cat_matches:
            chref = cm.group(1)
            cname = cm.group(2)
            cslug = chref.split('/')[-1]
            if not cname.startswith('$'):
                unique_cats[cslug] = {
                    "nombre": cname,
                    "slug": cslug,
                    "url": "https://www.partzilla.com" + chref
                }

        cats_list = list(unique_cats.values())
        cats_list.sort(key=lambda x: x['nombre'])
        
        model_dir = os.path.join(year_dir, model_slug)
        os.makedirs(model_dir, exist_ok=True)
        cat_path = os.path.join(model_dir, f"categorias_{model_slug}.json")
        
        with open(cat_path, "w", encoding="utf-8") as f:
            json.dump({
                "url_base": model_url,
                "cantidad_de_categorias": len(cats_list),
                "categorias": cats_list
            }, f, indent=4)
            
        # Pequeña pausa para no abrumar al servidor
        time.sleep(0.3)

if __name__ == "__main__":
    print(f"Iniciando raspado de {len(YEAR_URLS)} años de Yamaha...")
    for y_url in YEAR_URLS:
        process_year(y_url)
    print("\nPROCESO MASIVO COMPLETADO!")
