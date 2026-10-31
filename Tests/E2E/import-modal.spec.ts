import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type FrameLocator, type Locator, type Page } from '@playwright/test';

const formFile = `.Build/v${process.env.TYPO3_VERSION ?? '14'}/public/fileadmin/form_definitions/contact.form.yaml`;

function editor(page: Page): FrameLocator {
  return page.frameLocator('#typo3-contentIframe');
}

async function selectTopic(page: Page): Promise<void> {
  await editor(page).locator('[data-identifier="stageArea"]').getByText('Topic', { exact: true }).click();
}

async function openImport(page: Page): Promise<Locator> {
  await selectTopic(page);
  await editor(page).getByRole('button', { name: 'Import from spreadsheet/CSV…' }).click();
  return page.getByRole('dialog');
}

async function paste(modal: Locator, text: string): Promise<void> {
  await modal.locator('.form-options-csv-drop-area').evaluate((dropArea, pastedText) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', pastedText);
    dropArea.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
  }, text);
}

const readmeExample = 'Label 1;1;1\nLabel 2;2\nLabel 3\nLabel 4;;1\n"Label with ; works too";5;1';

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

test('the import button opens a modal with a paste area', async ({ page }) => {
  await selectTopic(page);
  await editor(page).getByRole('button', { name: 'Import from spreadsheet/CSV…' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Paste cells here (Ctrl+V / ⌘V), drop a CSV file, or click to choose a file')).toBeVisible();
});

test('pasted cells show a preview and the number of options to add', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, readmeExample);
  await expect(modal.locator('tbody tr')).toHaveCount(5);
  await expect(modal.locator('tbody tr').nth(4)).toContainText('Label with ; works too');
  await expect(modal.getByRole('button', { name: 'Add 5 options' })).toBeEnabled();
});
