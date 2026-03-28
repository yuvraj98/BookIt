import { Page, Locator, expect } from '@playwright/test'

export class EventDetailPage {
  readonly page: Page
  // Hero section
  readonly eventTitle: Locator
  readonly categoryBadge: Locator
  readonly completedBadge: Locator
  readonly eventDate: Locator
  readonly eventTime: Locator
  // Countdown
  readonly countdownTimer: Locator
  readonly countdownDays: Locator
  readonly eventEndedText: Locator
  // Share
  readonly shareWhatsApp: Locator
  readonly shareTwitter: Locator
  readonly shareCopyLink: Locator
  // About
  readonly aboutSection: Locator
  readonly eventDescription: Locator
  // Venue
  readonly venueSection: Locator
  readonly venueName: Locator
  readonly venueAddress: Locator
  readonly organiserName: Locator
  // Ticketing
  readonly buyTicketsTitle: Locator
  readonly seatSections: Locator
  readonly selectedCount: Locator
  readonly soldOutLabel: Locator
  readonly fastFillingLabel: Locator
  // Seat map
  readonly changeSectionButton: Locator
  readonly sectionTitle: Locator
  readonly sectionPrice: Locator
  readonly seatGrid: Locator
  readonly availableSeats: Locator
  readonly bookedSeats: Locator
  readonly selectedSeats: Locator
  readonly seatLegend: Locator
  readonly stageIndicator: Locator
  // Checkout
  readonly checkoutFooter: Locator
  readonly totalPrice: Locator
  readonly proceedButton: Locator
  readonly bookingSpinner: Locator
  // Error
  readonly eventNotFound: Locator
  readonly browseEventsButton: Locator
  // Loading
  readonly loadingSkeleton: Locator

  constructor(page: Page) {
    this.page = page
    // Hero
    this.eventTitle = page.locator('h1[class*="font-display"]')
    this.categoryBadge = page.locator('[class*="badge-brand"]').first()
    this.completedBadge = page.getByText('Completed')
    this.eventDate = page.locator('[class*="font-medium"]').filter({ has: page.locator('[class*="text-brand"]') }).first()
    this.eventTime = page.locator('[class*="font-medium"]').filter({ has: page.locator('[class*="blue"]') }).first()
    // Countdown
    this.countdownTimer = page.locator('text=Starts in').locator('..')
    this.countdownDays = page.locator('[class*="tabular-nums"]')
    this.eventEndedText = page.getByText('Event has ended')
    // Share
    this.shareWhatsApp = page.locator('button[title="Share on WhatsApp"]')
    this.shareTwitter = page.locator('button[title="Share on Twitter"]')
    this.shareCopyLink = page.locator('button[title="Copy Link"]')
    // About
    this.aboutSection = page.getByText('About the Event').locator('..')
    this.eventDescription = page.locator('[class*="prose"]')
    // Venue
    this.venueSection = page.getByText('Venue & Organiser').locator('..')
    this.venueName = page.locator('h4[class*="font-bold"]').first()
    this.venueAddress = page.locator('[class*="text-text-muted"]')
    this.organiserName = page.locator('h4[class*="font-bold"]').last()
    // Ticketing
    this.buyTicketsTitle = page.getByText('Buy Tickets')
    this.seatSections = page.locator('button').filter({ has: page.locator('[class*="IndianRupee"], [class*="font-bold"]') })
    this.selectedCount = page.locator('[class*="badge-brand"]').filter({ hasText: /Selected/ })
    this.soldOutLabel = page.getByText('Sold Out')
    this.fastFillingLabel = page.getByText('Fast filling')
    // Seat map
    this.changeSectionButton = page.getByText('← Change Section')
    this.sectionTitle = page.locator('h3[class*="font-display"]')
    this.sectionPrice = page.locator('[class*="text-2xl"]').filter({ has: page.locator('[class*="IndianRupee"]') })
    this.seatGrid = page.locator('[class*="bg-surface-900"][class*="rounded-2xl"]')
    this.availableSeats = page.locator('button[class*="bg-surface-800"]')
    this.bookedSeats = page.locator('button[class*="bg-surface-700"][disabled]')
    this.selectedSeats = page.locator('button[class*="bg-brand-500"]')
    this.seatLegend = page.locator('text=Available').locator('..')
    this.stageIndicator = page.getByText('Stage')
    // Checkout
    this.checkoutFooter = page.locator('[class*="border-brand"]')
    this.totalPrice = page.locator('[class*="font-bold"]').filter({ has: page.locator('[class*="IndianRupee"]') })
    this.proceedButton = page.getByRole('button', { name: /Proceed to Book/i })
    this.bookingSpinner = page.getByText('Holding Seats...')
    // Error
    this.eventNotFound = page.getByText('Event not found')
    this.browseEventsButton = page.getByRole('button', { name: 'Browse Events' })
    // Loading
    this.loadingSkeleton = page.locator('[class*="skeleton"]')
  }

  async goto(eventId: string) {
    await this.page.goto(`/events/${eventId}`)
    await this.page.waitForLoadState('networkidle')
  }

  async selectSection(label: string) {
    await this.page.getByText(label, { exact: true }).click()
  }

  async clickSeat(seatLabel: string) {
    await this.page.locator(`button[title="${seatLabel}"]`).click()
  }

  async clickProceedToBook() {
    await this.proceedButton.click()
  }

  async shareViaWhatsApp() {
    await this.shareWhatsApp.click()
  }

  async shareViaTwitter() {
    await this.shareTwitter.click()
  }

  async copyShareLink() {
    await this.shareCopyLink.click()
  }
}
