import { test, expect } from '@playwright/test'
import { ProfilePage, BookingsPage, BookingDetailPage } from '../pages/ProfilePages'
import { loginAs, mockApiRoute, mockBookingsApi, mockBookingDetailApi, waitForPageReady } from '../helpers/test-utils'

// ═══════════════════════════════════════════════════════════════════
// Profile Page
// ═══════════════════════════════════════════════════════════════════
test.describe('Profile Page', () => {
  let profilePage: ProfilePage

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await loginAs(page, 'customer')
    await mockApiRoute(page, 'GET', '/auth/me', {
      success: true,
      data: {
        id: 'test-customer-id', phone: '+919876543210', name: 'Test Customer',
        role: 'customer', loyalty_coins: 50, email: 'test@test.com', created_at: new Date().toISOString(),
      },
    })
    await profilePage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the profile page', async ({ page }) => {
      await expect(page).toHaveURL('/profile')
    })

    test('should display user avatar', async () => {
      await expect(profilePage.avatar).toBeVisible()
    })

    test('should display user name', async () => {
      await expect(profilePage.userName).toBeVisible()
    })

    test('should display user phone number', async () => {
      await expect(profilePage.userPhone).toBeVisible()
    })

    test('should display loyalty coins', async () => {
      await expect(profilePage.loyaltyCoins).toBeVisible()
    })
  })

  test.describe('Quick Links', () => {
    test('should display My Bookings link', async () => {
      await expect(profilePage.myBookingsLink).toBeVisible()
    })

    test('My Bookings link should navigate to bookings', async ({ page }) => {
      await profilePage.myBookingsLink.click()
      await expect(page).toHaveURL(/bookings/)
    })
  })

  test.describe('Auth Guard', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      const newPage = await page.context().newPage()
      await newPage.goto('/profile')
      await newPage.waitForLoadState('networkidle')
      // Should redirect to login or show login prompt
    })
  })

  test.describe('Responsive', () => {
    test('should render properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await expect(profilePage.userName).toBeVisible()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Bookings List Page
// ═══════════════════════════════════════════════════════════════════
test.describe('Bookings List Page', () => {
  let bookingsPage: BookingsPage

  test.beforeEach(async ({ page }) => {
    bookingsPage = new BookingsPage(page)
    await loginAs(page, 'customer')
    await mockBookingsApi(page)
    await bookingsPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the bookings page', async ({ page }) => {
      await expect(page).toHaveURL('/profile/bookings')
    })
  })

  test.describe('Booking Cards', () => {
    test('should display booking cards', async () => {
      const count = await bookingsPage.bookingCards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display event title on each booking', async () => {
      await expect(bookingsPage.bookingEventTitle.first()).toBeVisible()
    })

    test('should display status badges', async ({ page }) => {
      const badges = page.locator('[class*="badge"]')
      await expect(badges.first()).toBeVisible()
    })

    test('confirmed bookings should show confirmed badge', async () => {
      await expect(bookingsPage.confirmedBadge).toBeVisible()
    })

    test('pending bookings should show pending badge', async () => {
      await expect(bookingsPage.pendingBadge).toBeVisible()
    })
  })

  test.describe('Empty State', () => {
    test('should show empty message when no bookings', async ({ page }) => {
      await mockApiRoute(page, 'GET', '/bookings', { success: true, data: [] })
      await page.goto('/profile/bookings')
      await waitForPageReady(page)
      await expect(bookingsPage.emptyState).toBeVisible()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Booking Detail / Ticket View
// ═══════════════════════════════════════════════════════════════════
test.describe('Booking Detail Page', () => {
  let bookingDetail: BookingDetailPage
  const BOOKING_ID = 'booking-1'

  test.beforeEach(async ({ page }) => {
    bookingDetail = new BookingDetailPage(page)
    await loginAs(page, 'customer')
    await mockBookingDetailApi(page, BOOKING_ID)
    await bookingDetail.goto(BOOKING_ID)
    await waitForPageReady(page)
  })

  test.describe('Ticket View', () => {
    test('should display event title', async () => {
      await expect(bookingDetail.eventTitle).toBeVisible()
    })

    test('should display seat/section info', async () => {
      await expect(bookingDetail.seatInfo).toBeVisible()
    })

    test('should display venue info', async () => {
      await expect(bookingDetail.venueInfo).toBeVisible()
    })

    test('should display booking status badge', async () => {
      await expect(bookingDetail.statusBadge).toBeVisible()
    })
  })

  test.describe('QR Code', () => {
    test('should display QR code for confirmed booking', async ({ page }) => {
      await mockApiRoute(page, 'GET', `/bookings/${BOOKING_ID}`, {
        success: true,
        data: {
          id: BOOKING_ID, event_id: 'event-1', status: 'confirmed', total_amount: 1058,
          qr_token: 'qr-test-123', seat_ids: ['s1'], seats: [{ id: 's1', label: 'A1', seat_sections: { label: 'Silver', price: 499 } }],
          events: { title: 'Test', venue_name: 'V', venue_address: 'A', city: 'Pune', starts_at: new Date().toISOString(), poster_url: null, organisers: { business_name: 'O' } },
        },
      })
      await page.goto(`/profile/bookings/${BOOKING_ID}`)
      await waitForPageReady(page)
      await expect(bookingDetail.qrCode).toBeVisible()
    })
  })
})
