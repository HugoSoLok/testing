import { test, expect } from '@playwright/test'

// Clear IndexedDB before each test for isolation
async function clearDB(page: import('@playwright/test').Page) {
  await page.evaluate(() =>
    new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('home-expense-tracker')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
      req.onblocked = () => resolve()
    }),
  )
}

// Add an expense via the UI form, optionally switching Paid by member
async function addExpense(
  page: import('@playwright/test').Page,
  amount: string,
  paidByName?: string,
) {
  await page.click('[aria-label="Add expense"]')
  await expect(page.locator('.form-header')).toBeVisible()

  await page.locator('input[type="number"]').fill(amount)

  if (paidByName) {
    // Open Paid by picker
    await page.locator('.van-cell', { hasText: 'Paid by' }).click()
    await expect(page.locator('.van-picker')).toBeVisible()

    // Click target member in picker column
    await page
      .locator('.van-picker-column__item', { hasText: paidByName })
      .last()
      .click()

    // Confirm selection
    await page.locator('.van-picker__confirm').click()
    await expect(page.locator('.van-picker')).not.toBeVisible()
  }

  await page.getByRole('button', { name: 'Add Expense' }).click()
  await expect(page.locator('.form-header')).not.toBeVisible()
}

test.describe('Split calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearDB(page)
    await page.reload()
    await page.waitForSelector('[aria-label="Add expense"]')
    // Give seed data time to populate
    await page.waitForTimeout(300)
  })

  test('Hugo $200 + MM $100 → settlement "MM pays Hugo $50.00"', async ({ page }) => {
    // Hugo pays $200 (Hugo is default Paid by — first alphabetically)
    await addExpense(page, '200')
    await expect(page.locator('.expense-row')).toHaveCount(1)

    // MM pays $100 — change Paid by to MM
    await addExpense(page, '100', 'MM')
    await expect(page.locator('.expense-row')).toHaveCount(2)

    // Total should be $300.00
    await expect(page.locator('.total-amount')).toHaveText('$300.00')

    // Open split popup
    await page.click('[aria-label="Split calculator"]')
    await expect(page.locator('.split-sheet')).toBeVisible()

    // Assert settlement text
    await expect(page.locator('.settlement-text')).toHaveText('MM pays Hugo $50.00')
  })

  test('no expenses → "All settled — no payment needed"', async ({ page }) => {
    await page.click('[aria-label="Split calculator"]')
    await expect(page.locator('.split-sheet')).toBeVisible()
    await expect(page.locator('.settlement-text')).toHaveText(
      'All settled — no payment needed',
    )
  })
})
