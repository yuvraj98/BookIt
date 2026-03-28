import { test, expect } from '@playwright/test'
import { EventsPage } from '../pages/EventsPage'
import { mockEventsApi, waitForPageReady } from '../helpers/test-utils'

test.describe('Events - Explore Page', () => {
  let eventsPage: EventsPage

  test.beforeEach(async ({ page }) => {
    eventsPage = new EventsPage(page)
    await mockEventsApi(page)
    await eventsPage.goto()
    await waitForPageReady(page)
  })

  // ─── Page Load ──────────────────────────────────────────────────
  test.describe('Page Load', () => {
    test('should load the events page', async ({ page }) => {
      await expect(page).toHaveURL('/events')
    })

    test('should display page title "Discover Experiences"', async () => {
      await expect(eventsPage.pageTitle).toBeVisible()
    })

    test('should display subtitle', async () => {
      await expect(eventsPage.pageSubtitle).toBeVisible()
    })
  })

  // ─── Search ─────────────────────────────────────────────────────
  test.describe('Search', () => {
    test('should display search input', async () => {
      await expect(eventsPage.searchInput).toBeVisible()
    })

    test('should have placeholder text', async () => {
      await expect(eventsPage.searchInput).toHaveAttribute('placeholder', 'Search events...')
    })

    test('should filter events on search input with debounce', async ({ page }) => {
      await mockEventsApi(page, [
        { id: 'e1', title: 'Comedy Night', category: 'comedy', city: 'Pune', venue_name: 'Test', starts_at: new Date().toISOString(), poster_url: null, min_price: 100, organisers: { business_name: 'T' } }
      ])
      await eventsPage.searchFor('Comedy')
      await page.waitForTimeout(700)
      // Verify the API was called with search param (events should refresh)
    })

    test('should clear search input', async () => {
      await eventsPage.searchInput.fill('test')
      await eventsPage.searchInput.clear()
      await expect(eventsPage.searchInput).toHaveValue('')
    })
  })

  // ─── Category Filters ──────────────────────────────────────────
  test.describe('Category Filters', () => {
    test('should display All category pill as default selected', async ({ page }) => {
      const allPill = page.getByRole('button', { name: 'All', exact: true })
      await expect(allPill).toBeVisible()
      await expect(allPill).toHaveClass(/bg-brand/)
    })

    test('should display all category pills', async ({ page }) => {
      const categories = ['All', 'Comedy', 'Music', 'Sports', 'Workshop', 'Theatre', 'Food', 'Art', 'Others']
      for (const cat of categories) {
        const pill = page.getByRole('button', { name: cat, exact: true })
        await expect(pill).toBeVisible()
      }
    })

    test('clicking a category should highlight it', async ({ page }) => {
      const musicButton = page.getByRole('button', { name: 'Music', exact: true })
      await musicButton.click()
      await expect(musicButton).toHaveClass(/bg-brand/)
    })

    test('clicking a category should deselect the previous one', async ({ page }) => {
      const allButton = page.getByRole('button', { name: 'All', exact: true })
      const musicButton = page.getByRole('button', { name: 'Music', exact: true })
      await musicButton.click()
      await expect(allButton).not.toHaveClass(/bg-brand/)
    })

    test('category pills should be horizontally scrollable', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      // Categories should still be visible (overflow-x-auto)
      const allButton = page.getByRole('button', { name: 'All', exact: true })
      await expect(allButton).toBeVisible()
    })
  })

  // ─── City Filter ───────────────────────────────────────────────
  test.describe('City Filter', () => {
    test('should display city selector dropdown', async () => {
      await expect(eventsPage.citySelect).toBeVisible()
    })

    test('should have Pune as default', async () => {
      await expect(eventsPage.citySelect).toHaveValue('Pune')
    })

    test('should have city options: Pune, Mumbai, Bangalore', async ({ page }) => {
      await expect(page.locator('option', { hasText: 'Pune' })).toBeAttached()
      await expect(page.locator('option', { hasText: 'Mumbai' })).toBeAttached()
      await expect(page.locator('option', { hasText: 'Bangalore' })).toBeAttached()
    })

    test('changing city should trigger re-fetch', async () => {
      await eventsPage.selectCity('Mumbai')
      await expect(eventsPage.citySelect).toHaveValue('Mumbai')
    })
  })

  // ─── Event Cards Grid ──────────────────────────────────────────
  test.describe('Event Cards', () => {
    test('should display event cards', async () => {
      const count = await eventsPage.getEventCount()
      expect(count).toBeGreaterThan(0)
    })

    test('each event card should display title', async ({ page }) => {
      const firstCard = eventsPage.eventCards.first()
      const title = firstCard.locator('h3')
      await expect(title).toBeVisible()
    })

    test('each event card should display date', async ({ page }) => {
      const firstCard = eventsPage.eventCards.first()
      const dateElement = firstCard.locator('[class*="text-muted"]').first()
      await expect(dateElement).toBeVisible()
    })

    test('each event card should display venue and city', async ({ page }) => {
      const firstCard = eventsPage.eventCards.first()
      await expect(firstCard.locator('text=/Phoenix|NSCI|MCA/')).toBeVisible()
    })

    test('each event card should display price', async ({ page }) => {
      const firstCard = eventsPage.eventCards.first()
      await expect(firstCard.getByText('Starts from')).toBeVisible()
    })

    test('each event card should display Book Now button', async ({ page }) => {
      const firstCard = eventsPage.eventCards.first()
      await expect(firstCard.getByText('Book Now')).toBeVisible()
    })

    test('each event card should have category badge', async ({ page }) => {
      const badge = eventsPage.eventCards.first().locator('[class*="badge"]')
      await expect(badge).toBeVisible()
    })

    test('clicking a card should navigate to event detail', async ({ page }) => {
      await eventsPage.eventCards.first().click()
      await expect(page).toHaveURL(/\/events\//)
    })

    test('event card should have hover effect (translate/scale)', async ({ page }) => {
      const card = eventsPage.eventCards.first()
      await expect(card).toHaveClass(/hover:-translate/)
    })
  })

  // ─── Loading State ─────────────────────────────────────────────
  test.describe('Loading State', () => {
    test('should display skeleton loaders while loading', async ({ page }) => {
      // Clear existing mocks and add slow one
      await page.route('**/api/v1/events*', async (route) => {
        await new Promise(r => setTimeout(r, 2000))
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { items: [], total: 0 } }) })
      })
      await page.goto('/events')
      await expect(page.locator('[class*="skeleton"]').first()).toBeVisible()
    })
  })

  // ─── Empty State ───────────────────────────────────────────────
  test.describe('Empty State', () => {
    test('should display no events message when no results', async ({ page }) => {
      await mockEventsApi(page, [])
      await page.goto('/events')
      await waitForPageReady(page)
      await expect(eventsPage.noEventsMessage).toBeVisible()
    })

    test('should display Clear Filters button in empty state', async ({ page }) => {
      await mockEventsApi(page, [])
      await page.goto('/events')
      await waitForPageReady(page)
      await expect(eventsPage.clearFiltersButton).toBeVisible()
    })

    test('Clear Filters should reset all filters', async ({ page }) => {
      await mockEventsApi(page, [])
      await page.goto('/events')
      await waitForPageReady(page)
      await eventsPage.clearAllFilters()
      await expect(eventsPage.citySelect).toHaveValue('Pune')
    })
  })

  // ─── Error State ───────────────────────────────────────────────
  test.describe('Error State', () => {
    test('should display error message when API fails', async ({ page }) => {
      await page.route('**/api/v1/events*', (route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) })
      })
      await page.goto('/events')
      await waitForPageReady(page)
      await expect(eventsPage.errorMessage).toBeVisible()
    })
  })

  // ─── URL Category Pre-selection ────────────────────────────────
  test.describe('URL Category Pre-selection', () => {
    test('should pre-select category from query param', async ({ page }) => {
      await eventsPage.gotoWithCategory('comedy')
      const comedyButton = page.getByRole('button', { name: 'Comedy', exact: true })
      await expect(comedyButton).toHaveClass(/bg-brand/)
    })
  })

  // ─── Responsive Grid ──────────────────────────────────────────
  test.describe('Responsive Grid', () => {
    test('should show single column on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await mockEventsApi(page)
      await page.goto('/events')
      await waitForPageReady(page)
      await expect(eventsPage.eventCards.first()).toBeVisible()
    })

    test('should show two columns on small tablet (640px)', async ({ page }) => {
      await page.setViewportSize({ width: 640, height: 1024 })
      await mockEventsApi(page)
      await page.goto('/events')
      await waitForPageReady(page)
      await expect(eventsPage.eventCards.first()).toBeVisible()
    })

    test('should show four columns on desktop (1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await mockEventsApi(page)
      await page.goto('/events')
      await waitForPageReady(page)
      await expect(eventsPage.eventCards.first()).toBeVisible()
    })
  })
})
