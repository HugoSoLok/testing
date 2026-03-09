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

test.describe('Expense CRUD flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearDB(page)
    await page.reload()
    // Wait for app shell + seed to complete
    await page.waitForSelector('[aria-label="Add expense"]')
    // Give IndexedDB seed a moment to finish
    await page.waitForTimeout(300)
  })

  test('add → verify in list → edit amount → verify updated → delete → verify removed + total updated', async ({ page }) => {
    // ── 1. Initial state ────────────────────────────────────────────────────
    await expect(page.locator('.total-amount')).toHaveText('$0.00')

    // ── 2. Add expense ($50) ────────────────────────────────────────────────
    await page.click('[aria-label="Add expense"]')
    await expect(page.locator('.form-header')).toBeVisible()

    // Category and Paid by default to first option; Date defaults to today
    await page.locator('input[type="number"]').fill('50')
    await page.getByRole('button', { name: 'Add Expense' }).click()

    // Form closes
    await expect(page.locator('.form-header')).not.toBeVisible()

    // Expense row appears
    await expect(page.locator('.expense-row')).toHaveCount(1)

    // Total updates
    await expect(page.locator('.total-amount')).toHaveText('$50.00')

    // ── 3. Edit amount → $75 ────────────────────────────────────────────────
    await page.locator('.expense-row').click()
    await expect(page.locator('.detail-sheet')).toBeVisible()

    await page.locator('.detail-actions').getByRole('button', { name: 'Edit' }).click()
    await expect(page.locator('.form-header')).toBeVisible()

    // "Edit Expense" title visible
    await expect(page.locator('.form-title')).toHaveText('Edit Expense')

    await page.locator('input[type="number"]').fill('75')
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Form closes, total updates
    await expect(page.locator('.form-header')).not.toBeVisible()
    await expect(page.locator('.total-amount')).toHaveText('$75.00')

    // ── 4. Delete expense ───────────────────────────────────────────────────
    await page.locator('.expense-row').click()
    await expect(page.locator('.detail-sheet')).toBeVisible()

    await page.locator('.detail-actions').getByRole('button', { name: 'Delete' }).click()

    // Vant confirm dialog appears
    await expect(page.locator('.van-dialog')).toBeVisible()
    await page.locator('.van-dialog .van-dialog__confirm').click()

    // Row removed
    await expect(page.locator('.expense-row')).toHaveCount(0)

    // Total back to $0.00
    await expect(page.locator('.total-amount')).toHaveText('$0.00')
  })
})
