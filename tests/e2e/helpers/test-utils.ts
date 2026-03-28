import { Page, expect } from '@playwright/test'
import { TEST_USERS, API_URL } from './constants'

type UserRole = keyof typeof TEST_USERS

/**
 * Mock the auth store in the browser to simulate a logged-in user.
 * This injects user data + tokens into Zustand's persisted localStorage state.
 */
export async function loginAs(page: Page, role: UserRole) {
  const user = TEST_USERS[role]
  const fakeToken = `fake_access_token_${role}_${Date.now()}`
  const fakeRefresh = `fake_refresh_token_${role}_${Date.now()}`

  await page.evaluate(
    ({ user, token, refresh }) => {
      const authState = {
        state: {
          user: {
            id: `test-${user.role}-id`,
            phone: `+91${user.phone}`,
            name: user.name,
            role: user.role,
            loyalty_coins: user.loyalty_coins,
            created_at: new Date().toISOString(),
          },
          accessToken: token,
          refreshToken: refresh,
        },
        version: 0,
      }
      localStorage.setItem('bookit-auth', JSON.stringify(authState))
    },
    { user, token: fakeToken, refresh: fakeRefresh }
  )
}

/**
 * Clear auth state to simulate a logged-out user.
 */
export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('bookit-auth')
  })
}

/**
 * Mock an API route with a custom response.
 */
export async function mockApiRoute(
  page: Page,
  method: string,
  urlPattern: string,
  responseBody: object,
  status = 200
) {
  await page.route(`${API_URL}${urlPattern}`, (route) => {
    if (route.request().method() === method.toUpperCase()) {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      })
    } else {
      route.continue()
    }
  })
}

/**
 * Mock the events list API with sample data.
 */
export async function mockEventsApi(page: Page, events: object[] = []) {
  const defaultEvents = events.length > 0 ? events : [
    {
      id: 'event-1',
      title: 'Comedy Night Live',
      category: 'comedy',
      city: 'Pune',
      venue_name: 'Phoenix Marketcity',
      starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      poster_url: null,
      min_price: 499,
      organisers: { business_name: 'LaughFactory' },
    },
    {
      id: 'event-2',
      title: 'Rock Fest 2026',
      category: 'music',
      city: 'Mumbai',
      venue_name: 'NSCI Dome',
      starts_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      poster_url: null,
      min_price: 999,
      organisers: { business_name: 'MusicWorld' },
    },
    {
      id: 'event-3',
      title: 'IPL Final Screening',
      category: 'sports',
      city: 'Pune',
      venue_name: 'MCA Stadium',
      starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      poster_url: null,
      min_price: 299,
      organisers: { business_name: 'SportsHub' },
    },
  ]

  await mockApiRoute(page, 'GET', '/events*', {
    success: true,
    data: { items: defaultEvents, total: defaultEvents.length, page: 1, limit: 20 },
  })
}

/**
 * Mock a single event detail API.
 */
export async function mockEventDetailApi(page: Page, eventId = 'event-1') {
  await mockApiRoute(page, 'GET', `/events/${eventId}`, {
    success: true,
    data: {
      id: eventId,
      title: 'Comedy Night Live',
      description: 'An evening of hilarious stand-up comedy featuring India\'s top comedians.',
      category: 'comedy',
      city: 'Pune',
      venue_name: 'Phoenix Marketcity',
      venue_address: 'Viman Nagar, Pune 411014',
      starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      poster_url: null,
      organisers: { business_name: 'LaughFactory' },
      seat_sections: [
        { id: 'sec-1', label: 'Silver', price: 499, available_seats: 50, total_seats: 100 },
        { id: 'sec-2', label: 'Gold', price: 999, available_seats: 5, total_seats: 50 },
        { id: 'sec-3', label: 'Platinum', price: 1999, available_seats: 0, total_seats: 20 },
      ],
    },
  })
}

/**
 * Mock seats API for a specific event/section.
 */
export async function mockSeatsApi(page: Page, eventId = 'event-1') {
  await mockApiRoute(page, 'GET', `/events/${eventId}/seats`, {
    success: true,
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `seat-${i + 1}`,
      section_id: 'sec-1',
      label: `${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`,
      status: i < 18 ? 'available' : 'booked',
      row_number: Math.floor(i / 5) + 1,
      col_number: (i % 5) + 1,
    })),
  })
}

/**
 * Mock the bookings list API.
 */
export async function mockBookingsApi(page: Page) {
  await mockApiRoute(page, 'GET', '/bookings', {
    success: true,
    data: [
      {
        id: 'booking-1',
        event_id: 'event-1',
        status: 'confirmed',
        total_amount: 998,
        created_at: new Date().toISOString(),
        events: {
          title: 'Comedy Night Live',
          venue_name: 'Phoenix Marketcity',
          city: 'Pune',
          starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          poster_url: null,
        },
        seat_count: 2,
      },
      {
        id: 'booking-2',
        event_id: 'event-2',
        status: 'pending',
        total_amount: 999,
        created_at: new Date().toISOString(),
        events: {
          title: 'Rock Fest 2026',
          venue_name: 'NSCI Dome',
          city: 'Mumbai',
          starts_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          poster_url: null,
        },
        seat_count: 1,
      },
    ],
  })
}

/**
 * Mock a single booking detail API.
 */
export async function mockBookingDetailApi(page: Page, bookingId = 'booking-1') {
  await mockApiRoute(page, 'GET', `/bookings/${bookingId}`, {
    success: true,
    data: {
      id: bookingId,
      event_id: 'event-1',
      total_amount: 1058,
      amount: 998,
      convenience_fee: 60,
      status: 'pending',
      qr_token: 'qr-token-test-123',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      seat_ids: ['seat-1', 'seat-2'],
      events: {
        title: 'Comedy Night Live',
        venue_name: 'Phoenix Marketcity',
        venue_address: 'Viman Nagar, Pune',
        city: 'Pune',
        starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        poster_url: null,
        organisers: { business_name: 'LaughFactory' },
      },
      seats: [
        { id: 'seat-1', label: 'A1', seat_sections: { label: 'Silver', price: 499 } },
        { id: 'seat-2', label: 'A2', seat_sections: { label: 'Silver', price: 499 } },
      ],
    },
  })
}

/**
 * Wait for a page to fully load including hydration.
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle')
  // Wait for Next.js hydration
  await page.waitForTimeout(500)
}

/**
 * Check that no console errors occurred during the test.
 */
export function setupConsoleErrorTracking(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

/**
 * Check that a toast notification appears with expected text.
 */
export async function expectToast(page: Page, text: string) {
  const toast = page.locator('[role="status"]').filter({ hasText: text })
  await expect(toast).toBeVisible({ timeout: 5000 })
}
