import { Page, Locator } from '@playwright/test'

export class FooterPage {
  readonly page: Page
  readonly footer: Locator
  readonly brandLogo: Locator
  readonly brandText: Locator
  readonly aboutLink: Locator
  readonly careersLink: Locator
  readonly blogLink: Locator
  readonly contactLink: Locator
  readonly pricingLink: Locator
  readonly enterpriseLink: Locator
  readonly termsLink: Locator
  readonly privacyLink: Locator
  readonly refundsLink: Locator
  readonly copyrightText: Locator
  readonly socialLinks: Locator

  constructor(page: Page) {
    this.page = page
    this.footer = page.locator('footer')
    this.brandLogo = page.locator('footer').locator('[class*="brand"]').first()
    this.brandText = page.locator('footer').getByText('BookIt')
    this.aboutLink = page.locator('footer').getByRole('link', { name: /about/i })
    this.careersLink = page.locator('footer').getByRole('link', { name: /careers/i })
    this.blogLink = page.locator('footer').getByRole('link', { name: /blog/i })
    this.contactLink = page.locator('footer').getByRole('link', { name: /contact/i })
    this.pricingLink = page.locator('footer').getByRole('link', { name: /pricing/i })
    this.enterpriseLink = page.locator('footer').getByRole('link', { name: /enterprise/i })
    this.termsLink = page.locator('footer').getByRole('link', { name: /terms/i })
    this.privacyLink = page.locator('footer').getByRole('link', { name: /privacy/i })
    this.refundsLink = page.locator('footer').getByRole('link', { name: /refund/i })
    this.copyrightText = page.locator('footer').getByText(/©|copyright|BookIt/i)
    this.socialLinks = page.locator('footer a[href*="twitter"], footer a[href*="github"], footer a[href*="linkedin"]')
  }

  async scrollToFooter() {
    await this.footer.scrollIntoViewIfNeeded()
  }
}
