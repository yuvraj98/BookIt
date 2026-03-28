import { Page, Locator, expect } from '@playwright/test'

export class PaymentPage {
  readonly page: Page
  // Header
  readonly backButton: Locator
  readonly countdownTimer: Locator
  // Order Summary
  readonly orderSummaryTitle: Locator
  readonly eventTitle: Locator
  readonly eventDateVenue: Locator
  readonly selectedSeatsSection: Locator
  readonly seatBadges: Locator
  readonly loyaltyCoinsSection: Locator
  readonly loyaltyCoinsValue: Locator
  readonly ticketsCount: Locator
  readonly convenienceFee: Locator
  readonly totalAmount: Locator
  // Payment Methods
  readonly paymentMethodTitle: Locator
  readonly upiMethodButton: Locator
  readonly cardMethodButton: Locator
  readonly netbankingMethodButton: Locator
  // UPI
  readonly upiIdInput: Locator
  // Card
  readonly cardNumberInput: Locator
  readonly cardExpiryInput: Locator
  readonly cardCvcInput: Locator
  readonly cardSimulatedNote: Locator
  // Net Banking
  readonly bankSelect: Locator
  // Pay button
  readonly payButton: Locator
  readonly securityNote: Locator
  // Processing
  readonly processingTitle: Locator
  readonly processingSpinner: Locator
  readonly processingProgressBar: Locator
  readonly doNotCloseNote: Locator
  // Success
  readonly successIcon: Locator
  readonly successTitle: Locator
  readonly amountPaid: Locator
  readonly bookingIdDisplay: Locator
  readonly seatsConfirmed: Locator
  readonly viewTicketsButton: Locator
  readonly browseMoreButton: Locator
  // Failed
  readonly failedTitle: Locator
  readonly failedMessage: Locator
  readonly browseEventsButton: Locator
  readonly myBookingsButton: Locator
  // Booking states
  readonly alreadyConfirmedTitle: Locator
  readonly cancelledTitle: Locator
  readonly bookingNotFound: Locator

  constructor(page: Page) {
    this.page = page
    // Header
    this.backButton = page.getByText('Back')
    this.countdownTimer = page.locator('[class*="font-mono"]')
    // Order Summary
    this.orderSummaryTitle = page.getByText('Order Summary')
    this.eventTitle = page.locator('[class*="font-bold"][class*="text-lg"]').first()
    this.eventDateVenue = page.locator('[class*="text-text-muted"][class*="text-sm"]').first()
    this.selectedSeatsSection = page.getByText('Selected Seats').locator('..')
    this.seatBadges = page.locator('[class*="badge"]').filter({ hasText: /[A-Z]\d/ })
    this.loyaltyCoinsSection = page.getByText('Loyalty Coins').locator('..')
    this.loyaltyCoinsValue = page.locator('[class*="text-amber-400"][class*="font-display"]')
    this.ticketsCount = page.getByText(/Tickets \(\d+x\)/)
    this.convenienceFee = page.getByText('Convenience Fee').locator('..')
    this.totalAmount = page.getByText('Total').locator('..')
    // Payment Methods
    this.paymentMethodTitle = page.getByText('Payment Method')
    this.upiMethodButton = page.getByText('UPI').locator('..')
    this.cardMethodButton = page.getByText('Card', { exact: true }).locator('..')
    this.netbankingMethodButton = page.getByText('Net Banking').locator('..')
    // UPI
    this.upiIdInput = page.getByPlaceholder('yourname@upi')
    // Card
    this.cardNumberInput = page.getByPlaceholder('4242 4242 4242 4242')
    this.cardExpiryInput = page.getByPlaceholder('12/28')
    this.cardCvcInput = page.getByPlaceholder('123')
    this.cardSimulatedNote = page.getByText('Simulated payment — no real charges')
    // Net Banking
    this.bankSelect = page.locator('select').filter({ hasText: /State Bank/ })
    // Pay button
    this.payButton = page.getByRole('button', { name: /Pay/ })
    this.securityNote = page.getByText(/Secured by Razorpay/)
    // Processing
    this.processingTitle = page.getByText('Processing Payment')
    this.processingSpinner = page.locator('[class*="animate-spin"]')
    this.processingProgressBar = page.locator('[class*="bg-gradient-to-r"]')
    this.doNotCloseNote = page.getByText('Do not close this page')
    // Success
    this.successIcon = page.locator('[class*="emerald"]')
    this.successTitle = page.getByText('Booking Confirmed!')
    this.amountPaid = page.getByText('Amount Paid').locator('..')
    this.bookingIdDisplay = page.getByText('Booking ID').locator('..')
    this.seatsConfirmed = page.getByText(/\d+ ticket\(s\)/)
    this.viewTicketsButton = page.getByRole('link', { name: 'View My Tickets' })
    this.browseMoreButton = page.getByRole('link', { name: 'Browse More' })
    // Failed
    this.failedTitle = page.getByText('Payment Failed')
    this.failedMessage = page.locator('[class*="text-text-muted"]').filter({ hasText: /expired|wrong/ })
    this.browseEventsButton = page.getByRole('link', { name: 'Browse Events' })
    this.myBookingsButton = page.getByRole('link', { name: 'My Bookings' })
    // States
    this.alreadyConfirmedTitle = page.getByText('Already Confirmed')
    this.cancelledTitle = page.getByText('Booking Cancelled')
    this.bookingNotFound = page.getByText('Booking not found')
  }

  async goto(bookingId: string) {
    await this.page.goto(`/profile/bookings/${bookingId}/pay`)
    await this.page.waitForLoadState('networkidle')
  }

  async selectUPI() {
    await this.upiMethodButton.click()
  }

  async selectCard() {
    await this.cardMethodButton.click()
  }

  async selectNetBanking() {
    await this.netbankingMethodButton.click()
  }

  async enterUpiId(upiId: string) {
    await this.upiIdInput.fill(upiId)
  }

  async selectBank(bank: string) {
    await this.bankSelect.selectOption(bank)
  }

  async clickPay() {
    await this.payButton.click()
  }

  async completeUpiPayment(upiId = 'testuser@upi') {
    await this.selectUPI()
    await this.enterUpiId(upiId)
    await this.clickPay()
  }

  async completeCardPayment() {
    await this.selectCard()
    await this.clickPay()
  }

  async completeNetBankingPayment(bank = 'HDFC Bank') {
    await this.selectNetBanking()
    await this.selectBank(bank)
    await this.clickPay()
  }
}
