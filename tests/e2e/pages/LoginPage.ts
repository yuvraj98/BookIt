import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly brandLogo: Locator
  readonly brandText: Locator
  readonly signInTitle: Locator
  readonly phoneLabel: Locator
  readonly countryCode: Locator
  readonly phoneInput: Locator
  readonly sendOtpButton: Locator
  readonly phoneError: Locator
  readonly securityNote: Locator
  readonly otpTitle: Locator
  readonly otpInput: Locator
  readonly verifyButton: Locator
  readonly otpError: Locator
  readonly changeNumberButton: Locator
  readonly resendOtpButton: Locator
  readonly resendTimer: Locator
  readonly phoneDisplay: Locator
  readonly termsLink: Locator
  readonly privacyLink: Locator
  readonly loadingSpinner: Locator

  constructor(page: Page) {
    this.page = page
    this.brandLogo = page.locator('[class*="rounded-xl"][class*="bg-brand"]').first()
    this.brandText = page.getByText('BookIt', { exact: true }).first()
    this.signInTitle = page.getByText('Sign in to BookIt')
    this.phoneLabel = page.getByText('Mobile Number')
    this.countryCode = page.getByText('+91')
    this.phoneInput = page.getByPlaceholder('98765 43210')
    this.sendOtpButton = page.getByRole('button', { name: /Send OTP/i })
    this.phoneError = page.getByText('Enter a valid 10-digit Indian mobile number')
    this.securityNote = page.getByText('Your number is never shared with anyone')
    this.otpTitle = page.getByText('Enter OTP')
    this.otpInput = page.getByPlaceholder('• • • • • •')
    this.verifyButton = page.getByRole('button', { name: /Verify.*Sign In/i })
    this.otpError = page.getByText('Enter the 6-digit OTP')
    this.changeNumberButton = page.getByText('Change number')
    this.resendOtpButton = page.getByRole('button', { name: 'Resend OTP' })
    this.resendTimer = page.getByText(/Resend OTP in \d+s/)
    this.phoneDisplay = page.locator('[class*="brand-400"][class*="font-semibold"]')
    this.termsLink = page.getByRole('link', { name: 'Terms' })
    this.privacyLink = page.getByRole('link', { name: 'Privacy Policy' })
    this.loadingSpinner = page.locator('[class*="animate-spin"]')
  }

  async goto() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
  }

  async enterPhone(phone: string) {
    await this.phoneInput.fill(phone)
  }

  async submitPhone() {
    await this.sendOtpButton.click()
  }

  async enterOtp(otp: string) {
    await this.otpInput.fill(otp)
  }

  async submitOtp() {
    await this.verifyButton.click()
  }

  async goBackToPhone() {
    await this.changeNumberButton.click()
  }

  async loginWithPhone(phone: string, otp: string) {
    await this.enterPhone(phone)
    await this.submitPhone()
    await this.enterOtp(otp)
    await this.submitOtp()
  }
}
