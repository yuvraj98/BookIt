import { Page, Locator } from '@playwright/test'

export class ProfilePage {
  readonly page: Page
  readonly avatar: Locator
  readonly userName: Locator
  readonly userPhone: Locator
  readonly userRole: Locator
  readonly loyaltyCoins: Locator
  readonly editButton: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly myBookingsLink: Locator
  readonly quickLinks: Locator

  constructor(page: Page) {
    this.page = page
    this.avatar = page.locator('[class*="rounded-full"][class*="bg-gradient"]')
    this.userName = page.locator('h1, h2').filter({ hasText: /Test|User|BookIt/ }).first()
    this.userPhone = page.getByText(/\+91\d{10}/)
    this.userRole = page.locator('[class*="badge"]').filter({ hasText: /customer|organiser|admin/i })
    this.loyaltyCoins = page.locator('[class*="amber"]').filter({ hasText: /\d+/ })
    this.editButton = page.getByRole('button', { name: /edit|update/i })
    this.nameInput = page.getByLabel(/name/i)
    this.emailInput = page.getByLabel(/email/i)
    this.saveButton = page.getByRole('button', { name: /save|update/i })
    this.cancelButton = page.getByRole('button', { name: /cancel/i })
    this.myBookingsLink = page.getByRole('link', { name: /bookings/i })
    this.quickLinks = page.locator('a[href*="/profile"], a[href*="/organiser"], a[href*="/admin"]')
  }

  async goto() {
    await this.page.goto('/profile')
    await this.page.waitForLoadState('networkidle')
  }

  async editProfile(name: string, email?: string) {
    await this.editButton.click()
    await this.nameInput.fill(name)
    if (email) await this.emailInput.fill(email)
    await this.saveButton.click()
  }
}

export class BookingsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly bookingCards: Locator
  readonly confirmedBadge: Locator
  readonly pendingBadge: Locator
  readonly cancelledBadge: Locator
  readonly emptyState: Locator
  readonly browseEventsLink: Locator
  readonly bookingEventTitle: Locator
  readonly bookingAmount: Locator
  readonly bookingDate: Locator
  readonly viewTicketButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText(/My Bookings|Booking History/i)
    this.bookingCards = page.locator('[class*="card"]').filter({ has: page.locator('[class*="badge"]') })
    this.confirmedBadge = page.locator('[class*="badge"]').filter({ hasText: /confirmed/i })
    this.pendingBadge = page.locator('[class*="badge"]').filter({ hasText: /pending/i })
    this.cancelledBadge = page.locator('[class*="badge"]').filter({ hasText: /cancelled/i })
    this.emptyState = page.getByText(/no bookings/i)
    this.browseEventsLink = page.getByRole('link', { name: /browse events/i })
    this.bookingEventTitle = page.locator('h3, h4').filter({ hasText: /Comedy|Rock|IPL/ })
    this.bookingAmount = page.locator('[class*="font-bold"]').filter({ hasText: /₹|\d+/ })
    this.bookingDate = page.locator('[class*="text-muted"]').filter({ hasText: /\d{1,2}/ })
    this.viewTicketButton = page.getByRole('link', { name: /view.*ticket|details/i })
  }

  async goto() {
    await this.page.goto('/profile/bookings')
    await this.page.waitForLoadState('networkidle')
  }

  async clickBooking(index: number) {
    await this.bookingCards.nth(index).click()
  }
}

export class BookingDetailPage {
  readonly page: Page
  readonly eventTitle: Locator
  readonly bookingId: Locator
  readonly qrCode: Locator
  readonly seatInfo: Locator
  readonly venueInfo: Locator
  readonly dateInfo: Locator
  readonly statusBadge: Locator
  readonly cancelButton: Locator
  readonly downloadButton: Locator

  constructor(page: Page) {
    this.page = page
    this.eventTitle = page.locator('h1, h2').first()
    this.bookingId = page.getByText(/booking.*id|#/i)
    this.qrCode = page.locator('canvas, [class*="qr"], svg')
    this.seatInfo = page.getByText(/seat|section/i)
    this.venueInfo = page.getByText(/venue|location/i)
    this.dateInfo = page.locator('[class*="text-muted"]').filter({ hasText: /\d{4}/ })
    this.statusBadge = page.locator('[class*="badge"]').first()
    this.cancelButton = page.getByRole('button', { name: /cancel/i })
    this.downloadButton = page.getByRole('button', { name: /download/i })
  }

  async goto(bookingId: string) {
    await this.page.goto(`/profile/bookings/${bookingId}`)
    await this.page.waitForLoadState('networkidle')
  }
}
