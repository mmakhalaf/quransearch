import { test, expect } from '@playwright/test';

// End-to-end smoke test of the core flows: load, word search, and ayah modal.
test('word search returns results and the ayah modal opens', async ({ page }) => {
   // Home loads.
   await page.goto('/');
   await expect(page).toHaveTitle('بحث');
   await expect(page.locator('.search-btn')).toBeVisible();

   // Navigate to the search page and wait for the dataset to load.
   await page.goto('/search');
   const input = page.locator('input.mat-mdc-input-element').first();
   await input.waitFor({ state: 'visible' });
   // Give the worker/data load a moment, then search.
   await page.waitForTimeout(4000);
   await input.click();
   await input.type('الله');

   // The results summary reports the (Arabic-numeral) ayah/occurrence counts.
   const dataMsg = page.locator('.data-msg');
   await expect(dataMsg).toContainText('١٦٦١', { timeout: 20_000 });
   await expect(dataMsg).toContainText('٢٣٩٤');

   // Windowed list renders some rows.
   await expect(page.locator('qsearch-result').first()).toBeVisible();

   // Opening an ayah shows the dialog with verse text.
   await page.goto('/(modal:ayah/5)');
   const dialog = page.locator('.mat-mdc-dialog-container');
   await expect(dialog).toBeVisible({ timeout: 20_000 });
   await expect(dialog.locator('.ayah-style').first()).toBeVisible();
});
