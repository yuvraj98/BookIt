import { Page, Locator, expect } from '@playwright/test'

export class NavbarPage {
  readonly page: Page
  readonly logo: Locator
  readonly logoText: Locator
  readonly citySelector: Locator
  readonly cityDropdown: Locator
  readonly navLinks: Locator
  readonly eventsLink: Locator
  readonly comedyLink: Locator
  readonly musicLink: Locator
  readonly sportsLink: Locator
  readonly listEventLink: Locator
  readonly signInButton: Locator
  readonly getStartedButton: Locator
  readonly profileButton: Locator
  readonly profileDropdown: Locator
  readonly myProfileLink: Locator
  readonly myBookingsLink: Locator
  readonly organiserDashboardLink: Locator
  readonly adminPanelLink: Locator
  readonly signOutButton: Locator
  readonly mobileMenuToggle: Locator
  readonly mobileMenu: Locator
  readonly loyaltyCoins: Locator

  constructor(page: Page) {
    this.page = page
    this.logo = page.locator('header a[href="/"]').first()
    this.logoText = page.locator('header').getByText('BookIt')
    this.citySelector = page.locator('header button').filter({ hasText: /Pune|Mumbai|Bengaluru|Hyderabad|Delhi/ }).first()
    this.cityDropdown = page.locator('[class*="backdrop-blur"]').filter({ hasText: 'Pune' })
    this.navLinks = page.locator('header nav a')
    this.eventsLink = page.locator('header').getByRole('link', { name: 'Events', exact: true })
    this.comedyLink = page.locator('header').getByRole('link', { name: 'Comedy' })
    this.musicLink = page.locator('header').getByRole('link', { name: 'Music' })
    this.sportsLink = page.locator('header').getByRole('link', { name: 'Sports' })
    this.listEventLink = page.locator('header').getByRole('link', { name: /list event|dashboard/i })
    this.signInButton = page.locator('header').getByRole('link', { name: 'Sign in' })
    this.getStartedButton = page.locator('header').getByRole('link', { name: 'Get Started' })
    this.profileButton = page.locator('header button').filter({ hasText: /User|Test/ })
    this.profileDropdown = page.locator('header [class*="backdrop-blur"][class*="rounded-xl"]').last()
    this.myProfileLink = page.locator('header').getByText('My Profile')
    this.myBookingsLink = page.locator('header').getByText('My Bookings')
    this.organiserDashboardLink = page.locator('header').getByText('Organiser Dashboard')
    this.adminPanelLink = page.locator('header').getByText('Admin Panel')
    this.signOutButton = page.locator('header').getByText('Sign Out')
    this.mobileMenuToggle = page.locator('header button[aria-label="Toggle menu"]')
    this.mobileMenu = page.locator('header [class*="lg:hidden"][class*="border-t"]')
    this.loyaltyCoins = page.locator('header').locator('[class*="amber"]')
  }

  async selectCity(city: string) {
    await this.citySelector.click()
    await this.page.getByRole('button', { name: city, exact: true }).click()
  }

  async openProfileDropdown() {
    await this.profileButton.click()
  }

  async toggleMobileMenu() {
    await this.mobileMenuToggle.click()
  }

  async navigateToEvents() {
    await this.eventsLink.click()
  }

  async navigateToLogin() {
    await this.signInButton.click()
  }

  async performLogout() {
    await this.openProfileDropdown()
    await this.signOutButton.click()
  }
}
