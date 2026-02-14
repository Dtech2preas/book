from playwright.sync_api import sync_playwright

def verify(page):
    # 1. Verify index.html
    page.goto("http://localhost:8000/index.html")
    print("Navigated to index.html")

    # Check title
    title = page.title()
    print(f"Page title: {title}")
    assert "DTECH - Student Marketplace" in title
    print("Title verified")

    # Check header
    header = page.locator("header h1")
    assert "DTECH" in header.inner_text()

    subtitle = page.locator("header p")
    assert "The Student Marketplace" in subtitle.inner_text()
    print("Header verified")

    # Check footer
    footer = page.locator("footer")
    assert "DTECH empowering the youth through digital innovation" in footer.inner_text()
    assert "2026 DTECH" in footer.inner_text()
    print("Footer verified")

    page.screenshot(path="verification/index_screenshot.png", full_page=True)
    print("Screenshot saved: verification/index_screenshot.png")

    # 2. Verify About Us link
    about_link = page.get_by_role("link", name="About Us")
    about_link.click()
    page.wait_for_load_state("networkidle")

    title = page.title()
    print(f"About Page title: {title}")
    assert "About DTECH" in title
    print("Navigated to about.html")

    # Check content
    content = page.locator(".section").first
    assert "DTECH Book Exchange is a student-focused platform" in content.inner_text()

    # Check ecosystem highlight
    ecosystem = page.locator(".ecosystem-highlight")
    assert "PREASX24" in ecosystem.inner_text()
    print("About content verified")

    page.screenshot(path="verification/about_screenshot.png", full_page=True)
    print("Screenshot saved: verification/about_screenshot.png")

    # 3. Verify Services page
    page.goto("http://localhost:8000/services.html")
    print("Navigated to services.html")

    footer = page.locator("footer")
    assert "DTECH empowering the youth through digital innovation" in footer.inner_text()
    print("Services footer verified")

    page.screenshot(path="verification/services_screenshot.png", full_page=True)
    print("Screenshot saved: verification/services_screenshot.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        verify(page)
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_screenshot.png")
    finally:
        browser.close()
