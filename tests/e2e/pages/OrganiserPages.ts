import { Page, Locator } from '@playwright/test'

// ─── Organiser Registration ───────────────────────────────────────
export class OrganiserRegisterPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly businessNameInput: Locator
  readonly businessTypeSelect: Locator
  readonly contactEmailInput: Locator
  readonly contactPhoneInput: Locator
  readonly panInput: Locator
  readonly gstInput: Locator
  readonly bankAccountInput: Locator
  readonly ifscInput: Locator
  readonly bankNameInput: Locator
  readonly submitButton: Locator
  readonly formErrors: Locator
  readonly successMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/become.*organiser|register.*organiser/i)
    this.businessNameInput = page.getByLabel(/business.*name/i)
    this.businessTypeSelect = page.getByLabel(/business.*type/i)
    this.contactEmailInput = page.getByLabel(/email/i)
    this.contactPhoneInput = page.getByLabel(/phone/i)
    this.panInput = page.getByLabel(/pan/i)
    this.gstInput = page.getByLabel(/gst/i)
    this.bankAccountInput = page.getByLabel(/account.*number/i)
    this.ifscInput = page.getByLabel(/ifsc/i)
    this.bankNameInput = page.getByLabel(/bank.*name/i)
    this.submitButton = page.getByRole('button', { name: /submit|register|apply/i })
    this.formErrors = page.locator('[class*="text-red"], [class*="text-brand-400"]')
    this.successMessage = page.getByText(/submitted|registered|success/i)
  }

  async goto() {
    await this.page.goto('/organiser/register')
    await this.page.waitForLoadState('networkidle')
  }
}

// ─── Organiser Dashboard ──────────────────────────────────────────
export class OrganiserDashboardPage {
  readonly page: Page
  readonly sidebar: Locator
  readonly dashboardLink: Locator
  readonly eventsLink: Locator
  readonly analyticsLink: Locator
  readonly dashboardTitle: Locator
  readonly statCards: Locator
  readonly totalEventsCard: Locator
  readonly totalBookingsCard: Locator
  readonly totalRevenueCard: Locator
  readonly recentEvents: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.locator('nav, aside').filter({ hasText: /dashboard/i })
    this.dashboardLink = page.getByRole('link', { name: /dashboard/i })
    this.eventsLink = page.getByRole('link', { name: /events/i })
    this.analyticsLink = page.getByRole('link', { name: /analytics/i })
    this.dashboardTitle = page.getByText(/dashboard/i).first()
    this.statCards = page.locator('[class*="card"]').filter({ has: page.locator('[class*="font-display"]') })
    this.totalEventsCard = page.getByText(/total.*events/i).locator('..')
    this.totalBookingsCard = page.getByText(/total.*bookings/i).locator('..')
    this.totalRevenueCard = page.getByText(/total.*revenue/i).locator('..')
    this.recentEvents = page.locator('[class*="card"]').filter({ has: page.locator('h3, h4') })
  }

  async goto() {
    await this.page.goto('/organiser/dashboard')
    await this.page.waitForLoadState('networkidle')
  }
}

// ─── Organiser Events ─────────────────────────────────────────────
export class OrganiserEventsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly createEventButton: Locator
  readonly eventsList: Locator
  readonly eventStatusBadges: Locator
  readonly filterTabs: Locator
  readonly submitButton: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/my events|manage events/i)
    this.createEventButton = page.getByRole('link', { name: /create.*event|new.*event/i })
    this.eventsList = page.locator('[class*="card"]').filter({ has: page.locator('[class*="badge"]') })
    this.eventStatusBadges = page.locator('[class*="badge"]').filter({ hasText: /draft|submitted|approved|rejected|live/i })
    this.filterTabs = page.locator('button').filter({ hasText: /all|draft|live|submitted/i })
    this.submitButton = page.getByRole('button', { name: /submit.*approval/i })
    this.emptyState = page.getByText(/no events/i)
  }

  async goto() {
    await this.page.goto('/organiser/events')
    await this.page.waitForLoadState('networkidle')
  }
}

// ─── Event Creation Form ──────────────────────────────────────────
export class EventCreationPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly categorySelect: Locator
  readonly cityInput: Locator
  readonly venueNameInput: Locator
  readonly venueAddressInput: Locator
  readonly dateInput: Locator
  readonly timeInput: Locator
  readonly addSectionButton: Locator
  readonly sectionLabelInput: Locator
  readonly sectionPriceInput: Locator
  readonly sectionCapacityInput: Locator
  readonly removeSectionButton: Locator
  readonly submitButton: Locator
  readonly saveDraftButton: Locator
  readonly formErrors: Locator
  readonly imageUpload: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/create.*event|new.*event/i)
    this.titleInput = page.getByLabel(/event.*title|title/i)
    this.descriptionInput = page.getByLabel(/description/i)
    this.categorySelect = page.getByLabel(/category/i)
    this.cityInput = page.getByLabel(/city/i)
    this.venueNameInput = page.getByLabel(/venue.*name/i)
    this.venueAddressInput = page.getByLabel(/venue.*address|address/i)
    this.dateInput = page.getByLabel(/date/i)
    this.timeInput = page.getByLabel(/time/i)
    this.addSectionButton = page.getByRole('button', { name: /add.*section/i })
    this.sectionLabelInput = page.getByLabel(/section.*name|label/i)
    this.sectionPriceInput = page.getByLabel(/price/i)
    this.sectionCapacityInput = page.getByLabel(/capacity|seats/i)
    this.removeSectionButton = page.getByRole('button', { name: /remove.*section|delete.*section/i })
    this.submitButton = page.getByRole('button', { name: /create|submit/i })
    this.saveDraftButton = page.getByRole('button', { name: /save.*draft/i })
    this.formErrors = page.locator('[class*="text-red"], [class*="error"]')
    this.imageUpload = page.locator('input[type="file"]')
  }

  async goto() {
    await this.page.goto('/organiser/events/new')
    await this.page.waitForLoadState('networkidle')
  }
}

// ─── Organiser Analytics ──────────────────────────────────────────
export class OrganiserAnalyticsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly revenueCards: Locator
  readonly eventBreakdown: Locator
  readonly commissionInfo: Locator
  readonly netPayoutInfo: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/analytics|revenue/i).first()
    this.revenueCards = page.locator('[class*="card"]').filter({ has: page.locator('[class*="font-display"]') })
    this.eventBreakdown = page.locator('[class*="card"]').filter({ hasText: /event.*revenue|per.*event/i })
    this.commissionInfo = page.getByText(/commission/i)
    this.netPayoutInfo = page.getByText(/net.*payout/i)
    this.emptyState = page.getByText(/no.*analytics|no.*data/i)
  }

  async goto() {
    await this.page.goto('/organiser/analytics')
    await this.page.waitForLoadState('networkidle')
  }
}
