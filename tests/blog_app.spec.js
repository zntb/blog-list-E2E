const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Blog app', () => {
    beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
      await expect(page.locator('form')).toBeVisible()
    })
})