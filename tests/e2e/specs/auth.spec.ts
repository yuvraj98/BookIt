import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { waitForPageReady, mockApiRoute } from '../helpers/test-utils'
import { API_URL } from '../helpers/constants'

test.describe('Authentication - Login Page', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
    await waitForPageReady(page)
  })

  // ─── Page Load ──────────────────────────────────────────────────
  test.describe('Page Load', () => {
    test('should load the login page', async ({ page }) => {
      await expect(page).toHaveURL('/login')
    })

    test('should display BookIt branding', async () => {
      await expect(loginPage.brandText).toBeVisible()
    })

    test('should display sign in title', async () => {
      await expect(loginPage.signInTitle).toBeVisible()
    })

    test('should display the +91 country code', async () => {
      await expect(loginPage.countryCode).toBeVisible()
    })

    test('should display phone input field', async () => {
      await expect(loginPage.phoneInput).toBeVisible()
    })

    test('should display Send OTP button', async () => {
      await expect(loginPage.sendOtpButton).toBeVisible()
    })

    test('should display security note', async () => {
      await expect(loginPage.securityNote).toBeVisible()
    })

    test('should display Terms link', async () => {
      await expect(loginPage.termsLink).toBeVisible()
    })

    test('should display Privacy Policy link', async () => {
      await expect(loginPage.privacyLink).toBeVisible()
    })
  })

  // ─── Phone Input Validation ─────────────────────────────────────
  test.describe('Phone Input Validation', () => {
    test('should show error for empty phone number', async () => {
      await loginPage.submitPhone()
      await expect(loginPage.phoneError).toBeVisible()
    })

    test('should show error for phone starting with 0-5', async () => {
      await loginPage.enterPhone('1234567890')
      await loginPage.submitPhone()
      await expect(loginPage.phoneError).toBeVisible()
    })

    test('should show error for phone less than 10 digits', async () => {
      await loginPage.enterPhone('98765')
      await loginPage.submitPhone()
      await expect(loginPage.phoneError).toBeVisible()
    })

    test('should show error for phone with letters', async () => {
      await loginPage.enterPhone('98765abcde')
      await loginPage.submitPhone()
      await expect(loginPage.phoneError).toBeVisible()
    })

    test('should accept valid 10-digit Indian number starting with 6-9', async ({ page }) => {
      await mockApiRoute(page, 'POST', '/auth/otp/send', { success: true, message: 'OTP sent' })
      await loginPage.enterPhone('9876543210')
      await loginPage.submitPhone()
      // Should move to OTP step
      await expect(loginPage.otpTitle).toBeVisible({ timeout: 5000 })
    })

    test('phone input should enforce maxLength of 10', async () => {
      await expect(loginPage.phoneInput).toHaveAttribute('maxLength', '10')
    })

    test('phone input should have type tel', async () => {
      await expect(loginPage.phoneInput).toHaveAttribute('type', 'tel')
    })
  })

  // ─── OTP Step ───────────────────────────────────────────────────
  test.describe('OTP Verification Step', () => {
    test.beforeEach(async ({ page }) => {
      await mockApiRoute(page, 'POST', '/auth/otp/send', { success: true, message: 'OTP sent' })
      await loginPage.enterPhone('9876543210')
      await loginPage.submitPhone()
      await expect(loginPage.otpTitle).toBeVisible({ timeout: 5000 })
    })

    test('should display Enter OTP title', async () => {
      await expect(loginPage.otpTitle).toBeVisible()
    })

    test('should display the phone number sent to', async () => {
      await expect(loginPage.phoneDisplay).toContainText('+91')
    })

    test('should display OTP input field', async () => {
      await expect(loginPage.otpInput).toBeVisible()
    })

    test('OTP input should accept 6 digits', async () => {
      await expect(loginPage.otpInput).toHaveAttribute('maxLength', '6')
    })

    test('OTP input should have numeric inputMode', async () => {
      await expect(loginPage.otpInput).toHaveAttribute('inputMode', 'numeric')
    })

    test('should display Verify & Sign In button', async () => {
      await expect(loginPage.verifyButton).toBeVisible()
    })

    test('should display Change number button', async () => {
      await expect(loginPage.changeNumberButton).toBeVisible()
    })

    test('should display resend countdown timer initially', async () => {
      await expect(loginPage.resendTimer).toBeVisible()
    })

    test('should show error for empty OTP', async () => {
      await loginPage.submitOtp()
      await expect(loginPage.otpError).toBeVisible()
    })

    test('should show error for OTP less than 6 digits', async () => {
      await loginPage.enterOtp('123')
      await loginPage.submitOtp()
      await expect(loginPage.otpError).toBeVisible()
    })

    test('Change number should go back to phone step', async () => {
      await loginPage.goBackToPhone()
      await expect(loginPage.signInTitle).toBeVisible()
    })

    test('successful OTP verification should redirect to home', async ({ page }) => {
      await mockApiRoute(page, 'POST', '/auth/otp/verify', {
        success: true,
        data: {
          user: { id: 'u1', phone: '+919876543210', name: 'Test', role: 'customer', loyalty_coins: 0, created_at: new Date().toISOString() },
          access_token: 'fake_token',
          refresh_token: 'fake_refresh',
        },
      })
      await loginPage.enterOtp('123456')
      await loginPage.submitOtp()
      await expect(page).toHaveURL('/', { timeout: 10000 })
    })
  })

  // ─── Loading States ────────────────────────────────────────────
  test.describe('Loading States', () => {
    test('should show loading spinner while sending OTP', async ({ page }) => {
      // Delay the API response
      await page.route(`${API_URL}/auth/otp/send`, async (route) => {
        await new Promise(r => setTimeout(r, 1000))
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      })
      await loginPage.enterPhone('9876543210')
      await loginPage.submitPhone()
      await expect(page.getByText('Sending OTP...')).toBeVisible()
    })

    test('Send OTP button should be disabled during loading', async ({ page }) => {
      await page.route(`${API_URL}/auth/otp/send`, async (route) => {
        await new Promise(r => setTimeout(r, 2000))
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      })
      await loginPage.enterPhone('9876543210')
      await loginPage.submitPhone()
      await expect(loginPage.sendOtpButton).toBeDisabled()
    })
  })

  // ─── Legal Links ───────────────────────────────────────────────
  test.describe('Legal Links', () => {
    test('Terms link should navigate to /terms', async ({ page }) => {
      await loginPage.termsLink.click()
      await expect(page).toHaveURL('/terms')
    })

    test('Privacy link should navigate to /privacy', async ({ page }) => {
      await loginPage.privacyLink.click()
      await expect(page).toHaveURL('/privacy')
    })
  })

  // ─── Responsive ────────────────────────────────────────────────
  test.describe('Responsive', () => {
    test('login form should be centered on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/login')
      await expect(loginPage.signInTitle).toBeVisible()
    })

    test('login form should render correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/login')
      await expect(loginPage.signInTitle).toBeVisible()
    })
  })
})
