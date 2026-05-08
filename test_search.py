from curl_cffi import requests

sku = "15410-MFJ-D02+91301-MFJ-D01"
url = f"https://www.partzilla.com/search-list?q={sku}"
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

res = requests.get(url, headers=headers, impersonate="chrome120")
print("Status:", res.status_code)

if "Currently Unavailable" in res.text or "Out of Stock" in res.text:
    print("Out of Stock")
else:
    print("In Stock")
