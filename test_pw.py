from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Go to the search list page
        page.goto('https://www.partzilla.com/search-list', wait_until='domcontentloaded')
        
        # Wait for textarea
        page.wait_for_selector('textarea')
        
        # Fill all SKUs
        skus = "BAT-85930-06-00\n15410-MFJ-D02\nFAKE-SKU-999"
        page.fill('textarea', skus)
        
        # Click search (button that contains SEARCH or type=submit)
        page.click('button:has-text("SEARCH")')
        
        # Wait for the results table to appear. The results table has rows.
        # "MULTIPLE PART NUMBERS SEARCH RESULTS"
        try:
            page.wait_for_selector('h3:has-text("SEARCH RESULTS")', timeout=10000)
        except Exception as e:
            print("No results heading found:", e)
        
        # Print the text of the page to analyze the results table
        print("Page title:", page.title())
        html = page.content()
        if "BAT-85930-06-00" in html:
            print("Found BAT-85930-06-00 in results")
        if "15410-MFJ-D02" in html:
            print("Found 15410-MFJ-D02 in results")
        if "FAKE-SKU-999" in html:
            print("Found FAKE-SKU-999 in results")
            
        browser.close()

if __name__ == "__main__":
    test()
