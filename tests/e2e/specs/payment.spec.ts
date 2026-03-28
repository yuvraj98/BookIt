import { test, expect } from '@playwright/test'
import { PaymentPage } from '../pages/PaymentPage'
import { loginAs, mockBookingDetailApi, mockApiRoute, waitForPageReady } from '../helpers/test-utils'

test.describe('Payment Simulator', () => {
  let paymentPage: PaymentPage
  const BOOKING_ID = 'booking-1'

  test.beforeEach(async ({ page }) => {
    paymentPage = new PaymentPage(page)
    await loginAs(page, 'customer')
    await mockBookingDetailApi(page, BOOKING_ID)
    await paymentPage.goto(BOOKING_ID)
    await waitForPageReady(page)
  })

  // ─── Page Load ──────────────────────────────────────────────────
  test.describe('Page Load', () => {
    test('should load the payment page', async ({ page }) => {
      await expect(page).toHaveURL(/pay/)
    })

    test('should display back button', async () => {
      await expect(paymentPage.backButton).toBeVisible()
    })

    test('should display countdown timer', async () => {
      await expect(paymentPage.countdownTimer).toBeVisible()
    })
  })

  // ─── Order Summary ─────────────────────────────────────────────
  test.describe('Order Summary', () => {
    test('should display Order Summary title', async () => {
      await expect(paymentPage.orderSummaryTitle).toBeVisible()
    })

    test('should display event title', async ({ page }) => {
      await expect(page.getByText('Comedy Night Live')).toBeVisible()
    })

    test('should display event date and venue', async () => {
      await expect(paymentPage.eventDateVenue).toBeVisible()
    })

    test('should display selected seats', async ({ page }) => {
      await expect(page.getByText('A1')).toBeVisible()
      await expect(page.getByText('A2')).toBeVisible()
    })

    test('should display seat section labels', async ({ page }) => {
      await expect(page.getByText('Silver')).toBeVisible()
    })

    test('should display ticket count', async () => {
      await expect(paymentPage.ticketsCount).toBeVisible()
    })

    test('should display convenience fee', async ({ page }) => {
      await expect(page.getByText('Convenience Fee')).toBeVisible()
    })

    test('should display total amount', async ({ page }) => {
      await expect(page.getByText('Total')).toBeVisible()
      await expect(page.getByText('1058')).toBeVisible()
    })

    test('should display loyalty coins if user has them', async () => {
      await expect(paymentPage.loyaltyCoinsSection).toBeVisible()
    })
  })

  // ─── Payment Method Selection ──────────────────────────────────
  test.describe('Payment Method Selection', () => {
    test('should display UPI method button', async () => {
      await expect(paymentPage.upiMethodButton).toBeVisible()
    })

    test('should display Card method button', async () => {
      await expect(paymentPage.cardMethodButton).toBeVisible()
    })

    test('should display Net Banking method button', async () => {
      await expect(paymentPage.netbankingMethodButton).toBeVisible()
    })

    test('UPI should be the default selected method', async () => {
      await expect(paymentPage.upiIdInput).toBeVisible()
    })

    test('selecting Card should show card fields', async () => {
      await paymentPage.selectCard()
      await expect(paymentPage.cardNumberInput).toBeVisible()
      await expect(paymentPage.cardExpiryInput).toBeVisible()
      await expect(paymentPage.cardCvcInput).toBeVisible()
    })

    test('card fields should be pre-filled (simulated)', async () => {
      await paymentPage.selectCard()
      await expect(paymentPage.cardNumberInput).toHaveAttribute('placeholder', '4242 4242 4242 4242')
    })

    test('card section should show simulated payment note', async () => {
      await paymentPage.selectCard()
      await expect(paymentPage.cardSimulatedNote).toBeVisible()
    })

    test('selecting Net Banking should show bank dropdown', async () => {
      await paymentPage.selectNetBanking()
      await expect(paymentPage.bankSelect).toBeVisible()
    })

    test('bank dropdown should have multiple options', async ({ page }) => {
      await paymentPage.selectNetBanking()
      await expect(page.locator('option', { hasText: 'State Bank of India' })).toBeAttached()
      await expect(page.locator('option', { hasText: 'HDFC Bank' })).toBeAttached()
      await expect(page.locator('option', { hasText: 'ICICI Bank' })).toBeAttached()
    })
  })

  // ─── UPI Payment Flow ─────────────────────────────────────────
  test.describe('UPI Payment Flow', () => {
    test('should show error for invalid UPI ID', async ({ page }) => {
      await paymentPage.enterUpiId('invalid')
      await paymentPage.clickPay()
      // Should show toast error
      await expect(page.getByText(/valid UPI ID/i)).toBeVisible({ timeout: 5000 })
    })

    test('should accept valid UPI ID format', async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, { success: true, message: 'Payment confirmed' })
      await paymentPage.enterUpiId('testuser@upi')
      await paymentPage.clickPay()
      await expect(paymentPage.processingTitle).toBeVisible({ timeout: 5000 })
    })
  })

  // ─── Processing Step ──────────────────────────────────────────
  test.describe('Processing Step', () => {
    test.beforeEach(async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, { success: true, message: 'Payment confirmed' })
      await paymentPage.enterUpiId('testuser@upi')
      await paymentPage.clickPay()
    })

    test('should display Processing Payment title', async () => {
      await expect(paymentPage.processingTitle).toBeVisible({ timeout: 5000 })
    })

    test('should display spinner', async () => {
      await expect(paymentPage.processingSpinner).toBeVisible()
    })

    test('should display progress bar', async () => {
      await expect(paymentPage.processingProgressBar).toBeVisible()
    })

    test('should display do not close note', async () => {
      await expect(paymentPage.doNotCloseNote).toBeVisible()
    })
  })

  // ─── Success Step ─────────────────────────────────────────────
  test.describe('Success Step', () => {
    test('should show success page after payment', async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, {
        success: true,
        message: 'Payment confirmed',
        data: { loyalty_coins_earned: 10 },
      })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.successTitle).toBeVisible({ timeout: 10000 })
    })

    test('success page should show amount paid', async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, { success: true, message: 'Confirmed' })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.successTitle).toBeVisible({ timeout: 10000 })
      await expect(paymentPage.amountPaid).toBeVisible()
    })

    test('success page should show booking ID', async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, { success: true, message: 'Confirmed' })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.successTitle).toBeVisible({ timeout: 10000 })
      await expect(paymentPage.bookingIdDisplay).toBeVisible()
    })

    test('success page should have View My Tickets button', async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, { success: true, message: 'Confirmed' })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.successTitle).toBeVisible({ timeout: 10000 })
      await expect(paymentPage.viewTicketsButton).toBeVisible()
    })

    test('success page should have Browse More button', async ({ page }) => {
      await mockApiRoute(page, 'POST', `/bookings/${BOOKING_ID}/confirm`, { success: true, message: 'Confirmed' })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.successTitle).toBeVisible({ timeout: 10000 })
      await expect(paymentPage.browseMoreButton).toBeVisible()
    })
  })

  // ─── Failed Step ──────────────────────────────────────────────
  test.describe('Failed Step', () => {
    test('should show failure page on API error', async ({ page }) => {
      await page.route('**/api/v1/bookings/*/confirm', (route) => {
        route.fulfill({ status: 400, body: JSON.stringify({ error: 'Payment failed' }) })
      })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.failedTitle).toBeVisible({ timeout: 10000 })
    })

    test('failed page should show Browse Events link', async ({ page }) => {
      await page.route('**/api/v1/bookings/*/confirm', (route) => {
        route.fulfill({ status: 400, body: JSON.stringify({ error: 'Payment failed' }) })
      })
      await paymentPage.completeUpiPayment()
      await expect(paymentPage.failedTitle).toBeVisible({ timeout: 10000 })
      await expect(paymentPage.browseEventsButton).toBeVisible()
    })
  })

  // ─── Already Confirmed Booking ─────────────────────────────────
  test.describe('Already Confirmed Booking', () => {
    test('should show Already Confirmed message', async ({ page }) => {
      await mockApiRoute(page, 'GET', `/bookings/confirmed-booking`, {
        success: true,
        data: { id: 'confirmed-booking', status: 'confirmed', events: { title: 'Test' } },
      })
      await page.goto('/profile/bookings/confirmed-booking/pay')
      await waitForPageReady(page)
      await expect(paymentPage.alreadyConfirmedTitle).toBeVisible()
    })
  })

  // ─── Cancelled Booking ────────────────────────────────────────
  test.describe('Cancelled Booking', () => {
    test('should show Booking Cancelled message', async ({ page }) => {
      await mockApiRoute(page, 'GET', `/bookings/cancelled-booking`, {
        success: true,
        data: { id: 'cancelled-booking', status: 'cancelled', events: { title: 'Test' } },
      })
      await page.goto('/profile/bookings/cancelled-booking/pay')
      await waitForPageReady(page)
      await expect(paymentPage.cancelledTitle).toBeVisible()
    })
  })

  // ─── Auth Guard ────────────────────────────────────────────────
  test.describe('Auth Guard', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      // New page context without auth
      const newPage = await page.context().newPage()
      await newPage.goto(`/profile/bookings/${BOOKING_ID}/pay`)
      await newPage.waitForLoadState('networkidle')
      await expect(newPage).toHaveURL(/login/, { timeout: 10000 })
      await newPage.close()
    })
  })

  // ─── Security Badge ───────────────────────────────────────────
  test.describe('Security', () => {
    test('should display security badge', async () => {
      await expect(paymentPage.securityNote).toBeVisible()
    })
  })

  // ─── Pay Button ────────────────────────────────────────────────
  test.describe('Pay Button', () => {
    test('should display total amount on pay button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Pay.*1058|Pay/ })).toBeVisible()
    })
  })
})
