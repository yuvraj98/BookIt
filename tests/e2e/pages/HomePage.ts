import { Page, Locator, expect } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly heroSection: Locator
  readonly heroTitle: Locator
  readonly heroSubtitle: Locator
  readonly heroCTAButton: Locator
  readonly heroSearchInput: Locator
  readonly categoriesSection: Locator
  readonly categoryCards: Locator
  readonly featuredEventsSection: Locator
  readonly featuredEventCards: Locator
  readonly howItWorksSection: Locator
  readonly howItWorksSteps: Locator
  readonly statsSection: Locator
  readonly statItems: Locator
  readonly testimonialsSection: Locator
  readonly testimonialCards: Locator
  readonly organizerCTASection: Locator
  readonly organizerCTAButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heroSection = page.locator('section').first()
    this.heroTitle = page.locator('h1').first()
    this.heroSubtitle = page.locator('p').first()
    this.heroCTAButton = page.getByRole('link', { name: /explore|book|get started/i }).first()
    this.heroSearchInput = page.getByPlaceholder(/search/i)
    this.categoriesSection = page.locator('text=Browse by Category').locator('..')
    this.categoryCards = page.locator('[class*="category"]')
    this.featuredEventsSection = page.locator('text=Featured Events').locator('..')
    this.featuredEventCards = page.locator('text=Featured Events').locator('..').locator('a[href*="/events/"]')
    this.howItWorksSection = page.locator('text=How It Works').locator('..')
    this.howItWorksSteps = page.locator('text=How It Works').locator('..').locator('[class*="step"], [class*="card"]')
    this.statsSection = page.locator('text=/\\d+.*Events|Bookings|Users/i').first().locator('..')
    this.statItems = page.locator('[class*="stat"]')
    this.testimonialsSection = page.locator('text=/testimonial|what.*say|review/i').first().locator('..')
    this.testimonialCards = page.locator('[class*="testimonial"]')
    this.organizerCTASection = page.locator('text=/list.*event|organis/i').first().locator('..')
    this.organizerCTAButton = page.getByRole('link', { name: /list.*event|start.*organis|register/i })
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async scrollToSection(section: Locator) {
    await section.scrollIntoViewIfNeeded()
  }

  async clickCategory(name: string) {
    await this.page.getByText(name, { exact: true }).click()
  }

  async clickFeaturedEvent(index: number) {
    await this.featuredEventCards.nth(index).click()
  }
}
