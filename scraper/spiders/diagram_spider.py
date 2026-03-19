import asyncio
import json
import os
import sys

# Add parent dir to path so we can import core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import get_browser_context
from playwright.async_api import async_playwright

async def run_spider():
    async with async_playwright() as p:
        browser, context = await get_browser_context(p)
        page = await context.new_page()
        
        url = "https://www.partzilla.com/catalog/honda/motorcycle/2024/cbr600rr-6a-cbr600rr/clutch"
        print(f"Bypassing CF and navigating to {url} ...")
        
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            print("Esperando la resolución de Cloudflare...")
            await page.wait_for_selector(".part-list-table", timeout=45000)
            await page.wait_for_timeout(2000)
        except Exception as e:
            # Fallback for possible URL variations
            print(f"Primary URL timeout, trying fallback. Error: {e}")
            url = "https://www.partzilla.com/catalog/honda/motorcycle/2024/cbr600rr-base/clutch"
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_selector(".part-list-table", timeout=45000)
            await page.wait_for_timeout(2000)
            
        print("Injecting Spatial Math Extractor into the Browser Context...")
        # We will run a JavaScript function inside the browser memory to calculate exact relative % percentages
        
        spider_data = await page.evaluate(r'''() => {
            const result = {
               diagram_url: "",
               hotspots: [],
               parts: []
            };
            
            // 1. Get the main blueprint image and its native resolution vs rendered resolution
            const img = document.querySelector('img.diagram-image') || document.querySelector('.diagram-container img');
            if (img) {
                result.diagram_url = img.src;
                const natW = img.naturalWidth;
                const natH = img.naturalHeight;
                
                // 2. Parse the HTML <map> for interactive bounding boxes
                const areas = document.querySelectorAll('map area');
                areas.forEach(area => {
                    const coords = area.getAttribute('coords');
                    const href = area.getAttribute('href') || "";
                    
                    if (coords && natW > 0 && natH > 0) {
                        const pts = coords.split(',').map(Number);
                        if (pts.length >= 4) {
                            // Calculate geometrical center of the bounding box
                            const left = pts[0];
                            const top = pts[1];
                            const right = pts[2];
                            const bottom = pts[3];
                            
                            const centerX = (left + right) / 2;
                            const centerY = (top + bottom) / 2;
                            
                            // Transform to relative CSS percentages for infinite responsive scaling
                            const percX = (centerX / natW) * 100;
                            const percY = (centerY / natH) * 100;
                            
                            // Extract the Ref Number usually attached to the URL hash (e.g., #reference_1)
                            let refNum = "";
                            const refMatch = href.match(/reference_(\d+)/i) || href.match(/ref=(\d+)/i);
                            if (refMatch) refNum = refMatch[1];
                            else {
                                // Fallback: sometimes Partzilla stores it in data-title or alt
                                const altText = area.getAttribute('alt') || area.getAttribute('data-title') || "";
                                const altMatch = altText.match(/(\d+)/);
                                if (altMatch) refNum = altMatch[1];
                            }
                            
                            if (refNum) {
                                result.hotspots.push({
                                    refNumber: refNum,
                                    percX: percX,
                                    percY: percY
                                });
                            }
                        }
                    }
                });
            }
            
            // 3. Extract the physical Parts Table
            const rows = document.querySelectorAll('.part-list-table tbody tr');
            rows.forEach(row => {
               // Usually Partzilla structure: Col 1 has the checkbox/ref number, Col 2 has description, Col 3 has price
               const textContent = row.innerText;
               result.parts.push({ raw_text: textContent });
            });
            
            return result;
        }''')
        
        print(f"Extracted Image: {spider_data['diagram_url']}")
        print(f"Extracted {len(spider_data['hotspots'])} Coordinate Hotspots.")
        print(f"Extracted {len(spider_data['parts'])} Part Table Rows.")
        
        # Structure the payload per the V2 Schema
        final_payload = {
            "make": "Honda",
            "category": "motorcycle",
            "year": "2024",
            "model": "CBR600RR",
            "model_slug": "cbr600rr",
            "components": [
                {
                    "name": "Clutch",
                    "url": url,
                    "diagram_url": spider_data['diagram_url'],
                    "hotspots": spider_data['hotspots'],
                    "parts_list": spider_data['parts']
                }
            ]
        }
        
        out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "v2_clutch_honda_2024.json")
        
        with open(out_path, "w") as f:
            json.dump(final_payload, f, indent=2)
            
        print(f"Saved full V2 Spatial Payload to {out_path}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_spider())
