import asyncio
import json
import re
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Launch visible browser so user can solve Cloudflare
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        url = "https://www.partzilla.com/catalog/honda/motorcycle/2024/cbr600rr-6a-cbr600rr/clutch"
        print(f"\\n\\n>>> OPENING BROWSER: {url}")
        print(">>> IF CLOUDFLARE APPEARS, PLEASE CLICK THE CHECKBOX! You have 60 seconds... <<<\\n\\n")
        
        await page.goto(url)
        
        try:
            # Wait for user to solve captcha and page to load
            await page.wait_for_selector(".part-list-table", timeout=60000)
            print(">>> SUCCESS: Detected actual Partzilla Catalog Table! Extracting...\\n")
        except Exception as e:
            print(">>> FAILED: Could not reach catalog within 60s. Did you solve the Captcha?")
            await browser.close()
            return

        # Extract Hotspots exactly like V2
        hotspots_data = await page.evaluate('''() => {
            const img = document.querySelector('.diagram-image-container img');
            const map = document.querySelector('map[name="partListImageMap"]');
            if (!img || !map) return [];
            
            const nw = img.naturalWidth || 1000;
            const nh = img.naturalHeight || 1000;
            
            const results = [];
            const areas = map.querySelectorAll('area');
            areas.forEach(area => {
                const title = area.getAttribute('title') || '';
                const match = title.match(/Ref(?:erence)?\\s*(?:Number|#)?\\s*(\\d+)/i) || title.match(/^(\\d+)\\s*-/);
                let refNumber = match ? match[1] : title;
                refNumber = refNumber.replace(/^0+/, '');
                if (!refNumber) return;
                
                const coords = area.getAttribute('coords');
                if (!coords) return;
                const pts = coords.split(',').map(n => parseInt(n.trim(), 10));
                
                let cx, cy;
                const shape = area.getAttribute('shape') || 'rect';
                if (shape === 'rect' && pts.length >= 4) {
                    cx = (pts[0] + pts[2]) / 2;
                    cy = (pts[1] + pts[3]) / 2;
                } else if (shape === 'circle' && pts.length >= 2) {
                    cx = pts[0]; cy = pts[1];
                } else if (shape === 'poly' && pts.length >= 2) {
                    cx = pts[0]; cy = pts[1];
                } else {
                    return;
                }
                
                const percX = Math.round((cx / nw) * 100);
                const percY = Math.round((cy / nh) * 100);
                
                results.push({ refNumber, percX, percY });
            });
            return results;
        }''')

        # Extract rows
        rows_data = await page.evaluate('''() => {
            const rows = document.querySelectorAll('.part-list-table tbody tr');
            const data = [];
            rows.forEach(r => {
                const text = r.innerText.trim();
                if (text) data.push({raw_text: text});
            });
            return data;
        }''')
        
        print(f"Extracted {len(rows_data)} rows and {len(hotspots_data)} geometric hotspots dynamically.")
        
        payload = {
            "make": "Honda",
            "category": "motorcycle",
            "year": "2024",
            "model": "CBR600RR",
            "model_slug": "cbr600rr-6a-cbr600rr",
            "components": [
                {
                    "name": "Clutch",
                    "url": url,
                    "diagram_url": "https://cdn.partzilla.com/cdn-cgi/image/quality=75,format=auto,fit=contain/MTE/d/e/MTc0OTQwOTk-ebdab095.png",
                    "hotspots": hotspots_data,
                    "parts_list": rows_data
                }
            ]
        }
        
        with open('scraper/output/v4-live-scrape-2024.json', 'w') as f:
            json.dump(payload, f, indent=2)
            
        print(">>> SUCCESS: Saved to scraper/output/v4-live-scrape-2024.json")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
