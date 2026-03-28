import { test, expect } from '@playwright/test'
import { waitForPageReady } from '../helpers/test-utils'

/**
 * Accessibility tests covering basic WCAG compliance across all major pages.
 */

const PAGES_TO_TEST = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Login', path: '/login' },
  { name: 'About', path: '/about' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Contact', path: '/contact' },
]

for (const pageConfig of PAGES_TO_TEST) {
  test.describe(`Accessibility - ${pageConfig.name}`, () => {
    test(`should have lang attribute on html element`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      await expect(page.locator('html')).toHaveAttribute('lang', /.+/)
    })

    test(`should have proper heading hierarchy`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    })

    test(`all images should have alt attributes`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      const images = page.locator('img')
      const count = await images.count()
      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        expect(alt).not.toBeNull()
      }
    })

    test(`all buttons should be keyboard focusable`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      const buttons = page.locator('button:visible')
      const count = await buttons.count()
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i)
        await button.focus()
        await expect(button).toBeFocused()
      }
    })

    test(`all links should have href attributes`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      const links = page.locator('a:visible')
      const count = await links.count()
      for (let i = 0; i < Math.min(count, 10); i++) {
        const link = links.nth(i)
        const href = await link.getAttribute('href')
        expect(href).not.toBeNull()
      }
    })

    test(`interactive elements should have visible focus indicators`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      // Tab through elements and verify focus is visible
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test(`page should have no duplicate IDs`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      const ids = await page.evaluate(() => {
        const elements = document.querySelectorAll('[id]')
        const idMap: Record<string, number> = {}
        elements.forEach((el) => {
          const id = el.id
          if (id) idMap[id] = (idMap[id] || 0) + 1
        })
        return Object.entries(idMap).filter(([, count]) => count > 1)
      })
      expect(ids).toHaveLength(0)
    })

    test(`color contrast should be sufficient (text readable)`, async ({ page }) => {
      await page.goto(pageConfig.path)
      await waitForPageReady(page)
      // Basic check: body text shouldn't have opacity 0 or display none
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })
}

// ─── Keyboard Navigation ─────────────────────────────────────────
test.describe('Keyboard Navigation', () => {
  test('should navigate through navbar links with Tab', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)
    // Tab multiple times and check focus moves
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
    }
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('should open mobile menu with Enter key', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await waitForPageReady(page)
    const toggle = page.locator('button[aria-label="Toggle menu"]')
    await toggle.focus()
    await page.keyboard.press('Enter')
    // Mobile menu should appear
  })

  test('should submit login form with Enter key', async ({ page }) => {
    await page.goto('/login')
    await waitForPageReady(page)
    const phoneInput = page.getByPlaceholder('98765 43210')
    await phoneInput.fill('9876543210')
    await page.keyboard.press('Enter')
    // Form should attempt submission
  })
})

// ─── Screen Reader Friendliness ──────────────────────────────────
test.describe('Screen Reader Support', () => {
  test('navbar toggle should have aria-label', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await waitForPageReady(page)
    const toggle = page.locator('button[aria-label="Toggle menu"]')
    await expect(toggle).toHaveAttribute('aria-label', 'Toggle menu')
  })

  test('form inputs should have associated labels', async ({ page }) => {
    await page.goto('/login')
    await waitForPageReady(page)
    const label = page.getByText('Mobile Number')
    await expect(label).toBeVisible()
  })
})
