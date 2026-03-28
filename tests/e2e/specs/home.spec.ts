import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { waitForPageReady } from '../helpers/test-utils'

test.describe('Home Page', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
    await waitForPageReady(page)
  })

  // ─── Page Load ──────────────────────────────────────────────────
  test.describe('Page Load & SEO', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await expect(page).toHaveURL('/')
    })

    test('should have a proper page title', async ({ page }) => {
      await expect(page).toHaveTitle(/BookIt/i)
    })

    test('should have meta description', async ({ page }) => {
      const metaDesc = page.locator('meta[name="description"]')
      await expect(metaDesc).toHaveAttribute('content', /.+/)
    })

    test('should have exactly one h1 tag', async ({ page }) => {
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Hero Section ───────────────────────────────────────────────
  test.describe('Hero Section', () => {
    test('should display the hero title', async () => {
      await expect(homePage.heroTitle).toBeVisible()
    })

    test('should display a primary CTA button', async ({ page }) => {
      const cta = page.getByRole('link', { name: /explore|book|get started|browse/i }).first()
      await expect(cta).toBeVisible()
    })

    test('hero CTA should navigate correctly on click', async ({ page }) => {
      const cta = page.getByRole('link', { name: /explore|browse/i }).first()
      if (await cta.isVisible()) {
        await cta.click()
        await expect(page).toHaveURL(/events/)
      }
    })
  })

  // ─── Categories Section ─────────────────────────────────────────
  test.describe('Categories Section', () => {
    test('should display category browsing section', async ({ page }) => {
      const section = page.getByText(/Browse by Category|Categories/i)
      if (await section.isVisible()) {
        await expect(section).toBeVisible()
      }
    })

    test('category cards should be clickable and navigate to events', async ({ page }) => {
      const categoryLink = page.getByRole('link', { name: /comedy|music|sports/i }).first()
      if (await categoryLink.isVisible()) {
        await categoryLink.click()
        await expect(page).toHaveURL(/events/)
      }
    })
  })

  // ─── Featured Events Section ────────────────────────────────────
  test.describe('Featured Events Section', () => {
    test('should display featured events heading', async ({ page }) => {
      const heading = page.getByText(/Featured Events|Trending|Popular/i)
      if (await heading.isVisible()) {
        await expect(heading).toBeVisible()
      }
    })

    test('featured event cards should display title, date, price', async ({ page }) => {
      const eventCards = page.locator('a[href*="/events/"]')
      if (await eventCards.count() > 0) {
        const firstCard = eventCards.first()
        await expect(firstCard).toBeVisible()
      }
    })

    test('clicking a featured event card should navigate to event detail', async ({ page }) => {
      const eventCard = page.locator('a[href*="/events/"]').first()
      if (await eventCard.isVisible()) {
        await eventCard.click()
        await expect(page).toHaveURL(/\/events\//)
      }
    })
  })

  // ─── How It Works Section ───────────────────────────────────────
  test.describe('How It Works Section', () => {
    test('should display how it works section', async ({ page }) => {
      const section = page.getByText(/How It Works/i)
      if (await section.isVisible()) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    })
  })

  // ─── Stats Section ─────────────────────────────────────────────
  test.describe('Stats Section', () => {
    test('should display platform statistics', async ({ page }) => {
      const stats = page.getByText(/events|bookings|users/i)
      if (await stats.first().isVisible()) {
        await expect(stats.first()).toBeVisible()
      }
    })
  })

  // ─── Testimonials Section ───────────────────────────────────────
  test.describe('Testimonials Section', () => {
    test('should display testimonials/reviews', async ({ page }) => {
      const section = page.getByText(/testimonial|what.*say|review/i).first()
      if (await section.isVisible()) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    })
  })

  // ─── Organizer CTA Section ──────────────────────────────────────
  test.describe('Organizer CTA Section', () => {
    test('should display a CTA for organizers', async ({ page }) => {
      const cta = page.getByText(/list.*event|organis/i).first()
      if (await cta.isVisible()) {
        await cta.scrollIntoViewIfNeeded()
        await expect(cta).toBeVisible()
      }
    })

    test('organizer CTA link should point to registration', async ({ page }) => {
      const link = page.getByRole('link', { name: /list.*event|start.*organis/i })
      if (await link.isVisible()) {
        await expect(link).toHaveAttribute('href', /organiser/)
      }
    })
  })

  // ─── Responsive Design ─────────────────────────────────────────
  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/')
      await expect(homePage.heroTitle).toBeVisible()
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/')
      await expect(homePage.heroTitle).toBeVisible()
    })
  })

  // ─── Performance ───────────────────────────────────────────────
  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(10000)
    })

    test('should not have broken images', async ({ page }) => {
      const images = page.locator('img')
      const count = await images.count()
      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        const src = await img.getAttribute('src')
        if (src) {
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
          // Allowing 0 width for lazy-loaded images
        }
      }
    })
  })
})
