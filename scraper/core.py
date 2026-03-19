import asyncio
from playwright.async_api import async_playwright
import re

async def get_browser_context(p):
    browser = await p.chromium.launch(headless=False)
    # The user agent is crucial to evade basic Cloudflare checks
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    return browser, context
