import os
import sys
import time
from glob import glob
from concurrent.futures import ThreadPoolExecutor, as_completed
import boto3
from dotenv import load_dotenv

# Cargar variables de entorno
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

if not AWS_ACCESS_KEY_ID or not S3_BUCKET_NAME:
    print("Error: No se encontraron las credenciales de AWS en .env")
    sys.exit(1)

# Cliente Boto3 para subidas
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

LOCAL_DIR = '/Users/gsoto/Desktop/motopillos/lightsail_images'

def upload_file(local_path):
    # Generar la llave S3 (s3_key), ej. honda/motorcycle/2010...
    s3_key = os.path.relpath(local_path, LOCAL_DIR)
    
    try:
        # Extraer Metadata y especificar ContentType para que los browsers lo rendericen en vivo
        s3_client.upload_file(
            Filename=local_path,
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            ExtraArgs={
                'ContentType': 'image/png'
                # NOTA: Quitado 'ACL': 'public-read' porque los buckets nuevos 
                # suelen tener "Block Public Access" habilitado por defecto y fallaría.
                # Se asume que el bucket tiene una policy estática.
            }
        )
        return True, s3_key
    except Exception as e:
        return False, str(e)

if __name__ == "__main__":
    print(f"=== INICIANDO SUBIDA MASIVA HACIA BUCKET {S3_BUCKET_NAME} ===")
    
    files = glob(os.path.join(LOCAL_DIR, "**", "*.png"), recursive=True)
    total_files = len(files)
    print(f"Archivos encontrados: {total_files}")
    
    completados = 0
    fallidos = 0
    
    start_time = time.time()
    
    # 30 Hilos para no saturar brutalmente la red local
    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = {executor.submit(upload_file, f): f for f in files}
        
        for i, future in enumerate(as_completed(futures), 1):
            success, reason = future.result()
            if success:
                completados += 1
            else:
                fallidos += 1
                
            if i % 500 == 0 or i == total_files:
                elapsed = time.time() - start_time
                tasa = completados / elapsed if elapsed > 0 else 0
                print(f"Subiendo... {i}/{total_files} | Exitos: {completados} | Errores: {fallidos} | {tasa:.1f} img/s")
                sys.stdout.flush()

    total_time = time.time() - start_time
    print("\n==================================")
    print("¡MIGRACIÓN CLOUD FINALIZADA!")
    print(f"Tardó {total_time/60:.2f} minutos.")
    print("==================================")
