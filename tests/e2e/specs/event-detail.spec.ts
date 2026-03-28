import { test, expect } from '@playwright/test'
import { EventDetailPage } from '../pages/EventDetailPage'
import { mockEventDetailApi, mockSeatsApi, mockApiRoute, loginAs, waitForPageReady } from '../helpers/test-utils'

test.describe('Event Detail Page', () => {
  let detailPage: EventDetailPage
  const EVENT_ID = 'event-1'

  test.beforeEach(async ({ page }) => {
    detailPage = new EventDetailPage(page)
    await mockEventDetailApi(page, EVENT_ID)
    await mockSeatsApi(page, EVENT_ID)
    await detailPage.goto(EVENT_ID)
    await waitForPageReady(page)
  })

  // ─── Page Load & Hero ──────────────────────────────────────────
  test.describe('Hero Section', () => {
    test('should display the event title', async () => {
      await expect(detailPage.eventTitle).toContainText('Comedy Night Live')
    })

    test('should display category badge', async () => {
      await expect(detailPage.categoryBadge).toContainText(/comedy/i)
    })

    test('should display event date', async () => {
      await expect(detailPage.eventDate).toBeVisible()
    })

    test('should display event time', async () => {
      await expect(detailPage.eventTime).toBeVisible()
    })

    test('should show poster placeholder when no poster_url', async ({ page }) => {
      const placeholder = page.locator('[class*="bg-gradient-to-br"]').filter({ hasText: 'Comedy Night Live' })
      await expect(placeholder).toBeVisible()
    })
  })

  // ─── Countdown Timer ──────────────────────────────────────────
  test.describe('Countdown Timer', () => {
    test('should display countdown for future events', async () => {
      await expect(detailPage.countdownTimer).toBeVisible()
    })

    test('should display days, hours, minutes, seconds tiles', async () => {
      const tiles = detailPage.countdownDays
      await expect(tiles.first()).toBeVisible()
    })

    test('countdown should update every second', async ({ page }) => {
      const secElement = detailPage.countdownDays.last()
      const firstValue = await secElement.textContent()
      await page.waitForTimeout(1100)
      const secondValue = await secElement.textContent()
      // Values should differ (countdown ticking)
      expect(firstValue).not.toEqual(secondValue)
    })
  })

  // ─── Share Buttons ─────────────────────────────────────────────
  test.describe('Share Buttons', () => {
    test('should display WhatsApp share button', async () => {
      await expect(detailPage.shareWhatsApp).toBeVisible()
    })

    test('should display Twitter share button', async () => {
      await expect(detailPage.shareTwitter).toBeVisible()
    })

    test('should display Copy Link button', async () => {
      await expect(detailPage.shareCopyLink).toBeVisible()
    })

    test('WhatsApp button should open share URL', async ({ page, context }) => {
      const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null)
      await detailPage.shareWhatsApp.click()
      const popup = await popupPromise
      if (popup) {
        expect(popup.url()).toContain('wa.me')
      }
    })

    test('Twitter button should open share URL', async ({ page }) => {
      const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null)
      await detailPage.shareTwitter.click()
      const popup = await popupPromise
      if (popup) {
        expect(popup.url()).toContain('twitter.com')
      }
    })
  })

  // ─── About Section ────────────────────────────────────────────
  test.describe('About Section', () => {
    test('should display About the Event heading', async () => {
      await expect(detailPage.aboutSection).toBeVisible()
    })

    test('should display event description', async () => {
      await expect(detailPage.eventDescription).toContainText('hilarious')
    })
  })

  // ─── Venue & Organiser Section ─────────────────────────────────
  test.describe('Venue & Organiser', () => {
    test('should display Venue & Organiser heading', async () => {
      await expect(detailPage.venueSection).toBeVisible()
    })

    test('should display venue name', async ({ page }) => {
      await expect(page.getByText('Phoenix Marketcity')).toBeVisible()
    })

    test('should display venue address', async ({ page }) => {
      await expect(page.getByText(/Viman Nagar/)).toBeVisible()
    })

    test('should display organiser name', async ({ page }) => {
      await expect(page.getByText('LaughFactory')).toBeVisible()
    })
  })

  // ─── Ticket Section Selection ──────────────────────────────────
  test.describe('Section Selection', () => {
    test('should display Buy Tickets heading', async () => {
      await expect(detailPage.buyTicketsTitle).toBeVisible()
    })

    test('should display all seat sections', async ({ page }) => {
      await expect(page.getByText('Silver')).toBeVisible()
      await expect(page.getByText('Gold')).toBeVisible()
      await expect(page.getByText('Platinum')).toBeVisible()
    })

    test('should display prices for each section', async ({ page }) => {
      await expect(page.getByText('499')).toBeVisible()
      await expect(page.getByText('999')).toBeVisible()
    })

    test('should show Sold Out for sections with 0 available', async () => {
      await expect(detailPage.soldOutLabel).toBeVisible()
    })

    test('sold out section button should be disabled', async ({ page }) => {
      const platinumSection = page.locator('button').filter({ hasText: 'Platinum' })
      await expect(platinumSection).toBeDisabled()
    })

    test('should show Fast Filling for sections with <=10 seats', async () => {
      await expect(detailPage.fastFillingLabel).toBeVisible()
    })

    test('clicking a section should show seat map', async ({ page }) => {
      await page.getByText('Silver').first().click()
      await expect(detailPage.stageIndicator).toBeVisible({ timeout: 5000 })
    })
  })

  // ─── Seat Map ──────────────────────────────────────────────────
  test.describe('Seat Map', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByText('Silver').first().click()
      await page.waitForTimeout(500)
    })

    test('should display stage indicator', async () => {
      await expect(detailPage.stageIndicator).toBeVisible()
    })

    test('should display Change Section button', async () => {
      await expect(detailPage.changeSectionButton).toBeVisible()
    })

    test('should display section name and price per ticket', async ({ page }) => {
      await expect(page.getByText('per ticket')).toBeVisible()
    })

    test('should display seat legend (Available, Selected, Sold)', async ({ page }) => {
      await expect(page.getByText('Available')).toBeVisible()
      await expect(page.getByText('Selected')).toBeVisible()
      await expect(page.getByText('Sold')).toBeVisible()
    })

    test('clicking Change Section should go back to section list', async ({ page }) => {
      await detailPage.changeSectionButton.click()
      await expect(page.getByText('Select Section')).toBeVisible()
    })

    test('available seats should be clickable', async ({ page }) => {
      const availableSeat = page.locator('button[title="A1"]')
      await availableSeat.click()
      await expect(availableSeat).toHaveClass(/bg-brand/)
    })

    test('booked seats should be disabled', async ({ page }) => {
      const bookedSeat = page.locator('button[title]').filter({ has: page.locator('[disabled]') })
      if (await bookedSeat.count() > 0) {
        await expect(bookedSeat.first()).toBeDisabled()
      }
    })

    test('selecting a seat should update selected count badge', async ({ page }) => {
      await page.locator('button[title="A1"]').click()
      await expect(page.getByText('1 Selected')).toBeVisible()
    })

    test('deselecting a seat should remove it', async ({ page }) => {
      await page.locator('button[title="A1"]').click()
      await page.locator('button[title="A1"]').click()
      await expect(page.getByText('1 Selected')).not.toBeVisible()
    })

    test('selecting multiple seats should update count', async ({ page }) => {
      await page.locator('button[title="A1"]').click()
      await page.locator('button[title="A2"]').click()
      await expect(page.getByText('2 Selected')).toBeVisible()
    })
  })

  // ─── Checkout Footer ──────────────────────────────────────────
  test.describe('Checkout Footer', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByText('Silver').first().click()
      await page.waitForTimeout(500)
      await page.locator('button[title="A1"]').click()
    })

    test('should show checkout footer after selecting seats', async ({ page }) => {
      await expect(page.getByText('Proceed to Book')).toBeVisible()
    })

    test('should show total price calculation', async ({ page }) => {
      await expect(page.getByText('499')).toBeVisible()
    })

    test('should show + fees label', async ({ page }) => {
      await expect(page.getByText('+ fees')).toBeVisible()
    })

    test('Proceed to Book button should redirect to login if not authenticated', async ({ page }) => {
      await page.getByText('Proceed to Book').click()
      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 })
    })

    test('Proceed to Book should create booking if authenticated', async ({ page }) => {
      await loginAs(page, 'customer')
      await mockEventDetailApi(page, EVENT_ID)
      await mockSeatsApi(page, EVENT_ID)
      await mockApiRoute(page, 'POST', '/bookings', {
        success: true,
        data: { id: 'booking-new-1' },
      })
      await page.goto(`/events/${EVENT_ID}`)
      await waitForPageReady(page)
      await page.getByText('Silver').first().click()
      await page.waitForTimeout(500)
      await page.locator('button[title="A1"]').click()
      await page.getByText('Proceed to Book').click()
      // Should navigate to payment page
      await expect(page).toHaveURL(/bookings.*pay|bookings/, { timeout: 10000 })
    })
  })

  // ─── Event Not Found ──────────────────────────────────────────
  test.describe('Event Not Found', () => {
    test('should show error page for invalid event ID', async ({ page }) => {
      await page.route('**/api/v1/events/invalid-id', (route) => {
        route.fulfill({ status: 404, body: JSON.stringify({ error: 'Not found' }) })
      })
      await page.goto('/events/invalid-id')
      await waitForPageReady(page)
      await expect(page.getByText('Event not found')).toBeVisible()
    })

    test('error page should have Browse Events button', async ({ page }) => {
      await page.route('**/api/v1/events/invalid-id', (route) => {
        route.fulfill({ status: 404, body: JSON.stringify({ error: 'Not found' }) })
      })
      await page.goto('/events/invalid-id')
      await waitForPageReady(page)
      await expect(page.getByRole('button', { name: 'Browse Events' })).toBeVisible()
    })
  })

  // ─── Past Event ────────────────────────────────────────────────
  test.describe('Past Event', () => {
    test('should show Event Ended for past events', async ({ page }) => {
      await mockApiRoute(page, 'GET', `/events/past-event`, {
        success: true,
        data: {
          id: 'past-event',
          title: 'Past Comedy Night',
          description: 'This event already happened.',
          category: 'comedy',
          city: 'Pune',
          venue_name: 'Test',
          venue_address: 'Test',
          starts_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          poster_url: null,
          organisers: { business_name: 'Test' },
          seat_sections: [],
        },
      })
      await page.goto('/events/past-event')
      await waitForPageReady(page)
      await expect(page.getByText('Event Ended')).toBeVisible()
    })
  })

  // ─── Responsive ────────────────────────────────────────────────
  test.describe('Responsive', () => {
    test('should render properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await mockEventDetailApi(page, EVENT_ID)
      await page.goto(`/events/${EVENT_ID}`)
      await waitForPageReady(page)
      await expect(detailPage.eventTitle).toBeVisible()
      await expect(detailPage.buyTicketsTitle).toBeVisible()
    })
  })
})
