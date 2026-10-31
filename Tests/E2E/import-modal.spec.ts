import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type FrameLocator, type Page } from '@playwright/test';

const formFile = `.Build/v${process.env.TYPO3_VERSION ?? '14'}/public/fileadmin/form_definitions/contact.form.yaml`;

function editor(page: Page): FrameLocator {
  return page.frameLocator('#typo3-contentIframe');
}

async function selectTopic(page: Page): Promise<void> {
  await editor(page).locator('[data-identifier="stageArea"]').getByText('Topic', { exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  mkdirSync(dirname(formFile), { recursive: true });
  copyFileSync('Tests/E2E/Fixtures/contact.form.yaml', formFile);
  await page.goto('/typo3/');
  await page.locator('#t3-username').fill('admin');
  await page.locator('#t3-password').fill('Password-1234!');
  await page.locator('#t3-login-submit').click();
  const formsModule = page.getByRole('menuitem', { name: 'Forms', exact: true })
    .or(page.getByRole('link', { name: 'Forms', exact: true }))
    .first();
  const editFormLink = editor(page).locator('a[title="Edit this form"]').first();
  // The backend menu ignores clicks until its script has loaded, so click again until the form list shows.
  await expect(async () => {
    await formsModule.click();
    await expect(editFormLink).toBeVisible({ timeout: 5_000 });
  }).toPass({ timeout: 45_000 });
  await editFormLink.click();
});

test('the settings of a select show the import button instead of a textarea', async ({ page }) => {
  await selectTopic(page);
  await expect(editor(page).getByRole('button', { name: 'Import from spreadsheet/CSV…' })).toBeVisible();
  await expect(editor(page).locator('textarea')).toHaveCount(0);
});
