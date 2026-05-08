from curl_cffi import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}
res = requests.get('https://www.partzilla.com/quickorder', headers=headers, impersonate="chrome120")
print(res.status_code)
print(res.text[:500])
