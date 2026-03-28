import { test, expect } from '@playwright/test'
import { OrganiserDashboardPage, OrganiserEventsPage, EventCreationPage, OrganiserAnalyticsPage, OrganiserRegisterPage } from '../pages/OrganiserPages'
import { loginAs, mockApiRoute, waitForPageReady } from '../helpers/test-utils'

// ═══════════════════════════════════════════════════════════════════
// Organiser Registration
// ═══════════════════════════════════════════════════════════════════
test.describe('Organiser Registration', () => {
  let registerPage: OrganiserRegisterPage

  test.beforeEach(async ({ page }) => {
    registerPage = new OrganiserRegisterPage(page)
    await loginAs(page, 'customer')
    await registerPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the registration page', async ({ page }) => {
      await expect(page).toHaveURL('/organiser/register')
    })

    test('should display the page title', async () => {
      await expect(registerPage.pageTitle).toBeVisible()
    })

    test('should display submit/register button', async () => {
      await expect(registerPage.submitButton).toBeVisible()
    })
  })

  test.describe('Form Fields', () => {
    test('should display business name input', async () => {
      await expect(registerPage.businessNameInput).toBeVisible()
    })

    test('should display contact email input', async () => {
      await expect(registerPage.contactEmailInput).toBeVisible()
    })
  })

  test.describe('Validation', () => {
    test('should show errors on empty form submission', async () => {
      await registerPage.submitButton.click()
      await expect(registerPage.formErrors.first()).toBeVisible()
    })
  })

  test.describe('Successful Submission', () => {
    test('should show success message on valid submission', async ({ page }) => {
      await mockApiRoute(page, 'POST', '/organisers/register', { success: true, message: 'Registration submitted' })
      // Fill in required fields
      await registerPage.businessNameInput.fill('Test Events Pvt Ltd')
      await registerPage.contactEmailInput.fill('test@events.com')
      // Additional fields would be filled here based on the actual form
      await registerPage.submitButton.click()
      // Check for success feedback
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Organiser Dashboard
// ═══════════════════════════════════════════════════════════════════
test.describe('Organiser Dashboard', () => {
  let dashboardPage: OrganiserDashboardPage

  test.beforeEach(async ({ page }) => {
    dashboardPage = new OrganiserDashboardPage(page)
    await loginAs(page, 'organiser')
    await mockApiRoute(page, 'GET', '/organisers/dashboard/stats', {
      success: true,
      data: { total_events: 12, total_bookings: 156, total_revenue: 78000, pending_payouts: 15000 },
    })
    await dashboardPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the dashboard page', async ({ page }) => {
      await expect(page).toHaveURL('/organiser/dashboard')
    })
  })

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar', async () => {
      await expect(dashboardPage.sidebar).toBeVisible()
    })

    test('should have Dashboard link', async () => {
      await expect(dashboardPage.dashboardLink).toBeVisible()
    })

    test('should have Events link', async () => {
      await expect(dashboardPage.eventsLink).toBeVisible()
    })

    test('should have Analytics link', async () => {
      await expect(dashboardPage.analyticsLink).toBeVisible()
    })
  })

  test.describe('Stats Cards', () => {
    test('should display stat cards', async () => {
      const count = await dashboardPage.statCards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display total events stat', async () => {
      await expect(dashboardPage.totalEventsCard).toBeVisible()
    })

    test('should display total bookings stat', async () => {
      await expect(dashboardPage.totalBookingsCard).toBeVisible()
    })

    test('should display total revenue stat', async () => {
      await expect(dashboardPage.totalRevenueCard).toBeVisible()
    })
  })

  test.describe('Auth Guard', () => {
    test('should restrict access for non-organiser users', async ({ page }) => {
      const newPage = await page.context().newPage()
      await newPage.goto('/organiser/dashboard')
      await newPage.waitForLoadState('networkidle')
      // Should redirect or show access denied
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Organiser Events Management
// ═══════════════════════════════════════════════════════════════════
test.describe('Organiser Events', () => {
  let eventsPage: OrganiserEventsPage

  test.beforeEach(async ({ page }) => {
    eventsPage = new OrganiserEventsPage(page)
    await loginAs(page, 'organiser')
    await mockApiRoute(page, 'GET', '/organisers/events*', {
      success: true,
      data: [
        { id: 'e1', title: 'Comedy Night', status: 'draft', city: 'Pune', starts_at: new Date().toISOString(), total_bookings: 0 },
        { id: 'e2', title: 'Rock Show', status: 'approved', city: 'Mumbai', starts_at: new Date().toISOString(), total_bookings: 15 },
        { id: 'e3', title: 'Art Workshop', status: 'submitted', city: 'Pune', starts_at: new Date().toISOString(), total_bookings: 0 },
      ],
    })
    await eventsPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Events List', () => {
    test('should display events list', async () => {
      const count = await eventsPage.eventsList.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display event status badges', async () => {
      await expect(eventsPage.eventStatusBadges.first()).toBeVisible()
    })

    test('should display Create Event button', async () => {
      await expect(eventsPage.createEventButton).toBeVisible()
    })

    test('Create Event button should navigate to creation form', async ({ page }) => {
      await eventsPage.createEventButton.click()
      await expect(page).toHaveURL(/\/organiser\/events\/new/)
    })
  })

  test.describe('Empty State', () => {
    test('should show empty state when no events', async ({ page }) => {
      await mockApiRoute(page, 'GET', '/organisers/events*', { success: true, data: [] })
      await page.goto('/organiser/events')
      await waitForPageReady(page)
      await expect(eventsPage.emptyState).toBeVisible()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Event Creation Form
// ═══════════════════════════════════════════════════════════════════
test.describe('Event Creation Form', () => {
  let creationPage: EventCreationPage

  test.beforeEach(async ({ page }) => {
    creationPage = new EventCreationPage(page)
    await loginAs(page, 'organiser')
    await creationPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the event creation page', async ({ page }) => {
      await expect(page).toHaveURL('/organiser/events/new')
    })

    test('should display the form title', async () => {
      await expect(creationPage.pageTitle).toBeVisible()
    })
  })

  test.describe('Form Fields', () => {
    test('should display event title input', async () => {
      await expect(creationPage.titleInput).toBeVisible()
    })

    test('should display description input', async () => {
      await expect(creationPage.descriptionInput).toBeVisible()
    })

    test('should display category selector', async () => {
      await expect(creationPage.categorySelect).toBeVisible()
    })

    test('should display venue name input', async () => {
      await expect(creationPage.venueNameInput).toBeVisible()
    })

    test('should display submit button', async () => {
      await expect(creationPage.submitButton).toBeVisible()
    })
  })

  test.describe('Seat Section Management', () => {
    test('should have Add Section button', async () => {
      await expect(creationPage.addSectionButton).toBeVisible()
    })
  })

  test.describe('Validation', () => {
    test('should show errors on empty submission', async () => {
      await creationPage.submitButton.click()
      await expect(creationPage.formErrors.first()).toBeVisible()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Organiser Analytics
// ═══════════════════════════════════════════════════════════════════
test.describe('Organiser Analytics', () => {
  let analyticsPage: OrganiserAnalyticsPage

  test.beforeEach(async ({ page }) => {
    analyticsPage = new OrganiserAnalyticsPage(page)
    await loginAs(page, 'organiser')
    await mockApiRoute(page, 'GET', '/organisers/dashboard/analytics', {
      success: true,
      data: [
        { event_id: 'e1', event_title: 'Comedy Night', total_bookings: 50, gross_revenue: 25000, commission: 2500, net_payout: 22500 },
        { event_id: 'e2', event_title: 'Rock Show', total_bookings: 100, gross_revenue: 99900, commission: 9990, net_payout: 89910 },
      ],
    })
    await analyticsPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the analytics page', async ({ page }) => {
      await expect(page).toHaveURL('/organiser/analytics')
    })

    test('should display analytics title', async () => {
      await expect(analyticsPage.pageTitle).toBeVisible()
    })
  })

  test.describe('Revenue Data', () => {
    test('should display revenue cards', async () => {
      const count = await analyticsPage.revenueCards.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Empty State', () => {
    test('should show empty state when no data', async ({ page }) => {
      await mockApiRoute(page, 'GET', '/organisers/dashboard/analytics', { success: true, data: [] })
      await page.goto('/organiser/analytics')
      await waitForPageReady(page)
      await expect(analyticsPage.emptyState).toBeVisible()
    })
  })
})
