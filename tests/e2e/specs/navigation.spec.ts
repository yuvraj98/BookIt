import { test, expect } from '@playwright/test'
import { NavbarPage } from '../pages/NavbarPage'
import { FooterPage } from '../pages/FooterPage'
import { loginAs, logout, waitForPageReady } from '../helpers/test-utils'
import { CITIES } from '../helpers/constants'

test.describe('Navbar', () => {
  let navbar: NavbarPage

  test.beforeEach(async ({ page }) => {
    navbar = new NavbarPage(page)
    await page.goto('/')
    await waitForPageReady(page)
  })

  // ─── Logo ───────────────────────────────────────────────────────
  test.describe('Logo', () => {
    test('should display the BookIt logo', async () => {
      await expect(navbar.logoText).toBeVisible()
    })

    test('clicking logo should navigate to home', async ({ page }) => {
      await page.goto('/events')
      await navbar.logo.click()
      await expect(page).toHaveURL('/')
    })
  })

  // ─── Desktop Navigation Links ──────────────────────────────────
  test.describe('Desktop Navigation', () => {
    test('should display Events link', async () => {
      await expect(navbar.eventsLink).toBeVisible()
    })

    test('should display category nav links (Comedy, Music, Sports)', async () => {
      await expect(navbar.comedyLink).toBeVisible()
      await expect(navbar.musicLink).toBeVisible()
      await expect(navbar.sportsLink).toBeVisible()
    })

    test('should display List Event / Dashboard link', async () => {
      await expect(navbar.listEventLink).toBeVisible()
    })

    test('Events link should navigate to /events', async ({ page }) => {
      await navbar.eventsLink.click()
      await expect(page).toHaveURL('/events')
    })

    test('Comedy link should navigate with category filter', async ({ page }) => {
      await navbar.comedyLink.click()
      await expect(page).toHaveURL(/category=comedy/)
    })

    test('Music link should navigate with category filter', async ({ page }) => {
      await navbar.musicLink.click()
      await expect(page).toHaveURL(/category=music/)
    })

    test('Sports link should navigate with category filter', async ({ page }) => {
      await navbar.sportsLink.click()
      await expect(page).toHaveURL(/category=sports/)
    })
  })

  // ─── City Selector ─────────────────────────────────────────────
  test.describe('City Selector', () => {
    test('should display default city (Pune)', async () => {
      await expect(navbar.citySelector).toContainText('Pune')
    })

    test('should open city dropdown on click', async () => {
      await navbar.citySelector.click()
      for (const city of CITIES) {
        await expect(navbar.page.getByRole('button', { name: city, exact: true })).toBeVisible()
      }
    })

    test('should change selected city on click', async () => {
      await navbar.selectCity('Mumbai')
      await expect(navbar.citySelector).toContainText('Mumbai')
    })

    test('should close dropdown after selecting a city', async ({ page }) => {
      await navbar.citySelector.click()
      await page.getByRole('button', { name: 'Bengaluru', exact: true }).click()
      // Dropdown should disappear
      await expect(page.getByRole('button', { name: 'Mumbai', exact: true })).not.toBeVisible()
    })
  })

  // ─── Auth Buttons (Unauthenticated) ────────────────────────────
  test.describe('Unauthenticated State', () => {
    test('should display Sign In button', async () => {
      await expect(navbar.signInButton).toBeVisible()
    })

    test('should display Get Started button', async () => {
      await expect(navbar.getStartedButton).toBeVisible()
    })

    test('Sign In button should navigate to /login', async ({ page }) => {
      await navbar.signInButton.click()
      await expect(page).toHaveURL('/login')
    })

    test('Get Started button should navigate to /login', async ({ page }) => {
      await navbar.getStartedButton.click()
      await expect(page).toHaveURL('/login')
    })

    test('should NOT display profile dropdown', async () => {
      await expect(navbar.profileButton).not.toBeVisible()
    })
  })

  // ─── Authenticated State (Customer) ────────────────────────────
  test.describe('Authenticated - Customer', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'customer')
      await page.goto('/')
      await waitForPageReady(page)
    })

    test('should display user profile button with name', async () => {
      await expect(navbar.profileButton).toBeVisible()
    })

    test('should show loyalty coins if > 0', async ({ page }) => {
      const coins = page.locator('header').locator('[class*="amber"]')
      await expect(coins).toBeVisible()
    })

    test('should NOT display Sign In / Get Started buttons', async () => {
      await expect(navbar.signInButton).not.toBeVisible()
    })

    test('profile dropdown should show My Profile link', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.myProfileLink).toBeVisible()
    })

    test('profile dropdown should show My Bookings link', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.myBookingsLink).toBeVisible()
    })

    test('profile dropdown should show Sign Out button', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.signOutButton).toBeVisible()
    })

    test('profile dropdown should NOT show Organiser Dashboard for customer', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.organiserDashboardLink).not.toBeVisible()
    })

    test('profile dropdown should NOT show Admin Panel for customer', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.adminPanelLink).not.toBeVisible()
    })

    test('My Profile link should navigate to /profile', async ({ page }) => {
      await navbar.openProfileDropdown()
      await navbar.myProfileLink.click()
      await expect(page).toHaveURL('/profile')
    })

    test('My Bookings link should navigate to /profile/bookings', async ({ page }) => {
      await navbar.openProfileDropdown()
      await navbar.myBookingsLink.click()
      await expect(page).toHaveURL('/profile/bookings')
    })
  })

  // ─── Authenticated State (Organiser) ───────────────────────────
  test.describe('Authenticated - Organiser', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'organiser')
      await page.goto('/')
      await waitForPageReady(page)
    })

    test('should show Organiser Dashboard link in dropdown', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.organiserDashboardLink).toBeVisible()
    })

    test('nav should show Dashboard instead of List Event', async () => {
      await expect(navbar.listEventLink).toContainText(/Dashboard/i)
    })
  })

  // ─── Authenticated State (Admin) ───────────────────────────────
  test.describe('Authenticated - Admin', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin')
      await page.goto('/')
      await waitForPageReady(page)
    })

    test('should show Admin Panel link in dropdown', async () => {
      await navbar.openProfileDropdown()
      await expect(navbar.adminPanelLink).toBeVisible()
    })
  })

  // ─── Logout ────────────────────────────────────────────────────
  test.describe('Logout', () => {
    test('clicking Sign Out should log out user', async ({ page }) => {
      await loginAs(page, 'customer')
      await page.goto('/')
      await waitForPageReady(page)
      await navbar.performLogout()
      await page.waitForTimeout(500)
      // After logout, Sign In should reappear
      await expect(navbar.signInButton).toBeVisible()
    })
  })

  // ─── Scroll Behavior ──────────────────────────────────────────
  test.describe('Scroll Behavior', () => {
    test('navbar should get backdrop blur on scroll', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, 100))
      await page.waitForTimeout(300)
      const header = page.locator('header')
      await expect(header).toHaveClass(/backdrop-blur/)
    })
  })

  // ─── Mobile Navigation ─────────────────────────────────────────
  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
    })

    test('should display hamburger menu toggle on mobile', async () => {
      await expect(navbar.mobileMenuToggle).toBeVisible()
    })

    test('desktop nav links should be hidden on mobile', async () => {
      await expect(navbar.eventsLink).not.toBeVisible()
    })

    test('clicking hamburger should open mobile menu', async () => {
      await navbar.toggleMobileMenu()
      await expect(navbar.mobileMenu).toBeVisible()
    })

    test('mobile menu should display all nav links', async ({ page }) => {
      await navbar.toggleMobileMenu()
      await expect(page.locator('[class*="lg:hidden"]').getByText('Events')).toBeVisible()
    })

    test('clicking a link in mobile menu should close menu', async ({ page }) => {
      await navbar.toggleMobileMenu()
      const eventsLink = page.locator('[class*="lg:hidden"]').getByText('Events')
      await eventsLink.click()
      await expect(page).toHaveURL(/events/)
    })

    test('mobile menu should show Sign In when not authenticated', async ({ page }) => {
      await navbar.toggleMobileMenu()
      await expect(page.locator('[class*="lg:hidden"]').getByText('Sign in')).toBeVisible()
    })

    test('mobile menu should show user info when authenticated', async ({ page }) => {
      await loginAs(page, 'customer')
      await page.goto('/')
      await waitForPageReady(page)
      await navbar.toggleMobileMenu()
      await expect(page.locator('[class*="lg:hidden"]').getByText('Test Customer')).toBeVisible()
    })

    test('mobile menu should show loyalty coins when authenticated', async ({ page }) => {
      await loginAs(page, 'customer')
      await page.goto('/')
      await waitForPageReady(page)
      await navbar.toggleMobileMenu()
      await expect(page.locator('[class*="lg:hidden"]').locator('[class*="amber"]')).toBeVisible()
    })

    test('mobile menu should show Sign Out when authenticated', async ({ page }) => {
      await loginAs(page, 'customer')
      await page.goto('/')
      await waitForPageReady(page)
      await navbar.toggleMobileMenu()
      await expect(page.locator('[class*="lg:hidden"]').getByText('Sign Out')).toBeVisible()
    })
  })
})

// ─── Footer ────────────────────────────────────────────────────────
test.describe('Footer', () => {
  let footer: FooterPage

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page)
    await page.goto('/')
    await waitForPageReady(page)
    await footer.scrollToFooter()
  })

  test('should display the footer', async () => {
    await expect(footer.footer).toBeVisible()
  })

  test('should display BookIt branding', async () => {
    await expect(footer.brandText).toBeVisible()
  })

  test('should have About link pointing to /about', async () => {
    await expect(footer.aboutLink).toHaveAttribute('href', '/about')
  })

  test('should have Careers link', async () => {
    await expect(footer.careersLink).toHaveAttribute('href', '/careers')
  })

  test('should have Terms link', async () => {
    await expect(footer.termsLink).toHaveAttribute('href', '/terms')
  })

  test('should have Privacy link', async () => {
    await expect(footer.privacyLink).toHaveAttribute('href', '/privacy')
  })

  test('should have Refunds link', async () => {
    await expect(footer.refundsLink).toHaveAttribute('href', '/refunds')
  })

  test('should have Contact link', async () => {
    await expect(footer.contactLink).toHaveAttribute('href', '/contact')
  })

  test('footer links should be navigable', async ({ page }) => {
    await footer.aboutLink.click()
    await expect(page).toHaveURL('/about')
  })
})
