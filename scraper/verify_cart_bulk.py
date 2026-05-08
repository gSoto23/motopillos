import sys
import json
import asyncio
from curl_cffi.requests import AsyncSession

KNOWN_BRANDS = ['yamaha', 'honda', 'kawasaki', 'suzuki', 'polaris', 'arctic-cat', 'can-am', 'sea-doo', 'ski-doo']

async def check_direct_url(session, sku, brand):
    url = f"https://www.partzilla.com/product/{brand}/{sku}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    try:
        res = await session.get(url, headers=headers, impersonate="chrome120", timeout=8)
        if res.status_code == 200 and "Guaranteed product fitment" in res.text:
            # We found the valid product page! Now check if it's explicitly unavailable.
            if "Currently Unavailable" in res.text:
                return False
            return True
        return False
    except:
        return False

async def check_sku(session, sku_data):
    if isinstance(sku_data, dict):
        sku = sku_data.get('sku')
        brand = sku_data.get('brand')
    else:
        sku = sku_data
        brand = None

    if not sku:
        return None, False

    # 1. Try the brand extracted from the meta field first (ultra-fast)
    if brand:
        is_valid = await check_direct_url(session, sku, brand)
        if is_valid:
            return sku, True

    # 2. Fallback: Guess the brand concurrently (fast and robust)
    tasks = [check_direct_url(session, sku, b) for b in KNOWN_BRANDS if b != brand]
    results = await asyncio.gather(*tasks)
    
    if any(results):
        return sku, True

    # Strict Validation: If it doesn't match a known brand with Guaranteed product fitment, reject.
    return sku, False

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No SKUs provided"}))
        sys.exit(1)
        
    try:
        skus_data = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)

    if not isinstance(skus_data, list) or len(skus_data) == 0:
        print(json.dumps({"results": {}}))
        sys.exit(0)

    results = {}
    
    async with AsyncSession() as session:
        tasks = [check_sku(session, sku_obj) for sku_obj in skus_data]
        completed = await asyncio.gather(*tasks)
        
        for sku, is_available in completed:
            if sku:
                results[sku] = is_available
            
    print(json.dumps({"success": True, "results": results}))

if __name__ == "__main__":
    import warnings
    warnings.filterwarnings("ignore")
    asyncio.run(main())
