from playwright.sync_api import sync_playwright
from playwright_stealth import stealth

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        page = context.new_page()
        stealth(page)
        
        print("Navigating...")
        # Use wait_until='domcontentloaded' to avoid waiting for all tracking pixels
        page.goto('https://www.partzilla.com/search-list', wait_until='domcontentloaded')
        
        # Take a screenshot to see what's happening
        page.screenshot(path="playwright_debug.png")
        
        print("Waiting for textarea...")
        try:
            page.wait_for_selector('textarea', timeout=15000)
            
            print("Filling SKUs...")
            skus = "BAT-85930-06-00\n15410-MFJ-D02\nFAKE-SKU-999"
            page.fill('textarea', skus)
            
            print("Clicking search...")
            # The button might be multiple, we need to click the search button
            page.click('button:has-text("SEARCH")')
            
            print("Waiting for results...")
            page.wait_for_selector('h3:has-text("SEARCH RESULTS")', timeout=10000)
            
            html = page.content()
            if "BAT-85930-06-00" in html:
                print("SUCCESS: Found BAT-85930-06-00 in results")
        except Exception as e:
            print("Error:", e)
            page.screenshot(path="playwright_error.png")
            
        browser.close()

if __name__ == "__main__":
    test()
