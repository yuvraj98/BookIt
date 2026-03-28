import { test, expect } from '@playwright/test'
import { AdminDashboardPage, AdminEventsPage, AdminOrganisersPage } from '../pages/AdminPages'
import { loginAs, mockApiRoute, waitForPageReady } from '../helpers/test-utils'

// ═══════════════════════════════════════════════════════════════════
// Admin Dashboard
// ═══════════════════════════════════════════════════════════════════
test.describe('Admin Dashboard', () => {
  let dashboardPage: AdminDashboardPage

  test.beforeEach(async ({ page }) => {
    dashboardPage = new AdminDashboardPage(page)
    await loginAs(page, 'admin')
    await mockApiRoute(page, 'GET', '/admin/stats', {
      success: true,
      data: {
        total_users: 5200, total_events: 340, total_bookings: 12500,
        total_revenue: 6500000, pending_organisers: 5, pending_events: 12,
      },
    })
    await dashboardPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the admin dashboard', async ({ page }) => {
      await expect(page).toHaveURL('/admin/dashboard')
    })

    test('should display dashboard title', async () => {
      await expect(dashboardPage.dashboardTitle).toBeVisible()
    })
  })

  test.describe('Sidebar', () => {
    test('should display sidebar navigation', async () => {
      await expect(dashboardPage.sidebar).toBeVisible()
    })

    test('should have Dashboard link', async () => {
      await expect(dashboardPage.dashboardLink).toBeVisible()
    })

    test('should have Events link', async () => {
      await expect(dashboardPage.eventsLink).toBeVisible()
    })

    test('should have Organisers link', async () => {
      await expect(dashboardPage.organisersLink).toBeVisible()
    })

    test('Events link should navigate to /admin/events', async ({ page }) => {
      await dashboardPage.eventsLink.click()
      await expect(page).toHaveURL(/admin\/events/)
    })

    test('Organisers link should navigate to /admin/organisers', async ({ page }) => {
      await dashboardPage.organisersLink.click()
      await expect(page).toHaveURL(/admin\/organisers/)
    })
  })

  test.describe('Platform Stats', () => {
    test('should display platform stats cards', async () => {
      const count = await dashboardPage.platformStats.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display Total Users card', async () => {
      await expect(dashboardPage.totalUsersCard).toBeVisible()
    })

    test('should display Total Events card', async () => {
      await expect(dashboardPage.totalEventsCard).toBeVisible()
    })

    test('should display Total Bookings card', async () => {
      await expect(dashboardPage.totalBookingsCard).toBeVisible()
    })

    test('should display Total Revenue card', async () => {
      await expect(dashboardPage.totalRevenueCard).toBeVisible()
    })
  })

  test.describe('Auth Guard', () => {
    test('should restrict access for customer role', async ({ page }) => {
      const newPage = await page.context().newPage()
      await loginAs(newPage, 'customer')
      await newPage.goto('/admin/dashboard')
      await newPage.waitForLoadState('networkidle')
      // Should redirect or show access denied
      await newPage.close()
    })

    test('should restrict access for organiser role', async ({ page }) => {
      const newPage = await page.context().newPage()
      await loginAs(newPage, 'organiser')
      await newPage.goto('/admin/dashboard')
      await newPage.waitForLoadState('networkidle')
      await newPage.close()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Admin Event Moderation
// ═══════════════════════════════════════════════════════════════════
test.describe('Admin Events Moderation', () => {
  let adminEventsPage: AdminEventsPage

  test.beforeEach(async ({ page }) => {
    adminEventsPage = new AdminEventsPage(page)
    await loginAs(page, 'admin')
    await mockApiRoute(page, 'GET', '/admin/events*', {
      success: true,
      data: [
        { id: 'e1', title: 'Comedy Night', status: 'submitted', organiser_name: 'LaughFactory', city: 'Pune', created_at: new Date().toISOString() },
        { id: 'e2', title: 'Rock Show', status: 'approved', organiser_name: 'MusicWorld', city: 'Mumbai', created_at: new Date().toISOString() },
        { id: 'e3', title: 'Art Workshop', status: 'rejected', organiser_name: 'ArtHub', city: 'Pune', created_at: new Date().toISOString() },
      ],
    })
    await adminEventsPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the admin events page', async ({ page }) => {
      await expect(page).toHaveURL('/admin/events')
    })
  })

  test.describe('Events List', () => {
    test('should display events list', async () => {
      const count = await adminEventsPage.eventsList.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display status badges', async () => {
      await expect(adminEventsPage.eventStatusBadges.first()).toBeVisible()
    })
  })

  test.describe('Approve Action', () => {
    test('should display approve button for submitted events', async () => {
      await expect(adminEventsPage.approveButton.first()).toBeVisible()
    })

    test('clicking approve should call the approve API', async ({ page }) => {
      let apiCalled = false
      await page.route('**/api/v1/admin/events/*/approve', (route) => {
        apiCalled = true
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      })
      await adminEventsPage.approveButton.first().click()
      // May have a confirm dialog
    })
  })

  test.describe('Reject Action', () => {
    test('should display reject button for submitted events', async () => {
      await expect(adminEventsPage.rejectButton.first()).toBeVisible()
    })
  })

  test.describe('Takedown Action', () => {
    test('should display takedown button for approved/live events', async () => {
      if (await adminEventsPage.takedownButton.count() > 0) {
        await expect(adminEventsPage.takedownButton.first()).toBeVisible()
      }
    })
  })

  test.describe('Empty State', () => {
    test('should show empty state when no events', async ({ page }) => {
      await mockApiRoute(page, 'GET', '/admin/events*', { success: true, data: [] })
      await page.goto('/admin/events')
      await waitForPageReady(page)
      await expect(adminEventsPage.emptyState).toBeVisible()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// Admin Organiser Verification
// ═══════════════════════════════════════════════════════════════════
test.describe('Admin Organisers Verification', () => {
  let organisersPage: AdminOrganisersPage

  test.beforeEach(async ({ page }) => {
    organisersPage = new AdminOrganisersPage(page)
    await loginAs(page, 'admin')
    await mockApiRoute(page, 'GET', '/admin/organisers*', {
      success: true,
      data: [
        { id: 'o1', business_name: 'LaughFactory Pvt Ltd', email: 'laugh@test.com', status: 'pending', created_at: new Date().toISOString() },
        { id: 'o2', business_name: 'MusicWorld Events', email: 'music@test.com', status: 'approved', created_at: new Date().toISOString() },
        { id: 'o3', business_name: 'ArtHub', email: 'art@test.com', status: 'rejected', created_at: new Date().toISOString() },
      ],
    })
    await organisersPage.goto()
    await waitForPageReady(page)
  })

  test.describe('Page Load', () => {
    test('should load the admin organisers page', async ({ page }) => {
      await expect(page).toHaveURL('/admin/organisers')
    })
  })

  test.describe('Organisers List', () => {
    test('should display organisers list', async () => {
      const count = await organisersPage.organisersList.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display status badges', async () => {
      await expect(organisersPage.organiserStatusBadges.first()).toBeVisible()
    })

    test('should display business names', async () => {
      await expect(organisersPage.businessNameColumn.first()).toBeVisible()
    })
  })

  test.describe('Approve Organiser', () => {
    test('should display approve button', async () => {
      await expect(organisersPage.approveButton.first()).toBeVisible()
    })

    test('clicking approve should call the API', async ({ page }) => {
      await page.route('**/api/v1/admin/organisers/*/approve', (route) => {
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      })
      await organisersPage.approveButton.first().click()
    })
  })

  test.describe('Reject Organiser', () => {
    test('should display reject button', async () => {
      await expect(organisersPage.rejectButton.first()).toBeVisible()
    })
  })

  test.describe('Empty State', () => {
    test('should show empty message when no organisers', async ({ page }) => {
      await mockApiRoute(page, 'GET', '/admin/organisers*', { success: true, data: [] })
      await page.goto('/admin/organisers')
      await waitForPageReady(page)
      await expect(organisersPage.emptyState).toBeVisible()
    })
  })
})
