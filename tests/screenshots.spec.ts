import { test } from "@playwright/test"

const BASE_URL = "http://localhost:3000"

test.describe("Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    // Try to register/login for authenticated pages
    await page.goto(`${BASE_URL}/register`)
    const email = `screenshot-${Date.now()}@example.com`
    const password = "TestPass123!"
    await page.fill("#name", "Demo User")
    await page.fill("#email", email)
    await page.fill("#password", password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/agents/, { timeout: 10000 }).catch(() => {})
  })

  test("01 - Login page", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: "public/screenshots/01-login.png", fullPage: true })
  })

  test("02 - Dashboard", async ({ page }) => {
    await page.goto(`${BASE_URL}/agents`)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: "public/screenshots/02-dashboard.png", fullPage: true })
  })

  test("03 - Agent form", async ({ page }) => {
    await page.goto(`${BASE_URL}/agents/new`)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: "public/screenshots/03-agent-form.png", fullPage: true })
  })

  test("04 - Settings", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: "public/screenshots/04-settings.png", fullPage: true })
  })

  test("05 - ComingSoon", async ({ page }) => {
    await page.goto(`${BASE_URL}/collaborations/new`)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: "public/screenshots/05-coming-soon.png", fullPage: true })
  })

  test("06 - Chat welcome", async ({ page }) => {
    await page.goto(`${BASE_URL}/agents`)
    // Click first agent or navigate to a chat page
    const agentLink = page.locator('a[href*="/agents/"]').first()
    if (await agentLink.isVisible()) {
      const href = await agentLink.getAttribute("href")
      await page.goto(`${BASE_URL}${href}/chat`)
    } else {
      await page.goto(`${BASE_URL}/agents`)
    }
    await page.waitForTimeout(1000)
    await page.screenshot({ path: "public/screenshots/06-chat.png", fullPage: true })
  })
})
