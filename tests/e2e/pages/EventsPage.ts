import { Page, Locator, expect } from '@playwright/test'

export class EventsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator
  readonly searchInput: Locator
  readonly citySelect: Locator
  readonly categoryPills: Locator
  readonly eventCards: Locator
  readonly loadingSkeletons: Locator
  readonly noEventsMessage: Locator
  readonly clearFiltersButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByText('Discover')
    this.pageSubtitle = page.getByText(/comedy.*concerts|unforgettable/i)
    this.searchInput = page.getByPlaceholder('Search events...')
    this.citySelect = page.locator('select').filter({ hasText: /Pune|Mumbai/ })
    this.categoryPills = page.locator('button').filter({ hasText: /All|Comedy|Music|Sports|Workshop|Theatre|Food|Art|Others/i })
    this.eventCards = page.locator('a[href*="/events/"]').filter({ has: page.getByText('Book Now') })
    this.loadingSkeletons = page.locator('[class*="skeleton"]')
    this.noEventsMessage = page.getByText('No events found')
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear Filters' })
    this.errorMessage = page.getByText('Failed to load events')
  }

  async goto() {
    await this.page.goto('/events')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoWithCategory(category: string) {
    await this.page.goto(`/events?category=${category}`)
    await this.page.waitForLoadState('networkidle')
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query)
    // Wait for debounce
    await this.page.waitForTimeout(600)
  }

  async selectCategory(category: string) {
    await this.page.getByRole('button', { name: category, exact: true }).click()
  }

  async selectCity(city: string) {
    await this.citySelect.selectOption(city)
  }

  async clickEventCard(index: number) {
    await this.eventCards.nth(index).click()
  }

  async getEventCardTitle(index: number) {
    return this.eventCards.nth(index).locator('h3').textContent()
  }

  async getEventCardPrice(index: number) {
    return this.eventCards.nth(index).locator('[class*="font-display"]').textContent()
  }

  async getEventCount() {
    return this.eventCards.count()
  }

  async clearAllFilters() {
    await this.clearFiltersButton.click()
  }
}
