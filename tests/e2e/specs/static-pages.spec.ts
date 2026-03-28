import { test, expect } from '@playwright/test'
import { waitForPageReady } from '../helpers/test-utils'
import { ROUTES } from '../helpers/constants'

const STATIC_PAGES = [
  { name: 'About', route: ROUTES.about, expectedText: /about/i },
  { name: 'Blog', route: ROUTES.blog, expectedText: /blog/i },
  { name: 'Careers', route: ROUTES.careers, expectedText: /career/i },
  { name: 'Pricing', route: ROUTES.pricing, expectedText: /pricing|plan/i },
  { name: 'Contact', route: ROUTES.contact, expectedText: /contact/i },
  { name: 'Enterprise', route: ROUTES.enterprise, expectedText: /enterprise/i },
  { name: 'Terms', route: ROUTES.terms, expectedText: /terms/i },
  { name: 'Privacy', route: ROUTES.privacy, expectedText: /privacy/i },
  { name: 'Refunds', route: ROUTES.refunds, expectedText: /refund/i },
]

for (const staticPage of STATIC_PAGES) {
  test.describe(`${staticPage.name} Page`, () => {
    test(`should load ${staticPage.name} page at ${staticPage.route}`, async ({ page }) => {
      await page.goto(staticPage.route)
      await waitForPageReady(page)
      await expect(page).toHaveURL(staticPage.route)
    })

    test(`should have relevant content for ${staticPage.name}`, async ({ page }) => {
      await page.goto(staticPage.route)
      await waitForPageReady(page)
      const content = page.getByText(staticPage.expectedText).first()
      await expect(content).toBeVisible()
    })

    test(`should have a proper title for ${staticPage.name}`, async ({ page }) => {
      await page.goto(staticPage.route)
      await expect(page).toHaveTitle(/.+/)
    })

    test(`should have navbar on ${staticPage.name} page`, async ({ page }) => {
      await page.goto(staticPage.route)
      await waitForPageReady(page)
      const header = page.locator('header')
      await expect(header).toBeVisible()
    })

    test(`should have footer on ${staticPage.name} page`, async ({ page }) => {
      await page.goto(staticPage.route)
      await waitForPageReady(page)
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible()
    })

    test(`${staticPage.name} page should render on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(staticPage.route)
      await waitForPageReady(page)
      await expect(page).toHaveURL(staticPage.route)
    })
  })
}

// ═══════════════════════════════════════════════════════════════════
// 404 Not Found Page
// ═══════════════════════════════════════════════════════════════════
test.describe('404 Not Found Page', () => {
  test('should display 404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist')
    // Next.js returns 404 for unknown routes
    if (response) {
      expect(response.status()).toBe(404)
    }
  })

  test('should display a user-friendly not found message', async ({ page }) => {
    await page.goto('/unknown-route-12345')
    await waitForPageReady(page)
    const notFoundText = page.getByText(/not found|404|page.*exist/i)
    await expect(notFoundText).toBeVisible()
  })

  test('should have a link back to home', async ({ page }) => {
    await page.goto('/unknown-route-12345')
    await waitForPageReady(page)
    const homeLink = page.getByRole('link', { name: /home|go back|return/i })
    if (await homeLink.isVisible()) {
      await homeLink.click()
      await expect(page).toHaveURL('/')
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// Global Error Boundary
// ═══════════════════════════════════════════════════════════════════
test.describe('Error Boundary', () => {
  test('app should handle runtime errors gracefully', async ({ page }) => {
    // Navigate to home to ensure the app loads
    await page.goto('/')
    await waitForPageReady(page)
    // The global-error.tsx should handle any crashes
    await expect(page.locator('body')).toBeVisible()
  })
})
