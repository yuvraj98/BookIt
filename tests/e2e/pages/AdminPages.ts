import { Page, Locator } from '@playwright/test'

// ─── Admin Dashboard ──────────────────────────────────────────────
export class AdminDashboardPage {
  readonly page: Page
  readonly sidebar: Locator
  readonly dashboardLink: Locator
  readonly eventsLink: Locator
  readonly organisersLink: Locator
  readonly dashboardTitle: Locator
  readonly platformStats: Locator
  readonly totalUsersCard: Locator
  readonly totalEventsCard: Locator
  readonly totalBookingsCard: Locator
  readonly totalRevenueCard: Locator
  readonly auditLog: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.locator('nav, aside').filter({ hasText: /admin|dashboard/i })
    this.dashboardLink = page.getByRole('link', { name: /dashboard/i })
    this.eventsLink = page.getByRole('link', { name: /events/i })
    this.organisersLink = page.getByRole('link', { name: /organisers/i })
    this.dashboardTitle = page.getByText(/admin.*control|dashboard/i).first()
    this.platformStats = page.locator('[class*="card"]').filter({ has: page.locator('[class*="font-display"]') })
    this.totalUsersCard = page.getByText(/total.*users/i).locator('..')
    this.totalEventsCard = page.getByText(/total.*events/i).locator('..')
    this.totalBookingsCard = page.getByText(/total.*bookings/i).locator('..')
    this.totalRevenueCard = page.getByText(/total.*revenue/i).locator('..')
    this.auditLog = page.getByText(/audit.*log|recent.*activity/i).locator('..')
  }

  async goto() {
    await this.page.goto('/admin/dashboard')
    await this.page.waitForLoadState('networkidle')
  }
}

// ─── Admin Events Moderation ──────────────────────────────────────
export class AdminEventsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly eventsList: Locator
  readonly filterTabs: Locator
  readonly approveButton: Locator
  readonly rejectButton: Locator
  readonly takedownButton: Locator
  readonly eventStatusBadges: Locator
  readonly searchInput: Locator
  readonly emptyState: Locator
  readonly confirmDialog: Locator
  readonly confirmButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/moderate.*events|event.*moderation/i)
    this.eventsList = page.locator('[class*="card"]').filter({ has: page.locator('[class*="badge"]') })
    this.filterTabs = page.locator('button').filter({ hasText: /all|pending|approved|rejected|live/i })
    this.approveButton = page.getByRole('button', { name: /approve/i })
    this.rejectButton = page.getByRole('button', { name: /reject/i })
    this.takedownButton = page.getByRole('button', { name: /take.*down/i })
    this.eventStatusBadges = page.locator('[class*="badge"]')
    this.searchInput = page.getByPlaceholder(/search/i)
    this.emptyState = page.getByText(/no events/i)
    this.confirmDialog = page.locator('[role="dialog"], [class*="modal"]')
    this.confirmButton = page.getByRole('button', { name: /confirm|yes/i })
    this.cancelButton = page.getByRole('button', { name: /cancel|no/i })
  }

  async goto() {
    await this.page.goto('/admin/events')
    await this.page.waitForLoadState('networkidle')
  }

  async approveEvent(index: number) {
    await this.approveButton.nth(index).click()
  }

  async rejectEvent(index: number) {
    await this.rejectButton.nth(index).click()
  }
}

// ─── Admin Organisers Verification ────────────────────────────────
export class AdminOrganisersPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly organisersList: Locator
  readonly filterTabs: Locator
  readonly approveButton: Locator
  readonly rejectButton: Locator
  readonly organiserStatusBadges: Locator
  readonly businessNameColumn: Locator
  readonly emailColumn: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/verify.*organiser|organiser.*verification/i)
    this.organisersList = page.locator('[class*="card"], tr').filter({ has: page.locator('[class*="badge"]') })
    this.filterTabs = page.locator('button').filter({ hasText: /all|pending|approved|rejected/i })
    this.approveButton = page.getByRole('button', { name: /approve|verify/i })
    this.rejectButton = page.getByRole('button', { name: /reject/i })
    this.organiserStatusBadges = page.locator('[class*="badge"]')
    this.businessNameColumn = page.locator('td, [class*="font-bold"]').filter({ hasText: /Ltd|Pvt|Events/i })
    this.emailColumn = page.locator('td, span').filter({ hasText: /@/ })
    this.emptyState = page.getByText(/no organisers/i)
  }

  async goto() {
    await this.page.goto('/admin/organisers')
    await this.page.waitForLoadState('networkidle')
  }
}
