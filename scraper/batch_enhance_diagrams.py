import os
import cv2
from glob import glob
from concurrent.futures import ProcessPoolExecutor, as_completed
import time
import sys

BASE_DIR = '/Users/gsoto/Desktop/motopillos/datos_extraidos'

def process_image(img_path):
    try:
        # Validar tamanos minimos para evitar archivos corruptos o vacios
        if os.path.getsize(img_path) < 100:
            return False, "corrupto"
            
        img = cv2.imread(img_path)
        if img is None:
            return False, "invalido"
            
        # Si la imagen ya es 1-canal (grayscale) con maximo 255 y minimo 0, es probable que ya este procesada
        # Pero sobrescribir es seguro.
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Filtro de contraste: Todo lo que sea gris claro o fondo, convertido a blanco absoluto.
        # Las piezas (negro) se estiran para mantener nitidez sin pixelado.
        gray[gray > 150] = 255
        gray = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
        
        # Reescribimos directamente sobre el disco manteniendo compresion PNG para ahorrar espacio
        ext = os.path.splitext(img_path)[1].lower()
        if ext == '.png':
            cv2.imwrite(img_path, gray, [cv2.IMWRITE_PNG_COMPRESSION, 9])
        else:
            cv2.imwrite(img_path, gray, [cv2.IMWRITE_JPEG_QUALITY, 90])
            
        return True, "ok"
    except Exception as e:
        return False, str(e)

if __name__ == "__main__":
    print("=== INICIANDO LIMPIEZA MASIVA DE FONDOS DE DIAGRAMAS ===")
    
    print("Buscando diagramas en disco...")
    start_time = time.time()
    
    # Encontremos todos los archivos que inicien con diagrama_
    files = glob(os.path.join(BASE_DIR, "**", "diagrama_*.*"), recursive=True)
    total_files = len(files)
    
    print(f"Se encontraron {total_files} diagramas a procesar.")
    print("Iniciando pool agresivo de CPUs...")
    
    completados = 0
    fallidos = 0
    
    # Almacenaremos actualizaciones cada 1000 imagenes en el log
    with ProcessPoolExecutor(max_workers=os.cpu_count() or 8) as executor:
        futures = {executor.submit(process_image, f): f for f in files}
        
        for i, future in enumerate(as_completed(futures), 1):
            try:
                success, reason = future.result()
                if success:
                    completados += 1
                else:
                    fallidos += 1
                    file_path = futures[future]
                    # print(f"Error procesando {file_path}: {reason}")
            except Exception as exc:
                fallidos += 1
                
            if i % 1000 == 0 or i == total_files:
                elapsed = time.time() - start_time
                tasa = completados / elapsed if elapsed > 0 else 0
                print(f"Progreso: {i}/{total_files} ({(i/total_files)*100:.1f}%) | "
                      f"Completados: {completados} | Fallidos: {fallidos} | "
                      f"Velocidad: {tasa:.1f} img/s")
                sys.stdout.flush()

    total_time = time.time() - start_time
    print("\n==================================")
    print("¡LIMPIEZA DE FONDOS FINALIZADA!")
    print(f"Total procesados con exito: {completados}")
    print(f"Total fallidos (no imagenes/corruptos): {fallidos}")
    print(f"Tiempo total: {total_time/60:.2f} minutos.")
    print("==================================")
